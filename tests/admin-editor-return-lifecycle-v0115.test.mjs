import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const extract=name=>{const start=source.indexOf(`function ${name}(`);assert.notEqual(start,-1,`missing ${name}`);const body=source.indexOf('{',source.indexOf(')',start));let depth=0;for(let index=body;index<source.length;index++){if(source[index]==='{')depth++;if(source[index]==='}'&&--depth===0)return source.slice(start,index+1);}throw new Error(`unclosed ${name}`);};
const detail=extract('renderReportReviewDetail');
const workspace=extract('renderAdminWorkspaceBody');
const editor=extract('openCatalogManager');
assert.match(workspace,/__adminWorkspaceCallbacks/);
assert.match(detail,/data-report-action="edit"/);
assert.match(source,/document\.addEventListener\('click'.*event\.stopImmediatePropagation\(\).*openCatalogManager\(report\.catalogCanonicalKey,\{dialog,onReturn/s);
assert.match(source,/context\?\.dialog/);
assert.match(source,/if\(!context\) modalManager\.open\(dialog\)/);
assert.match(source,/context\?\.onClose.*addEventListener\('cancel'/s);
assert.match(editor,/onReturn/);
assert.match(editor,/if\(onReturn\).*saveEditor/s);
console.log('admin editor return lifecycle: PASS (8 assertions)');
