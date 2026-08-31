import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(process.argv[2] || '.');
const ignored=new Set(['node_modules','.git']);
const findings=[];
const patterns=[
  ['Google API key',/AIza[0-9A-Za-z_-]{20,}/],
  ['OpenAI-style API key',/\bsk-[A-Za-z0-9_-]{20,}/],
  ['GEMINI_API_KEY value',/\bGEMINI_API_KEY\s*[:=]\s*['"][^'"\s]{8,}/],
  ['ADMIN_TOKEN value',/\bADMIN_TOKEN\s*[:=]\s*['"][^'"\s]{8,}/],
  ['Cloudflare token',/\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN)\s*[:=]\s*['"][^'"\s]{8,}/],
  ['Bearer credential',/\bBearer\s+[A-Za-z0-9._~+\/-]{16,}/],
  ['Private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/]
];
async function walk(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const full=path.join(directory,entry.name);
    const relative=path.relative(root,full);
    if(entry.isDirectory()){await walk(full);continue;}
    if(entry.name==='.env'||entry.name.startsWith('.env.'))findings.push({file:relative,kind:'dotenv file'});
    if(!(await stat(full)).isFile())continue;
    const content=await readFile(full,'utf8').catch(()=>null);
    if(content===null)continue;
    for(const [kind,pattern] of patterns)if(pattern.test(content))findings.push({file:relative,kind});
  }
}
await walk(root);
if(findings.length){console.error(JSON.stringify({status:'FAIL',findings},null,2));process.exitCode=1;}
else console.log('sensitive staging scan: PASS (no credential values found)');
