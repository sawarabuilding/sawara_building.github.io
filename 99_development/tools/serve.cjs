const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.webp': 'image/webp', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let name;
  try { name = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
  if (name.endsWith('/')) name += 'index.html';
  const file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep) || name.split('/').some(p => p.startsWith('.')) || name.startsWith('/99_development/') || name.startsWith('/node_modules/')) { res.writeHead(403).end(); return; }
  fs.stat(file, (error, stat) => {
    if (!error && stat.isDirectory()) { res.writeHead(301, {Location: url.pathname + '/' + url.search}).end(); return; }
    if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
