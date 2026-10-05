import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(process.argv[2]||'.');
const port=Number(process.argv[3]||45872);
const mime=file=>file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')||file.endsWith('.webmanifest')?'application/json':file.endsWith('.png')?'image/png':file.endsWith('.jpg')||file.endsWith('.jpeg')?'image/jpeg':file.endsWith('.webp')?'image/webp':'text/html';
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.resolve(root,pathname==='/'?'index.html':pathname.slice(1));if(!file.startsWith(root))throw new Error('outside');const info=await stat(file);if(!info.isFile())throw new Error('not-file');res.writeHead(200,{'content-type':mime(file),'cache-control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end('not found');}}).listen(port,'127.0.0.1',()=>console.log(`artifact-server:${port}`));
