"""
StockMind AI - Server
HTTP API ve Statik Web Sunucusu
"""

import http.server
import socketserver
import urllib.parse
import json
import os
import sys
import traceback
from agent_engine import StockMindOrchestrator

# Windows UTF-8 çıktı desteği
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8000
orchestrator = StockMindOrchestrator()

class StockMindRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_HEAD(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/analyze':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return
        return super().do_HEAD()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        # API Endpoint: /api/analyze?ticker=THYAO
        if parsed_path.path == '/api/analyze':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            ticker = query_params.get('ticker', ['THYAO'])[0].upper().strip()
            
            try:
                result_data = orchestrator.run_pipeline(ticker)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                json_bytes = json.dumps(result_data, ensure_ascii=False).encode('utf-8')
                self.wfile.write(json_bytes)
            except (ConnectionAbortedError, BrokenPipeError):
                pass
            except Exception as e:
                print(f"[Server Error] API Hatası ({ticker}): {e}")
                traceback.print_exc()
                
                try:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    err_bytes = json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False).encode('utf-8')
                    self.wfile.write(err_bytes)
                except Exception:
                    pass

            return

        # Statik Dosya Servisi (index.html, style.css, app.js vb.)
        return super().do_GET()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), StockMindRequestHandler) as httpd:
        print(f"🚀 StockMind AI Sunucusu Çalışıyor: http://localhost:{PORT}")
        print("Durdurmak için Ctrl+C tuşlarına basabilirsiniz.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu kapatıldı.")

if __name__ == "__main__":
    run_server()
