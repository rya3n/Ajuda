"""Validação WAV, fluxo Whisper e endpoints locais com backend simulado."""

import http.client
from io import BytesIO
import json
from pathlib import Path
import struct
import sys
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import wave

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server
import speech


def make_wav(frames=1600, rate=16000, channels=1, width=2):
    output = BytesIO()
    with wave.open(output, "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(width)
        wav.setframerate(rate)
        wav.writeframes(b"\x01" * frames * channels * width)
    return output.getvalue()


class Backend:
    def __init__(self):
        self.parts = []

    def transcribe(self, pcm):
        self.parts.append(pcm)
        return "estou com medo de apresentar meu trabalho"


def ready_service(directory, backend=None):
    service = speech.SpeechService(directory, loader=lambda: backend or Backend())
    service.warmup()
    service._worker.join(2)
    if not service.status()["available"]:
        raise AssertionError("O modelo simulado não ficou pronto")
    return service


class WavTest(unittest.TestCase):
    def test_pcm_and_twenty_second_boundary(self):
        self.assertEqual(speech.decode_wav(make_wav(10)), b"\x01" * 20)
        self.assertEqual(len(speech.decode_wav(make_wav(320000))), 640000)
        with self.assertRaises(speech.SpeechError) as raised:
            speech.decode_wav(make_wav(320001))
        self.assertEqual(raised.exception.status, 413)

    def test_wrong_format_empty_truncated_and_non_wav_rejected(self):
        invalid = [b"", b"not a wav" * 20, make_wav(0), make_wav(rate=44100),
                   make_wav(channels=2), make_wav(width=1), make_wav(width=4), make_wav()[:-1]]
        for audio in invalid:
            with self.subTest(length=len(audio)):
                with self.assertRaises(speech.SpeechError) as raised:
                    speech.decode_wav(audio)
                self.assertEqual(raised.exception.code, "invalid_audio")

    def test_inconsistent_headers_and_compressed_encoding_rejected(self):
        for offset, fmt, value in ((20, "<H", 3), (28, "<I", 1), (32, "<H", 1), (40, "<I", 3201)):
            audio = bytearray(make_wav())
            struct.pack_into(fmt, audio, offset, value)
            with self.subTest(offset=offset):
                with self.assertRaises(speech.SpeechError):
                    speech.decode_wav(bytes(audio))
        audio = bytearray(make_wav())
        audio += b"bad"
        struct.pack_into("<I", audio, 4, len(audio) - 8)
        with self.assertRaises(speech.SpeechError):
            speech.decode_wav(bytes(audio))

    def test_maximum_upload_size_checked_before_decoding(self):
        with self.assertRaises(speech.SpeechError) as raised:
            speech.decode_wav(b"x" * (speech.MAX_AUDIO_BYTES + 1))
        self.assertEqual(raised.exception.status, 413)


class SpeechServiceTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)

    def tearDown(self):
        self.temporary.cleanup()

    def test_loading_is_async_cached_and_never_requires_package_in_test(self):
        started, release = threading.Event(), threading.Event()
        def load():
            started.set()
            release.wait(2)
            return Backend()
        loader = Mock(side_effect=load)
        service = speech.SpeechService(self.directory, loader=loader)
        try:
            service.warmup()
            self.assertTrue(started.wait(1))
            self.assertEqual(service.status()["state"], "loading")
            with self.assertRaises(speech.SpeechError) as raised:
                service.transcribe(make_wav())
            self.assertEqual(raised.exception.code, "speech_loading")
            service.warmup()
        finally:
            release.set()
            service._worker.join(2)
        self.assertEqual(service.status()["state"], "ready")
        service.warmup()
        self.assertEqual(loader.call_count, 1)

    def test_missing_installation_and_model_failures_return_safe_status(self):
        with patch.object(speech.importlib, "import_module") as importer:
            service = speech.SpeechService(self.directory)
            self.assertEqual(service.status()["state"], "unavailable")
            importer.assert_not_called()
        failure = "private internal path or recording text"
        service = speech.SpeechService(self.directory, loader=Mock(side_effect=RuntimeError(failure)))
        service.warmup()
        service._worker.join(2)
        self.assertEqual(service.status()["state"], "unavailable")
        with self.assertRaises(speech.SpeechError) as raised:
            service.transcribe(make_wav())
        self.assertNotIn(failure, str(raised.exception))

    def test_permission_denied_probe_keeps_site_available_and_can_recover(self):
        service = speech.SpeechService(self.directory)
        with patch.object(Path, "is_file", side_effect=PermissionError("private model path")):
            service.warmup()
            status = service.status()
        self.assertEqual(status["state"], "unavailable")
        self.assertFalse(status["available"])
        self.assertNotIn("private model path", json.dumps(status))
        with patch.object(Path, "is_file", return_value=True), patch.object(speech, "_load_whisper", return_value=Backend()):
            service.warmup()
            service._worker.join(2)
        self.assertTrue(service.status()["available"])

    def test_unrestricted_backend_receives_pcm_without_saving_recording(self):
        backend = Backend()
        service = ready_service(self.directory, backend)
        with patch.object(Path, "write_bytes") as write:
            text = service.transcribe(make_wav(5000))
        self.assertEqual(text, "estou com medo de apresentar meu trabalho")
        self.assertEqual(backend.parts, [b"\x01" * 10000])
        write.assert_not_called()

    def test_simultaneous_transcriptions_are_rejected_and_lock_is_released(self):
        started, release = threading.Event(), threading.Event()
        class SlowBackend(Backend):
            def transcribe(self, pcm):
                started.set()
                release.wait(2)
                return super().transcribe(pcm)
        service = ready_service(self.directory, SlowBackend())
        first_result = []
        worker = threading.Thread(target=lambda: first_result.append(service.transcribe(make_wav())))
        worker.start()
        try:
            self.assertTrue(started.wait(1))
            with self.assertRaises(speech.SpeechError) as raised:
                service.transcribe(make_wav())
            self.assertEqual(raised.exception.code, "speech_busy")
            self.assertEqual(raised.exception.status, 429)
        finally:
            release.set()
            worker.join(2)
        self.assertEqual(len(first_result), 1)
        self.assertTrue(service.transcribe(make_wav()))

    def test_backend_failure_does_not_poison_following_attempt(self):
        backend = Mock()
        backend.transcribe.side_effect = [RuntimeError("private audio data"), "fala reconhecida"]
        service = ready_service(self.directory, backend)
        with self.assertRaises(speech.SpeechError) as raised:
            service.transcribe(make_wav())
        self.assertEqual(raised.exception.code, "speech_unavailable")
        self.assertNotIn("private audio data", str(raised.exception))
        self.assertTrue(service.transcribe(make_wav()))
        self.assertTrue(service.status()["available"])

    def test_whisper_backend_normalizes_pcm_and_recognizes_unrestricted_portuguese(self):
        normalized = object()
        class FakeArray:
            def astype(self, dtype):
                self.dtype = dtype
                return self
            def __truediv__(self, divisor):
                self.divisor = divisor
                return normalized
        array = FakeArray()
        numpy = SimpleNamespace(frombuffer=Mock(return_value=array), float32=object())
        model = Mock()
        model.transcribe.return_value = (iter([SimpleNamespace(text=" Olá, "), SimpleNamespace(text=""), SimpleNamespace(text=" estou aqui. ")]), object())
        backend = speech.WhisperBackend(model, numpy)
        pcm = b"\x00\x80\xff\x7f"
        self.assertEqual(backend.transcribe(pcm), "Olá, estou aqui.")
        numpy.frombuffer.assert_called_once_with(pcm, dtype="<i2")
        self.assertIs(array.dtype, numpy.float32)
        self.assertEqual(array.divisor, 32768.0)
        model.transcribe.assert_called_once_with(normalized, language="pt", beam_size=5, temperature=0,
                                                condition_on_previous_text=False, no_speech_threshold=0.6, vad_filter=False)

    def test_whisper_model_loading_is_cpu_int8_and_offline(self):
        whisper, numpy = Mock(), Mock()
        with patch.object(speech.importlib, "import_module", side_effect=[whisper, numpy]), patch.object(speech.os, "name", "posix"), patch.object(speech.os, "cpu_count", return_value=16):
            backend = speech._load_whisper(self.directory, self.directory)
        whisper.WhisperModel.assert_called_once_with(str(self.directory), device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
        self.assertIs(backend.numpy, numpy)

    def test_silence_does_not_run_model_or_invent_transcription(self):
        model = Mock()
        backend = speech.WhisperBackend(model, Mock())
        self.assertEqual(backend.transcribe(b'\x00\x00' * 16000), '')
        model.transcribe.assert_not_called()


class SpeechEndpointTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.directory = Path(cls.temporary.name)
        cls.service = ready_service(cls.directory)
        cls.httpd = server.DemoServer(("127.0.0.1", 0), cls.directory, api_key="", speech_service=cls.service)
        cls.worker = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.worker.start()
        cls.host = f"127.0.0.1:{cls.httpd.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.worker.join(2)
        cls.temporary.cleanup()

    def call(self, method, path, body=None, headers=None):
        outgoing = {"Content-Type": "audio/wav"}
        outgoing.update(headers or {})
        connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=3)
        try:
            connection.request(method, path, body=body, headers=outgoing)
            response = connection.getresponse()
            data = response.read()
            return response.status, json.loads(data) if response.getheader("Content-Type", "").startswith("application/json") else data
        finally:
            connection.close()

    def test_status_and_transcription_succeed_without_google_or_disk_audio(self):
        status, body = self.call("GET", "/api/speech/status")
        self.assertEqual(status, 200)
        self.assertTrue(body["available"])
        self.assertEqual(body["sampleRate"], 16000)
        before = list(self.directory.rglob("*"))
        with patch.object(server.GOOGLE_OPENER, "open") as google:
            status, body = self.call("POST", "/api/transcribe", make_wav())
        self.assertEqual(status, 200)
        self.assertEqual(body["text"], "estou com medo de apresentar meu trabalho")
        self.assertEqual(body["engine"], "whisper")
        self.assertEqual(list(self.directory.rglob("*")), before)
        google.assert_not_called()

    def test_audio_endpoint_validates_format_upload_size_and_origin(self):
        for audio, headers, expected in (
            (b"not audio", {}, 400), (make_wav(), {"Content-Type": "application/json"}, 415),
            (make_wav(320001), {}, 413), (b"x", {"Content-Length": str(speech.MAX_AUDIO_BYTES + 1)}, 413),
            (make_wav(), {"Origin": "https://foreign.example"}, 403),
            (make_wav(), {"Sec-Fetch-Site": "cross-site"}, 403),
            (make_wav(), {"Host": "foreign.example:8080"}, 403),
        ):
            with self.subTest(expected=expected, headers=headers):
                self.assertEqual(self.call("POST", "/api/transcribe", audio, headers)[0], expected)
        self.assertEqual(self.call("GET", "/api/speech/status", headers={"Origin": "null"})[0], 403)

    def test_speech_sources_dependencies_and_models_cannot_be_downloaded(self):
        for name in ("speech.py", "setup_speech.py", "requirements-voice.txt", ".voice-deps/faster_whisper/__init__.py", "models/model.bin"):
            path = self.directory / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("private speech data")
            self.assertEqual(self.call("GET", "/" + name)[0], 404)

    def test_transcription_service_error_remains_sanitized_http_response(self):
        with patch.object(self.service, "transcribe", side_effect=speech.SpeechError(503, "speech_loading", "Preparando voz…")):
            status, body = self.call("POST", "/api/transcribe", make_wav())
        self.assertEqual(status, 503)
        self.assertEqual(body, {"error": "speech_loading", "message": "Preparando voz…"})


if __name__ == "__main__":
    unittest.main()
