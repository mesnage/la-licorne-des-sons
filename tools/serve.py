#!/usr/bin/env python3
"""Local game preview: serve public game assets only, always revalidate edits."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = {'audio', 'assets', 'css', 'js', 'vendor'}

class GameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        target = (ROOT / path).resolve()
        parts = Path(path).parts
        if (not target.is_relative_to(ROOT) or any(p.startswith('.') for p in parts)
                or not (parts[0] in PUBLIC or len(parts) == 1 and target.suffix in {'.html', '.svg', '.ico'})
                or not target.is_file()):
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()
    print(f'Game preview: http://localhost:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), GameHandler).serve_forever()
