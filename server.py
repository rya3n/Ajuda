"""Servidor local da demonstração e proxy simples para a API Gemini.

Execute ``python server.py`` e abra http://127.0.0.1:8080.
A integração usa automaticamente a chave original do projeto em .api-key.json.
Não existe formulário para cadastrar ou trocar a API na página.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
from urllib import error, parse, request

from speech import MAX_AUDIO_BYTES, SpeechError, SpeechService


MAX_REQUEST_BYTES = 128 * 1024
MAX_RESPONSE_BYTES = 1024 * 1024
GOOGLE_TIMEOUT_SECONDS = 25
DEFAULT_MODEL = "gemini-3.1-flash-lite"
FALLBACK_MODEL = "gemini-2.5-flash"
GOOGLE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1"}
KEY_PATTERN = re.compile(r"[\x21-\x7e]{10,256}\Z")


class NoRedirectHandler(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # O cabeçalho com a chave deve permanecer no endpoint fixo do Google.
        return None


GOOGLE_OPENER = request.build_opener(NoRedirectHandler())


class APIError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def invalid_request(message: str = "Confira os dados enviados e tente novamente.") -> APIError:
    return APIError(400, "invalid_request", message)


def valid_key(value: object, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        raise invalid_request("Informe uma chave de API válida.")
    value = value.strip()
    if allow_empty and not value:
        return ""
    if not KEY_PATTERN.fullmatch(value):
        raise invalid_request("Informe uma chave de API válida, sem espaços ou quebras de linha.")
    return value


def initial_key(directory: Path) -> str:
    try:
        config = json.loads((directory / ".api-key.json").read_text(encoding="utf-8"))
        return valid_key(config.get("apiKey")) if isinstance(config, dict) else ""
    except (OSError, ValueError, UnicodeError, APIError):
        return ""


def validate_chat(body: object) -> dict:
    if not isinstance(body, dict):
        raise invalid_request()
    contents = body.get("contents")
    if not isinstance(contents, list) or not 1 <= len(contents) <= 80:
        raise invalid_request("A conversa precisa conter de 1 a 80 mensagens.")
    total_text = 0

    def text_parts(parts: object, maximum: int, text_limit: int) -> list[dict]:
        nonlocal total_text
        if not isinstance(parts, list) or not 1 <= len(parts) <= maximum:
            raise invalid_request()
        clean = []
        for part in parts:
            if not isinstance(part, dict) or not isinstance(part.get("text"), str):
                raise invalid_request()
            text = part["text"].strip()
            if not text or len(text) > text_limit:
                raise invalid_request("Uma das mensagens está vazia ou é longa demais.")
            total_text += len(text)
            if total_text > 80000:
                raise invalid_request("A conversa está longa demais. Inicie uma nova conversa.")
            clean.append({"text": text})
        return clean

    clean_contents = []
    for item in contents:
        if not isinstance(item, dict) or item.get("role") not in ("user", "model"):
            raise invalid_request()
        clean_contents.append({"role": item["role"], "parts": text_parts(item.get("parts"), 10, 12000)})

    system = body.get("systemInstruction")
    if not isinstance(system, dict):
        raise invalid_request()
    clean_system = {"parts": text_parts(system.get("parts"), 4, 20000)}
    generation = body.get("generationConfig", {})
    if not isinstance(generation, dict):
        raise invalid_request()
    temperature = generation.get("temperature", 0.65)
    tokens = generation.get("maxOutputTokens", 1000)
    if (isinstance(temperature, bool) or not isinstance(temperature, (int, float))
            or not 0 <= temperature <= 2 or not math.isfinite(temperature)):
        raise invalid_request()
    if isinstance(tokens, bool) or not isinstance(tokens, int) or not 64 <= tokens <= 4096:
        raise invalid_request()
    return {
        "contents": clean_contents,
        "systemInstruction": clean_system,
        "generationConfig": {"temperature": temperature, "maxOutputTokens": tokens},
    }


def provider_error(exc: error.HTTPError) -> APIError:
    # A mensagem externa nunca é devolvida: pode conter dados ou detalhes da chave.
    reasons = set()
    try:
        payload = json.loads(exc.read(65536))
        provider = payload.get("error", {}) if isinstance(payload, dict) else {}
        details = provider.get("details", []) if isinstance(provider, dict) else []
        if isinstance(details, list):
            reasons = {part.get("reason") for part in details if isinstance(part, dict)}
    except (ValueError, OSError, TypeError):
        pass
    if exc.code in (401, 403) or "API_KEY_INVALID" in reasons:
        return APIError(401, "credentials", "A API original recusou a autenticação. As respostas locais continuam disponíveis.")
    if exc.code == 429:
        return APIError(429, "quota", "O limite da API foi atingido. Aguarde um pouco ou confira a cota da sua chave.")
    if exc.code == 400:
        return invalid_request("A API não aceitou esta conversa. Tente novamente ou inicie uma nova conversa.")
    return APIError(503, "unavailable", "A API está indisponível no momento. Tente novamente em instantes.")


def generate_reply(payload: dict, api_key: str, primary_model: str) -> dict:
    if not api_key:
        raise APIError(503, "not_configured", "A integração original do projeto está indisponível.")
    models = list(dict.fromkeys((primary_model, FALLBACK_MODEL)))
    data = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    for index, model in enumerate(models):
        upstream = request.Request(
            f"{GOOGLE_ENDPOINT}/{parse.quote(model, safe='')}:generateContent",
            data=data,
            headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            method="POST",
        )
        try:
            with GOOGLE_OPENER.open(upstream, timeout=GOOGLE_TIMEOUT_SECONDS) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                if len(raw) > MAX_RESPONSE_BYTES:
                    raise ValueError("Resposta longa demais")
                result = json.loads(raw)
            candidates = result.get("candidates", []) if isinstance(result, dict) else []
            candidate = candidates[0] if isinstance(candidates, list) and candidates else {}
            content = candidate.get("content", {}) if isinstance(candidate, dict) else {}
            parts = content.get("parts", []) if isinstance(content, dict) else []
            answer = "".join(
                part["text"] for part in parts
                if isinstance(part, dict) and isinstance(part.get("text"), str) and not part.get("thought")
            ).strip() if isinstance(parts, list) else ""
            if not answer:
                raise ValueError("Resposta sem texto")
            return {"text": answer, "model": model}
        except error.HTTPError as exc:
            if exc.code == 404 and index + 1 < len(models):
                exc.close()
                continue
            failure = provider_error(exc)
            exc.close()
            raise failure from None
        except (error.URLError, TimeoutError, OSError, ValueError, TypeError, RecursionError):
            raise APIError(503, "unavailable", "Não foi possível acessar a API agora. Confira a conexão e tente novamente.") from None
    raise APIError(503, "unavailable", "A API está indisponível no momento. Tente novamente em instantes.")


class DemoServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address: tuple, directory: Path, api_key: str | None = None, model: str | None = None, speech_service=None):
        self.directory = directory.resolve()
        self.api_key = initial_key(self.directory) if api_key is None else api_key
        self.model = model or DEFAULT_MODEL
        self.config_lock = threading.Lock()
        super().__init__(address, DemoHandler)
        self.speech = speech_service if speech_service is not None else SpeechService(self.directory)
        self.speech.warmup()


class DemoHandler(SimpleHTTPRequestHandler):
    server: DemoServer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(args[2].directory), **kwargs)

    def log_message(self, format, *args):
        # Não registrar URLs, corpos ou respostas externas da conversa.
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def send_json(self, status: int, payload: dict):
        data = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def send_failure(self, failure: APIError):
        self.send_json(failure.status, {"error": failure.code, "message": failure.message})

    def check_origin(self):
        host = self.headers.get("Host", "")
        try:
            parsed = parse.urlsplit("http://" + host)
            if (parsed.hostname not in LOOPBACK_HOSTS or parsed.port != self.server.server_port
                    or parsed.username is not None or parsed.password is not None
                    or parsed.path or parsed.query or parsed.fragment):
                raise ValueError()
        except ValueError:
            raise APIError(403, "invalid_request", "Acesse a demonstração pelo endereço local do servidor.") from None
        origin = self.headers.get("Origin")
        if origin is not None and origin != "http://" + host:
            raise APIError(403, "invalid_request", "Esta configuração só pode ser acessada pela própria demonstração.")
        if self.headers.get("Sec-Fetch-Site", "").lower() not in ("", "same-origin", "none"):
            raise APIError(403, "invalid_request", "Esta configuração só pode ser acessada pela própria demonstração.")

    def read_json(self) -> object:
        if self.headers.get("Transfer-Encoding"):
            raise invalid_request()
        if self.headers.get_content_type() != "application/json":
            raise APIError(415, "invalid_request", "Envie os dados em formato JSON.")
        length = self.headers.get("Content-Length", "")
        if not length.isdigit() or int(length) <= 0:
            raise invalid_request()
        if int(length) > MAX_REQUEST_BYTES:
            raise APIError(413, "invalid_request", "Os dados enviados são longos demais.")
        self.connection.settimeout(10)
        try:
            data = self.rfile.read(int(length))
            if len(data) != int(length):
                raise ValueError()
            return json.loads(data.decode("utf-8"))
        except (UnicodeError, ValueError, TimeoutError, OSError, RecursionError):
            raise invalid_request("Não foi possível ler os dados enviados.") from None

    def static_allowed(self) -> bool:
        path = parse.unquote(parse.urlsplit(self.path).path)
        segments = [segment.lower() for segment in path.replace("\\", "/").split("/") if segment]
        if any(segment.startswith(".") or segment in ("server.py", "speech.py", "setup_speech.py", "requirements-voice.txt", "models", "lib", "tests", "__pycache__") for segment in segments):
            return False
        target = Path(self.translate_path(self.path)).resolve()
        try:
            target.relative_to(self.server.directory)
        except ValueError:
            return False
        return True

    def do_GET(self):
        try:
            self.check_origin()
            path = parse.urlsplit(self.path).path
            if path == "/api/status":
                with self.server.config_lock:
                    configured = bool(self.server.api_key)
                self.send_json(200, {"configured": configured, "mode": "api" if configured else "local"})
            elif path == "/api/speech/status":
                self.send_json(200, self.server.speech.status())
            elif path.startswith("/api/"):
                self.send_failure(APIError(405, "invalid_request", "Use o método correto para esta operação."))
            elif not self.static_allowed():
                self.send_error(404)
            else:
                super().do_GET()
        except APIError as failure:
            self.send_failure(failure)

    def do_HEAD(self):
        try:
            self.check_origin()
            if parse.urlsplit(self.path).path.startswith("/api/"):
                self.send_failure(APIError(405, "invalid_request", "Use o método correto para esta operação."))
            elif not self.static_allowed():
                self.send_error(404)
            else:
                super().do_HEAD()
        except APIError as failure:
            self.send_failure(failure)

    def do_POST(self):
        try:
            self.check_origin()
            path = parse.urlsplit(self.path).path
            if path == "/api/transcribe":
                text = self.server.speech.transcribe(self.read_audio())
                self.send_json(200, {"text": text, "language": "pt-BR", "engine": self.server.speech.status()["engine"]})
                return
            if path != "/api/chat":
                self.send_failure(APIError(404, "invalid_request", "Operação não encontrada."))
                return
            body = self.read_json()
            payload = validate_chat(body)
            with self.server.config_lock:
                api_key = self.server.api_key
            self.send_json(200, generate_reply(payload, api_key, self.server.model))
        except APIError as failure:
            self.send_failure(failure)
        except SpeechError as failure:
            self.send_failure(failure)

    def read_audio(self) -> bytes:
        if self.headers.get("Transfer-Encoding"):
            raise invalid_request()
        if self.headers.get_content_type() not in ("audio/wav", "audio/x-wav"):
            raise APIError(415, "invalid_audio", "Envie o áudio em formato WAV.")
        length = self.headers.get("Content-Length", "")
        if not length.isdigit() or len(length) > 10 or int(length) <= 0:
            raise invalid_request()
        if int(length) > MAX_AUDIO_BYTES:
            raise APIError(413, "invalid_audio", "O trecho de áudio enviado é longo demais.")
        self.connection.settimeout(10)
        try:
            raw = self.rfile.read(int(length))
            if len(raw) != int(length):
                raise ValueError()
            return raw
        except (ValueError, TimeoutError, OSError):
            raise invalid_request("Não foi possível ler o áudio enviado.") from None

    def do_OPTIONS(self):
        self.send_failure(APIError(405, "invalid_request", "A API só pode ser acessada pela própria demonstração."))

    def list_directory(self, path):
        self.send_error(404)
        return None


def main():
    parser = argparse.ArgumentParser(description="Demonstração local Ponto Seguro")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("A porta precisa estar entre 1 e 65535.")
    server = DemoServer(("127.0.0.1", args.port), Path(__file__).parent)
    print(f"Ponto Seguro: http://127.0.0.1:{args.port}", flush=True)
    print("Integração original carregada." if server.api_key else "Integração original indisponível. Modo local.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
