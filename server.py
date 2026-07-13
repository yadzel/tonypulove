import json
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

DATA_FILE = os.path.join(os.path.dirname(__file__), "memories.json")
HOST = "0.0.0.0"
PORT = 8000


def load_data():
    if not os.path.exists(DATA_FILE):
        return {"notes": {}, "photos": {}}

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {"notes": {}, "photos": {}}


def save_data(payload):
    with open(DATA_FILE, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/memories":
            payload = load_data()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        file_path = parsed.path.lstrip("/") or "index.html"
        if file_path.startswith("api/"):
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        abs_path = os.path.join(os.path.dirname(__file__), file_path)
        if not os.path.exists(abs_path) or os.path.isdir(abs_path):
            abs_path = os.path.join(os.path.dirname(__file__), "index.html")

        mime_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
        }

        ext = os.path.splitext(abs_path)[1].lower()
        mime_type = mime_types.get(ext, "application/octet-stream")

        with open(abs_path, "rb") as fh:
            content = fh.read()

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime_type)
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/memories":
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON")
            return

        data = load_data()
        notes = payload.get("notes") if isinstance(payload.get("notes"), dict) else {}
        photos = payload.get("photos") if isinstance(payload.get("photos"), dict) else {}
        data["notes"] = notes
        data["photos"] = photos
        save_data(data)

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode("utf-8"))

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Serving on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
