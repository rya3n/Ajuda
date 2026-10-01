"""Transcrição local de trechos WAV com Whisper, sem gravar áudio em disco."""

from __future__ import annotations

import importlib
from array import array
import math
import os
from pathlib import Path
import struct
import sys
import threading


SAMPLE_RATE = 16000
MAX_SECONDS = 20
MAX_AUDIO_BYTES = 1024 * 1024
MODEL_NAME = "faster-whisper-base"
ENGINE = "whisper"


class SpeechError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def invalid_audio(message="Envie um áudio WAV PCM mono de 16 bits e 16000 Hz."):
    return SpeechError(400, "invalid_audio", message)


def decode_wav(raw: bytes) -> bytes:
    """Valida o contêiner RIFF e devolve somente as amostras PCM."""
    if not isinstance(raw, bytes) or len(raw) < 44:
        raise invalid_audio()
    if len(raw) > MAX_AUDIO_BYTES:
        raise SpeechError(413, "invalid_audio", "O trecho de áudio enviado é longo demais.")
    if raw[:4] != b"RIFF" or raw[8:12] != b"WAVE" or struct.unpack_from("<I", raw, 4)[0] != len(raw) - 8:
        raise invalid_audio("O arquivo de áudio está incompleto ou não é um WAV válido.")
    offset = 12
    format_found = False
    pcm = None
    while offset < len(raw):
        if offset + 8 > len(raw):
            raise invalid_audio()
        chunk_id = raw[offset:offset + 4]
        size = struct.unpack_from("<I", raw, offset + 4)[0]
        start, end = offset + 8, offset + 8 + size
        if end + (size % 2) > len(raw):
            raise invalid_audio("O arquivo de áudio está incompleto.")
        if chunk_id == b"fmt ":
            if format_found or size < 16:
                raise invalid_audio()
            encoding, channels, rate, byte_rate, alignment, bits = struct.unpack_from("<HHIIHH", raw, start)
            if (encoding, channels, rate, byte_rate, alignment, bits) != (1, 1, SAMPLE_RATE, SAMPLE_RATE * 2, 2, 16):
                raise invalid_audio()
            format_found = True
        elif chunk_id == b"data":
            if pcm is not None or not format_found or not size or size % 2:
                raise invalid_audio()
            if size > SAMPLE_RATE * MAX_SECONDS * 2:
                raise SpeechError(413, "invalid_audio", "Envie trechos de voz de até 20 segundos.")
            pcm = raw[start:end]
        offset = end + (size % 2)
    if not format_found or pcm is None:
        raise invalid_audio()
    return pcm


class WhisperBackend:
    def __init__(self, model, numpy):
        self.model = model
        self.numpy = numpy

    def transcribe(self, pcm: bytes) -> str:
        levels = array('h', pcm)
        if sys.byteorder != 'little': levels.byteswap()
        if not levels or math.sqrt(sum(value * value for value in levels) / len(levels)) < 33:
            return ''
        # O modelo recebe amostras normalizadas em RAM a 16000 Hz.
        audio = self.numpy.frombuffer(pcm, dtype="<i2").astype(self.numpy.float32) / 32768.0
        segments, _ = self.model.transcribe(
            audio,
            language="pt",
            beam_size=5,
            temperature=0,
            condition_on_previous_text=False,
            no_speech_threshold=0.6,
            vad_filter=False,
        )
        return " ".join(segment.text.strip() for segment in segments if segment.text.strip()).strip()


def _load_whisper(dependencies: Path, model_path: Path):
    dependency_path = str(dependencies)
    if dependency_path not in sys.path:
        sys.path.insert(0, dependency_path)
    # Manter as dependências nativas disponíveis durante a importação local.
    dll_directory = None
    if os.name == "nt" and hasattr(os, "add_dll_directory"):
        dll_directory = os.add_dll_directory(str(dependencies / "ctranslate2"))
    try:
        whisper = importlib.import_module("faster_whisper")
        numpy = importlib.import_module("numpy")
        model = whisper.WhisperModel(
            str(model_path),
            device="cpu",
            compute_type="int8",
            cpu_threads=min(4, os.cpu_count() or 2),
            local_files_only=True,
        )
        return WhisperBackend(model, numpy)
    finally:
        if dll_directory is not None:
            dll_directory.close()


class SpeechService:
    """Um modelo compartilhado por servidor e uma transcrição por vez."""

    def __init__(self, directory: Path, loader=None):
        self.dependencies = directory / ".voice-deps"
        self.model_path = directory / "models" / MODEL_NAME
        self._loader = loader
        self._state = "unavailable"
        self._reason = "not_loaded"
        self._backend = None
        self._state_lock = threading.Lock()
        self._transcription_lock = threading.Lock()
        self._worker = None

    def warmup(self):
        with self._state_lock:
            if self._state in ("loading", "ready"):
                return
            if self._reason == "load_failed":
                return
            if self._loader is None:
                try:
                    if not (self.dependencies / "faster_whisper" / "__init__.py").is_file():
                        self._reason = "dependencies_missing"
                        return
                    if not all((self.model_path / name).is_file() for name in ("model.bin", "config.json", "tokenizer.json")):
                        self._reason = "model_missing"
                        return
                except OSError:
                    # O reconhecimento de voz é opcional: uma instalação sem
                    # permissão de leitura não deve impedir o site de abrir.
                    self._state = "unavailable"
                    self._reason = "unreadable"
                    return
            self._state = "loading"
            self._reason = ""
            self._worker = threading.Thread(target=self._prepare, name="local-speech-warmup", daemon=True)
            self._worker.start()

    def _prepare(self):
        try:
            backend = self._loader() if self._loader is not None else _load_whisper(self.dependencies, self.model_path)
            if backend is None or not callable(getattr(backend, "transcribe", None)):
                raise ValueError()
            with self._state_lock:
                self._backend = backend
                self._state = "ready"
                self._reason = ""
        except Exception:
            # Erros de DLL/importação/modelo são convertidos em estado seguro.
            # Não registrar texto de voz, caminhos internos ou erros externos.
            with self._state_lock:
                self._state = "unavailable"
                self._reason = "load_failed"

    def status(self) -> dict:
        self.warmup()
        with self._state_lock:
            state = self._state
        messages = {
            "loading": "Preparando o reconhecimento de voz local…",
            "ready": "Reconhecimento de voz local pronto.",
            "unavailable": "O reconhecimento de voz local ainda não está disponível.",
        }
        return {
            "available": state == "ready",
            "state": state,
            "engine": ENGINE,
            "language": "pt-BR",
            "sampleRate": SAMPLE_RATE,
            "maxSeconds": MAX_SECONDS,
            "message": messages[state],
        }

    def transcribe(self, raw: bytes) -> str:
        pcm = decode_wav(raw)
        self.warmup()
        with self._state_lock:
            state, backend = self._state, self._backend
        if state == "loading":
            raise SpeechError(503, "speech_loading", "O reconhecimento de voz está sendo preparado. Tente novamente em instantes.")
        if state != "ready":
            raise SpeechError(503, "speech_unavailable", "O reconhecimento de voz local está indisponível no momento.")
        if not self._transcription_lock.acquire(blocking=False):
            raise SpeechError(429, "speech_busy", "Outro trecho de voz está sendo reconhecido. Tente novamente em instantes.")
        try:
            # Sem frases pré-definidas: reconhecer livremente o trecho falado.
            return backend.transcribe(pcm)
        except Exception:
            raise SpeechError(503, "speech_unavailable", "Não foi possível reconhecer este trecho de voz. Tente novamente.") from None
        finally:
            self._transcription_lock.release()

