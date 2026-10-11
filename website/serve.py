#!/usr/bin/env python3
"""OI- 算法可视化平台静态服务器：兼容 / 与 /OI-/ 两种前缀，SPA 回退到 index.html。"""
import http.server, socketserver, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def _rewrite(self):
        p = self.path.split('?')[0]
        if p == '/OI-' or p.startswith('/OI-/'):
            rest = p[len('/OI-'):] or '/'
            self.path = rest + ('?' + self.path.split('?')[1] if '?' in self.path else '')

    def do_GET(self):
        self._rewrite()
        fs = os.path.join(ROOT, self.path.lstrip('/').split('?')[0])
        if not os.path.exists(fs):
            self.path = '/index.html'
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('0.0.0.0', PORT), Handler) as httpd:
    print(f'OI- site serving {ROOT} on port {PORT}')
    httpd.serve_forever()
