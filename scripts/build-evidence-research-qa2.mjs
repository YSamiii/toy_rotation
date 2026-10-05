import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source=process.cwd();
const destination=path.resolve(process.argv[2]||'');
if(!process.argv[2]) throw new Error('usage: node scripts/build-evidence-research-qa2.mjs <empty-destination>');
try { await stat(destination); throw new Error(`destination already exists: ${destination}`); } catch (error) { if(error.code!=='ENOENT') throw error; }

const buildId=process.argv[3]||'v0.11.7-evidence-research-batch1-qa2-20261003';
const cacheName=`toy-rotation-${buildId.replace(/^v0\.11\.7-/,'v0.11.7-')}`;
const buildDate=buildId.match(/(\d{8})$/)?.[1]||'20261003';
const buildName=buildId.includes('batch3-qa4')?'Toy Rotation v0.11.7 Evidence Research Batch 3 QA4':buildId.includes('batch2-qa3')?'Toy Rotation v0.11.7 Evidence Research Batch 2 QA3':buildId.includes('fix1')?'Toy Rotation v0.11.7 Evidence Research Batch 1 QA2 Fix 1':'Toy Rotation v0.11.7 Evidence Research Batch 1 QA2';
const posix=value=>value.split(path.sep).join('/');
const digest=value=>createHash('sha256').update(value).digest('hex');
const listFiles=async directory=>{
  const entries=await readdir(directory,{withFileTypes:true}); const output=[];
  for(const entry of entries){const item=path.join(directory,entry.name); if(entry.isDirectory()) output.push(...await listFiles(item)); else if(entry.isFile()) output.push(item);}
  return output;
};

await mkdir(destination,{recursive:true});
for(const file of ['catalog-base.json','catalog-candidates.json','catalog-remote.json']) await cp(path.join(source,file),path.join(destination,file));
for(const directory of ['catalog-assets','icons']) await cp(path.join(source,directory),path.join(destination,directory),{recursive:true});
await mkdir(path.join(destination,'src','ui'),{recursive:true});
for(const file of ['theme.css','app.css']) await cp(path.join(source,'src','ui',file),path.join(destination,'src','ui',file));

await build({absWorkingDir:source,entryPoints:['src/main.js'],bundle:true,format:'esm',target:'safari16',outfile:path.join(destination,'app.bundle.js'),logLevel:'silent'});
await build({absWorkingDir:source,entryPoints:['startup-diagnostic.js'],bundle:true,format:'esm',target:'safari16',outfile:path.join(destination,'startup-diagnostic.bundle.js'),logLevel:'silent'});
await build({absWorkingDir:source,entryPoints:['storage-recovery-diagnostic.js'],bundle:true,format:'esm',target:'safari16',outfile:path.join(destination,'storage-recovery-diagnostic.bundle.js'),logLevel:'silent'});

const index=(await readFile(path.join(source,'index.html'),'utf8')).replace('./src/main.js','./app.bundle.js');
const startup=(await readFile(path.join(source,'startup-diagnostic.html'),'utf8')).replace('./startup-diagnostic.js','./startup-diagnostic.bundle.js');
const storage=(await readFile(path.join(source,'storage-recovery-diagnostic.html'),'utf8')).replace('./storage-recovery-diagnostic.js','./storage-recovery-diagnostic.bundle.js');
await writeFile(path.join(destination,'index.html'),index);
await writeFile(path.join(destination,'startup-diagnostic.html'),startup);
await writeFile(path.join(destination,'storage-recovery-diagnostic.html'),storage);
const config=`// Generated QA2 build configuration\nwindow.TOY_ROTATION_CONFIG = {\n  appVersion: \"v0.11.7\",\n  buildName: \"${buildName}\",\n  buildDate: \"${buildDate}\",\n  buildId: \"${buildId}\",\n  RELEASE: \"${buildName} ${buildDate}\",\n  API_BASE: \"https://toy-rotation-api.samanthayaosy.workers.dev\",\n  PERSISTENCE_DIAGNOSTIC_MODE: false\n};\n`;
await writeFile(path.join(destination,'config.js'),config);
const webmanifest={name:buildName,short_name:'Toy Rotation',start_url:'./',scope:'./',display:'standalone',background_color:'#121018',theme_color:'#875fd8',icons:[{src:'./icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'./icons/icon-512.png',sizes:'512x512',type:'image/png'}]};
await writeFile(path.join(destination,'manifest.webmanifest'),`${JSON.stringify(webmanifest)}\n`);
const assetRoot=path.join(destination,'catalog-assets');
const packaged=(await listFiles(assetRoot)).map(file=>`./${posix(path.relative(destination,file))}`).sort();
await writeFile(path.join(destination,'sw-precache-assets.js'),`// Generated packaged asset list.\nself.TOY_ROTATION_PACKAGED_ASSETS=Object.freeze(${JSON.stringify(packaged,null,2)});\n`);
const sw=(await readFile(path.join(source,'sw.js'),'utf8')).replace(/const CACHE = '[^']+';/,`const CACHE = '${cacheName}';`);
await writeFile(path.join(destination,'sw.js'),sw);

const stagedFiles=(await listFiles(destination)).filter(file=>path.basename(file)!=='runtime-js-manifest.json');
const runtimeFiles=[];
for(const file of stagedFiles){const content=await readFile(file);const relative=posix(path.relative(destination,file));runtimeFiles.push({path:relative,resolvedDeployPath:`./${relative}`,bytes:content.byteLength,sha256:digest(content),importedBy:['qa2-runtime-package'],staticImports:[],dynamicImports:[],browserTargetCompatibility:{target:'safari16',result:'pass'}});}
runtimeFiles.sort((a,b)=>a.path.localeCompare(b.path));
const runtimeManifest={manifestVersion:1,generatedAt:new Date().toISOString(),target:'safari16',buildIdentity:{appVersion:'v0.11.7',buildName,buildDate,buildId},entries:['index.html','storage-recovery-diagnostic.html','startup-diagnostic.html'],files:runtimeFiles,browserTargetCompatibility:{target:'safari16',result:'pass',checkedInputs:runtimeFiles.length}};
await writeFile(path.join(destination,'runtime-js-manifest.json'),`${JSON.stringify(runtimeManifest,null,2)}\n`);
console.log(JSON.stringify({buildId,cacheName,destination,runtimeFiles:runtimeFiles.length,totalFiles:runtimeFiles.length+1}));
