"""Testes do servidor local; o serviço Google é sempre simulado."""

import http.client
from io import BytesIO
import json
import os
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


API_KEY = "test_key_for_this_demo"
CHAT = {
    "contents": [{"role": "user", "parts": [{"text": "Oi, estou nervoso com a apresentação."}]}],
    "systemInstruction": {"parts": [{"text": "Responda em português, com acolhimento."}]},
    "generationConfig": {"temperature": 0.6, "maxOutputTokens": 800},
}


def google_response(parts=None):
    return BytesIO(json.dumps({"candidates": [{"content": {"parts": parts or [{"text": "Vamos conversar."}]}}]}).encode())


def google_error(status, reason="", message="private provider error"):
    body = {"error": {"message": message, "details": [{"reason": reason}]}}
    return HTTPError("https://example.invalid", status, "upstream error", {}, BytesIO(json.dumps(body).encode()))


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.directory = Path(cls.temporary.name)
        (cls.directory / "index.html").write_text("<p>Demonstração</p>", encoding="utf-8")
        (cls.directory / "server.py").write_text("private source")
        (cls.directory / "speech.py").write_text("private speech source")
        (cls.directory / ".env").write_text("private key")
        (cls.directory / ".api-key.json").write_text(json.dumps({"apiKey": API_KEY}))
        (cls.directory / ".git").mkdir()
        (cls.directory / ".git" / "config").write_text("private repo")
        (cls.directory / "tests").mkdir()
        (cls.directory / "tests" / "test.py").write_text("private test")
        (cls.directory / "assets").mkdir()
        cls.httpd = server.DemoServer(("127.0.0.1", 0), cls.directory, api_key="")
        cls.worker = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.worker.start()
        cls.host = f"127.0.0.1:{cls.httpd.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.worker.join(2)
        cls.temporary.cleanup()

    def setUp(self):
        self.httpd.api_key = ""

    def call(self, method, path, body=None, headers=None, raw=None):
        outgoing = {"Content-Type": "application/json"}
        outgoing.update(headers or {})
        if raw is None and body is not None:
            raw = json.dumps(body).encode()
        connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
        try:
            connection.request(method, path, body=raw, headers=outgoing)
            result = connection.getresponse()
            status, response_headers, text = result.status, dict(result.getheaders()), result.read().decode()
            parsed = json.loads(text) if text and response_headers.get("Content-Type", "").startswith("application/json") else text
            return status, response_headers, parsed
        finally:
            connection.close()

    def test_status_reports_automatic_api_without_exposing_or_changing_key(self):
        self.assertEqual(self.call("GET", "/api/status")[2], {"configured": False, "mode": "local"})
        self.httpd.api_key = API_KEY
        status, _, body = self.call("GET", "/api/status", headers={"Origin": "http://" + self.host})
        self.assertEqual(status, 200)
        self.assertEqual(body, {"configured": True, "mode": "api"})
        self.assertEqual(self.httpd.api_key, API_KEY)
        self.assertNotIn(API_KEY, json.dumps(body))
        for key in ("replacement_test_key", ""):
            self.assertEqual(self.call("POST", "/api/config", {"apiKey": key})[0], 404)
            self.assertEqual(self.httpd.api_key, API_KEY)

    def test_invalid_keys_cannot_be_header_injections(self):
        for key in (123, None, "tiny", "long_valid_key\nInjected: true", "a" * 257):
            with self.subTest(key=repr(key)):
                with self.assertRaises(server.APIError):
                    server.valid_key(key)
        self.assertEqual(self.httpd.api_key, "")

    def test_foreign_origin_host_and_fetch_site_rejected(self):
        for headers in ({"Origin": "https://foreign.example"}, {"Origin": "null"},
                        {"Host": "evil.example:" + str(self.httpd.server_port)},
                        {"Host": "127.0.0.1:99"}, {"Host": "user@" + self.host},
                        {"Sec-Fetch-Site": "cross-site"}, {"Sec-Fetch-Site": "same-site"}):
            with self.subTest(headers=headers):
                self.assertEqual(self.call("POST", "/api/chat", CHAT, headers)[0], 403)
        self.assertEqual(self.httpd.api_key, "")

    def test_loopback_alias_allowed_on_selected_port(self):
        for hostname in ("localhost", "[::1]"):
            host = f"{hostname}:{self.httpd.server_port}"
            self.assertEqual(self.call("GET", "/api/status", headers={"Host": host, "Origin": "http://" + host})[0], 200)

    def test_chat_requires_json_and_reasonable_body_size(self):
        self.assertEqual(self.call("POST", "/api/chat", raw=b"{bad json}")[0], 400)
        self.assertEqual(self.call("POST", "/api/chat", raw=b"{}", headers={"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.call("POST", "/api/chat", raw=b"x" * (server.MAX_REQUEST_BYTES + 1))[0], 413)
        self.assertEqual(self.call("POST", "/api/chat", body=[])[0], 400)
        self.assertEqual(self.call("POST", "/api/chat", body={})[0], 400)

    def test_methods_do_not_enable_cross_origin_requests(self):
        status, headers, _ = self.call("OPTIONS", "/api/chat")
        self.assertEqual(status, 405)
        self.assertNotIn("Access-Control-Allow-Origin", headers)
        self.assertEqual(self.call("GET", "/api/chat")[0], 405)
        self.assertEqual(self.call("HEAD", "/api/config")[0], 405)
        self.assertEqual(self.call("POST", "/api/unknown", {})[0], 404)

    def test_static_source_private_paths_and_directory_listings_blocked(self):
        for path in ("/.env", "/%2eenv", "/.api-key.json", "/%2eapi-key.json", "/.git/config", "/server.py", "/speech.py", "/models/model.bin", "/.voice-deps/vosk", "/tests/test.py", "/assets/", "/..\\.env"):
            with self.subTest(path=path):
                self.assertEqual(self.call("GET", path)[0], 404)
        status, headers, body = self.call("GET", "/?v=latest")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Cache-Control"], "no-cache")
        self.assertIn("Demonstração", body)
        self.assertEqual(self.call("HEAD", "/server.py")[0], 404)

    def test_missing_key_does_not_send_to_google(self):
        with patch.object(server.GOOGLE_OPENER, "open") as upstream:
            status, _, body = self.call("POST", "/api/chat", CHAT)
        self.assertEqual(status, 503)
        self.assertEqual(body["error"], "not_configured")
        upstream.assert_not_called()

    def test_send_google_header_history_and_all_answer_parts(self):
        self.httpd.api_key = API_KEY
        parts = [{"text": "internal private thought", "thought": True}, {"text": "Entendi. "}, {"text": "O que aconteceu depois?"}]
        with patch.object(server.GOOGLE_OPENER, "open", return_value=google_response(parts)) as upstream:
            status, _, body = self.call("POST", "/api/chat", CHAT)
        self.assertEqual(status, 200)
        self.assertEqual(body["text"], "Entendi. O que aconteceu depois?")
        sent = upstream.call_args.args[0]
        self.assertEqual(sent.get_header("X-goog-api-key"), API_KEY)
        self.assertNotIn(API_KEY, sent.full_url)
        self.assertEqual(json.loads(sent.data), CHAT)
        self.assertEqual(upstream.call_args.kwargs["timeout"], 25)
        self.assertTrue(sent.full_url.startswith(server.GOOGLE_ENDPOINT + "/"))

    def test_model_not_found_retries_only_fallback_model(self):
        self.httpd.api_key = API_KEY
        with patch.object(server.GOOGLE_OPENER, "open", side_effect=[google_error(404), google_response()]) as upstream:
            status, _, body = self.call("POST", "/api/chat", CHAT)
        self.assertEqual(status, 200)
        self.assertEqual(body["model"], server.FALLBACK_MODEL)
        self.assertEqual(upstream.call_count, 2)

    def test_invalid_credentials_and_quota_never_retry_or_expose_provider_error(self):
        self.httpd.api_key = API_KEY
        for upstream_status, reason, expected_status, expected_error in (
            (401, "", 401, "credentials"), (403, "", 401, "credentials"),
            (400, "API_KEY_INVALID", 401, "credentials"), (429, "", 429, "quota"),
            (400, "", 400, "invalid_request"), (503, "", 503, "unavailable"),
        ):
            with self.subTest(status=upstream_status):
                with patch.object(server.GOOGLE_OPENER, "open", side_effect=google_error(upstream_status, reason, API_KEY)) as upstream:
                    status, _, body = self.call("POST", "/api/chat", CHAT)
                self.assertEqual(status, expected_status)
                self.assertEqual(body["error"], expected_error)
                self.assertNotIn(API_KEY, json.dumps(body))
                self.assertEqual(upstream.call_count, 1)

    def test_connection_timeout_empty_malformed_and_long_google_reply_safe(self):
        self.httpd.api_key = API_KEY
        for result in (URLError(API_KEY), TimeoutError(API_KEY), BytesIO(b"not json"),
                       BytesIO(b"{}"), BytesIO(b"x" * (server.MAX_RESPONSE_BYTES + 1))):
            with self.subTest(kind=type(result).__name__):
                options = {"side_effect": result} if isinstance(result, Exception) else {"return_value": result}
                with patch.object(server.GOOGLE_OPENER, "open", **options) as upstream:
                    status, _, body = self.call("POST", "/api/chat", CHAT)
                self.assertEqual(status, 503)
                self.assertEqual(body["error"], "unavailable")
                self.assertNotIn(API_KEY, json.dumps(body))
                self.assertEqual(upstream.call_count, 1)

    def test_invalid_chat_payloads_never_reach_google(self):
        invalid = [[], {}, {**CHAT, "contents": []}, {**CHAT, "contents": [{"role": "system", "parts": [{"text": "oi"}]}]},
                   {**CHAT, "contents": [{"role": "user", "parts": [{"text": ""}]}]},
                   {**CHAT, "contents": [{"role": "user", "parts": [{"text": 12}]}]},
                   {**CHAT, "contents": [{"role": "user", "parts": [{"text": "x" * 12001}]}]},
                   {**CHAT, "systemInstruction": {}}, {**CHAT, "generationConfig": {"temperature": True}},
                   {**CHAT, "generationConfig": {"temperature": float("inf")}},
                   {**CHAT, "generationConfig": {"temperature": 10 ** 1000}},
                   {**CHAT, "contents": CHAT["contents"] * 81},
                   {**CHAT, "generationConfig": {"maxOutputTokens": True}},
                   {**CHAT, "generationConfig": {"maxOutputTokens": 9000}}]
        self.httpd.api_key = API_KEY
        with patch.object(server.GOOGLE_OPENER, "open") as upstream:
            for body in invalid:
                with self.subTest(body=repr(body)[:100]):
                    self.assertEqual(self.call("POST", "/api/chat", body)[0], 400)
        upstream.assert_not_called()


class ConfigurationTest(unittest.TestCase):
    def test_provider_redirects_cannot_forward_secret_header(self):
        original = server.request.Request(server.GOOGLE_ENDPOINT, headers={"x-goog-api-key": API_KEY})
        redirect = server.NoRedirectHandler().redirect_request(original, None, 302, "", {}, "https://foreign.example")
        self.assertIsNone(redirect)

    def test_existing_key_loads_automatically_for_each_server_start(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            (directory / ".api-key.json").write_text(json.dumps({"apiKey": API_KEY}), encoding="utf-8")
            self.assertEqual(server.initial_key(directory), API_KEY)
            for _ in range(2):
                httpd = server.DemoServer(("127.0.0.1", 0), directory)
                try:
                    self.assertEqual(httpd.api_key, API_KEY)
                    self.assertEqual(httpd.model, server.DEFAULT_MODEL)
                finally:
                    httpd.server_close()

    def test_environment_cannot_override_existing_project_api(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            (directory / ".api-key.json").write_text(json.dumps({"apiKey": API_KEY}), encoding="utf-8")
            with patch.dict(os.environ, {"GEMINI_API_KEY": "other_test_key", "GOOGLE_API_KEY": "another_test_key", "GEMINI_MODEL": "../../evil.example"}, clear=True):
                self.assertEqual(server.initial_key(directory), API_KEY)
                httpd = server.DemoServer(("127.0.0.1", 0), directory)
                try:
                    self.assertEqual(httpd.api_key, API_KEY)
                    self.assertEqual(httpd.model, server.DEFAULT_MODEL)
                finally:
                    httpd.server_close()
            (directory / ".api-key.json").unlink()
            with patch.dict(os.environ, {"GEMINI_API_KEY": API_KEY, "GOOGLE_API_KEY": API_KEY}, clear=True):
                self.assertEqual(server.initial_key(directory), "")

    def test_missing_or_invalid_project_key_file_does_not_leak_or_load(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            path = directory / ".api-key.json"
            self.assertEqual(server.initial_key(directory), "")
            invalid = [b"not json", b"\xff\xfe", b"[]", b"{}", b'null',
                       json.dumps({"apiKey": "valid_key\nInjected: true"}).encode(),
                       json.dumps({"apiKey": 123}).encode(), json.dumps({"apiKey": ""}).encode()]
            for raw in invalid:
                with self.subTest(payload=repr(raw)):
                    path.write_bytes(raw)
                    self.assertEqual(server.initial_key(directory), "")


if __name__ == "__main__":
    unittest.main()
