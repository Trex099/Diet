from http.server import BaseHTTPRequestHandler

# Simple handler for testing
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(str('{"status": "ok", "message": "API is working!"}').encode())
        return 