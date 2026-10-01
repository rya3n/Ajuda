"""Prepare uma vez a transcrição local: python setup_speech.py.

O modelo Whisper multilíngue roda no próprio computador, sem outra API.
Dependências e modelo ficam neste projeto; reexecutar preserva arquivos prontos.
"""

from __future__ import annotations

import hashlib
from importlib import metadata
from pathlib import Path
import subprocess
import sys
from urllib import request


ROOT = Path(__file__).resolve().parent
DEPENDENCIES = ROOT / ".voice-deps"
MODELS = ROOT / "models"
MODEL_NAME = "faster-whisper-base"
MODEL_REVISION = "ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66"
MODEL_URL = f"https://huggingface.co/Systran/{MODEL_NAME}/resolve/{MODEL_REVISION}"
# Arquivos e tamanhos conferidos na revisão oficial do modelo. O checksum de
# model.bin é o SHA-256 publicado pelo repositório do mantenedor (LFS).
MODEL_FILES = (
    ("config.json", 2309, None),
    ("model.bin", 145217532, "d01c3014881c9c6f3133c182f3d2887eb6ca1c789a7538c5c007196857a0a6a9"),
    ("tokenizer.json", 2203239, None),
    ("vocabulary.txt", 459861, None),
    ("README.md", 1991, None),
)


def inside(path: Path, directory: Path = ROOT) -> Path:
    resolved = path.resolve()
    resolved.relative_to(directory.resolve())
    return resolved


def dependencies_ready() -> bool:
    check = (
        "import sys; sys.path.insert(0, sys.argv[1]); "
        "import faster_whisper; from pathlib import Path; "
        "Path(faster_whisper.__file__).resolve().relative_to(Path(sys.argv[1]).resolve()); "
        "from importlib.metadata import version; "
        "assert version('faster-whisper') == '1.2.1'"
    )
    return subprocess.run([sys.executable, "-c", check, str(DEPENDENCIES)],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0


def install_dependencies() -> None:
    inside(DEPENDENCIES)
    if dependencies_ready():
        print("Faster Whisper 1.2.1 já disponível; instalação preservada.", flush=True)
        return
    DEPENDENCIES.mkdir(exist_ok=True)
    subprocess.run([
        sys.executable, "-m", "pip", "install", "--disable-pip-version-check",
        "--index-url", "https://pypi.org/simple", "--target", str(DEPENDENCIES),
        "-r", str(ROOT / "requirements-voice.txt"),
    ], check=True)
    if not dependencies_ready():
        raise RuntimeError("As dependências não puderam ser carregadas; os arquivos existentes foram preservados.")


def verify_file(path: Path, size: int, digest: str | None) -> None:
    if path.stat().st_size != size:
        raise ValueError(f"O arquivo {path.name} não tem o tamanho oficial esperado.")
    if digest:
        checksum = hashlib.sha256()
        with path.open("rb") as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                checksum.update(chunk)
        if checksum.hexdigest() != digest:
            raise ValueError(f"O checksum de {path.name} não corresponde ao modelo oficial.")


def install_model() -> Path:
    inside(MODELS)
    MODELS.mkdir(exist_ok=True)
    model = inside(MODELS / MODEL_NAME, MODELS)
    # mkdir mantém a herança normal de permissões. Nenhuma pasta temporária
    # exclusiva do dono é movida para o modelo; o servidor poderá lê-lo.
    model.mkdir(exist_ok=True)
    for name, size, digest in MODEL_FILES:
        destination = inside(model / name, model)
        if destination.exists():
            verify_file(destination, size, digest)
            continue
        pending = inside(model / f".{name}.part", model)
        print(f"Baixando {name} do modelo oficial ({size / 1024 / 1024:.1f} MB)...", flush=True)
        received = 0
        next_progress = 16 * 1024 * 1024
        with request.urlopen(f"{MODEL_URL}/{name}?download=true", timeout=30) as source, pending.open("wb") as output:
            while chunk := source.read(1024 * 1024):
                received += len(chunk)
                if received > size:
                    raise ValueError(f"O download de {name} ultrapassou o tamanho oficial.")
                output.write(chunk)
                if received >= next_progress:
                    print(f"  {name}: {received / 1024 / 1024:.0f} MB de {size / 1024 / 1024:.0f} MB", flush=True)
                    next_progress += 16 * 1024 * 1024
        verify_file(pending, size, digest)
        pending.rename(destination)
    return model


def verify_model(model_path: Path) -> None:
    sys.path.insert(0, str(DEPENDENCIES))
    from faster_whisper import WhisperModel
    import numpy as np
    model = WhisperModel(str(model_path), device="cpu", compute_type="int8", local_files_only=True)
    segments, _ = model.transcribe(np.zeros(16000, dtype=np.float32), language="pt", vad_filter=True)
    list(segments)
    print(f"Pronto: Faster Whisper {metadata.version('faster-whisper')}, base multilíngue, CPU int8, áudio PCM de 16 kHz.", flush=True)


def main() -> int:
    try:
        install_dependencies()
        verify_model(install_model())
        return 0
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as failure:
        print(f"Não foi possível preparar a voz local: {failure}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
