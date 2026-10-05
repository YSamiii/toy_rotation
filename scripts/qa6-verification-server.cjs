const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 4176);
const harnessRoot = path.resolve(__dirname, '..', 'tests');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.css':'text/css; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
const requests = [];
http.createServer((request, response) => {
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  if (requested === '/__qa7-r2-harness/request-log.json') {
    response.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
    return response.end(JSON.stringify(requests));
  }
  const isHarness = requested.startsWith('/__qa7-r2-harness/');
  const base = isHarness ? harnessRoot : root;
  const relative = isHarness ? requested.slice('/__qa7-r2-harness'.length) : requested === '/' ? '/index.html' : requested;
  const file = path.resolve(base, `.${relative}`);
  if (!file.startsWith(base)) { response.writeHead(403); return response.end(); }
  fs.readFile(file, (error, body) => {
    if (error) { requests.push({ requested, status:404 }); response.writeHead(404); return response.end('not found'); }
    requests.push({ requested, status:200 });
    response.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(body);
  });
}).listen(port, '127.0.0.1');
