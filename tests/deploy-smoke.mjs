import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(process.argv[2] || '.');
const manifest=JSON.parse(await readFile(path.join(root,'runtime-js-manifest.json'),'utf8'));
const mime=file=>file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')||file.endsWith('.webmanifest')?'application/json':'text/html';
const server=createServer(async(req,res)=>{try{const requested=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.resolve(root,requested==='/'?'index.html':requested.slice(1));if(!file.startsWith(root))throw new Error('outside root');const info=await stat(file);if(!info.isFile())throw new Error('not file');res.writeHead(200,{'content-type':mime(file)});res.end(await readFile(file));}catch{res.writeHead(404);res.end('not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try {
  for(const entry of manifest.files){const response=await fetch(`${origin}/${entry.path}`);assert.equal(response.status,200,entry.path);const body=Buffer.from(await response.arrayBuffer());assert.equal(body.byteLength,entry.bytes,`${entry.path} bytes`);}
  for(const pathName of ['index.html','manifest.webmanifest','config.js','src/main.js','sw.js','runtime-js-manifest.json'])assert.equal((await fetch(`${origin}/${pathName}`)).status,200,pathName);
  console.log(`deploy smoke: PASS (${manifest.files.length} runtime files)`);
} finally { await new Promise(resolve=>server.close(resolve)); }
