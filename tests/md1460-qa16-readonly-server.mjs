// Serves frozen QA16 staging plus a test-only viewport harness. Never writes
// staging files, caches, or owner data. Run on a unique localhost origin.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'');
const harness=new URL('./md1460-iphone-viewport-smoke.html',import.meta.url);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
  try{
    const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=requested==='/__md1460_smoke.html'?harness:path.resolve(root,`.${requested==='/'?'/index.html':requested}`);
    if(file!==harness&&!file.startsWith(root+path.sep))throw Error('outside root');
    const bytes=await readFile(file);
    res.writeHead(200,{'content-type':mime[path.extname(file.toString())]||'application/octet-stream','cache-control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404);res.end('not found')}
}).listen(Number(process.argv[3]||4187),'127.0.0.1');
