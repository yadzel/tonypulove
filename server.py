import json
import os
import sqlite3
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

DB_PATH = os.path.join(os.path.dirname(__file__), "memories.db")
HOST = "0.0.0.0"
PORT = 8000


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def load_data():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT key, value FROM memories").fetchall()
    conn.close()

    notes = {}
    photos = {}
    for key, value in rows:
        if key.startswith("note:"):
            notes[key[5:]] = value
        elif key.startswith("photo:"):
            photos[key[6:]] = value
    return {"notes": notes, "photos": photos}


def save_data(payload):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM memories")

    for key, value in payload.get("notes", {}).items():
        conn.execute("INSERT INTO memories (key, value) VALUES (?, ?)", (f"note:{key}", value))

    for key, value in payload.get("photos", {}).items():
        conn.execute("INSERT INTO memories (key, value) VALUES (?, ?)", (f"photo:{key}", value))

    conn.commit()
    conn.close()


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/memories":
            payload = load_data()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
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
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
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
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Serving on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
