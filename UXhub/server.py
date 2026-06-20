#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import re
import time
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "UIcheckReport"


def safe_name(value):
    name = unquote(value or "").strip().replace("\\", "/").split("/")[-1]
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(name).stem).strip("-._") or "report"
    return f"{stem}.html"


def parse_multipart(body, content_type):
    match = re.search(r"boundary=(.+)", content_type or "")
    if not match:
        return {}, {}
    boundary = ("--" + match.group(1).strip().strip('"')).encode()
    fields = {}
    files = {}
    for part in body.split(boundary):
        part = part.strip(b"\r\n")
        if not part or part == b"--":
            continue
        header_blob, _, payload = part.partition(b"\r\n\r\n")
        headers = header_blob.decode("utf-8", "ignore")
        payload = payload.rstrip(b"\r\n")
        name_match = re.search(r'name="([^"]+)"', headers)
        if not name_match:
            continue
        name = name_match.group(1)
        filename_match = re.search(r'filename="([^"]*)"', headers)
        if filename_match:
            files[name] = {
                "filename": filename_match.group(1),
                "content": payload,
            }
        else:
            fields[name] = payload.decode("utf-8", "ignore")
    return fields, files


class UXHubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != "/api/reports":
            self.json_response({"error": "Not found"}, 404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        fields, files = parse_multipart(self.rfile.read(length), self.headers.get("Content-Type", ""))
        upload = files.get("file")
        if not upload or not upload["content"]:
            self.json_response({"error": "Missing HTML file"}, 400)
            return
        original_name = safe_name(upload.get("filename") or fields.get("title") or "report")
        final_name = original_name
        target = REPORT_DIR / final_name
        if target.exists():
            final_name = f"{Path(original_name).stem}-{int(time.time())}.html"
            target = REPORT_DIR / final_name
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        target.write_bytes(upload["content"])
        self.json_response({
            "ok": True,
            "fileName": final_name,
            "url": f"UIcheckReport/{final_name}",
        })


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8765), UXHubHandler)
    print("Serving UXhub on http://localhost:8765/")
    server.serve_forever()
