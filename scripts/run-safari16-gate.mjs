import * as esbuild from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const reportDirectory=path.resolve(root,'..','..','reports');
const jsonPath=path.join(reportDirectory,'safari16-compatibility-gate-20260831.json');
const markdownPath=path.join(reportDirectory,'safari16-compatibility-gate-20260831.md');
const base={ entry:'src/main.js', target:'safari16', format:'esm', esbuildVersion:esbuild.version, generatedAt:new Date().toISOString() };
await mkdir(reportDirectory,{recursive:true});
try {
  const result=await esbuild.build({ absWorkingDir:root, entryPoints:[base.entry], bundle:true, format:base.format, target:base.target, write:false, metafile:true, logLevel:'silent' });
  const report={ ...base, status:'PASS', inputCount:Object.keys(result.metafile.inputs).length, inputs:Object.keys(result.metafile.inputs).sort(), errors:[] };
  await writeFile(jsonPath,`${JSON.stringify(report,null,2)}\n`);
  await writeFile(markdownPath,`# Safari 16 compatibility gate\n\n- Entry: \`${report.entry}\`\n- Target: \`${report.target}\`\n- Format: \`${report.format}\`\n- esbuild: \`${report.esbuildVersion}\`\n- Runtime module inputs: **${report.inputCount}**\n- Result: **PASS**\n`);
  console.log(JSON.stringify(report));
} catch (failure) {
  const errors=(failure.errors || []).map(error=>({ file:error.location?.file || null, line:error.location?.line || null, column:error.location?.column || null, message:error.text || String(error) }));
  const report={ ...base, status:'FAIL', inputCount:0, errors };
  await writeFile(jsonPath,`${JSON.stringify(report,null,2)}\n`);
  await writeFile(markdownPath,`# Safari 16 compatibility gate\n\n- Entry: \`${report.entry}\`\n- Target: \`${report.target}\`\n- Format: \`${report.format}\`\n- esbuild: \`${report.esbuildVersion}\`\n- Result: **FAIL**\n\n\`\`\`json\n${JSON.stringify(errors,null,2)}\n\`\`\`\n`);
  console.error(JSON.stringify(report));
  process.exitCode=1;
}
