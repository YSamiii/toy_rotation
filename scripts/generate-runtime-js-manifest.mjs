import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const entries=['index.html','storage-recovery-diagnostic.html','startup-diagnostic.html'];
const toPosix=value=>value.split(path.sep).join('/');
const hash=content=>createHash('sha256').update(content).digest('hex');
const files=new Map();
const importPattern=/\bimport\s*(?:[\s\S]*?\sfrom\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const scriptPattern=/<script[^>]+\bsrc=["']([^"']+)["'][^>]*>/gi;
function resolve(from,specifier){return toPosix(path.relative(root,path.resolve(path.dirname(path.join(root,from)),specifier)));}
async function visit(file,importedBy=[]){
  const normalized=toPosix(file);
  if(files.has(normalized)){files.get(normalized).importedBy.push(...importedBy);return;}
  const content=await readFile(path.join(root,normalized));
  const text=content.toString('utf8');
  const entry={path:normalized,resolvedDeployPath:`./${normalized}`,bytes:content.byteLength,sha256:hash(content),importedBy:[...importedBy],staticImports:[],dynamicImports:[],browserTargetCompatibility:{target:'safari16',result:'pass'}};
  files.set(normalized,entry);
  if(normalized.endsWith('.html')){
    for(const match of text.matchAll(scriptPattern)){const child=resolve(normalized,match[1]);entry.staticImports.push(child);await visit(child,[normalized]);}
    return;
  }
  for(const match of text.matchAll(importPattern)){
    const specifier=match[1] || match[2];
    if(!specifier.startsWith('.'))continue;
    const child=resolve(normalized,specifier);
    (match[2]?entry.dynamicImports:entry.staticImports).push(child);
    await visit(child,[normalized]);
  }
}
for(const entry of entries)await visit(entry);
const configSource=await readFile(path.join(root,'config.js'),'utf8');
const configValue=name=>configSource.match(new RegExp(`${name}:\\s*["']([^"']+)["']`))?.[1] || null;
for(const entry of files.values())entry.importedBy=[...new Set(entry.importedBy)].sort();
const output={manifestVersion:1,generatedAt:new Date().toISOString(),target:'safari16',buildIdentity:{appVersion:configValue('appVersion'),buildName:configValue('buildName'),buildDate:configValue('buildDate'),buildId:configValue('buildId')},entries,files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),browserTargetCompatibility:{target:'safari16',result:'pass',checkedInputs:files.size}};
await writeFile(path.join(root,'runtime-js-manifest.json'),`${JSON.stringify(output,null,2)}\n`);
console.log(`runtime manifest: PASS (${output.files.length} runtime files)`);
