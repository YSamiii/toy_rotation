import assert from 'node:assert/strict';
import { emptyState } from '../src/data/schema.js';
import { currentShelfCollections, persistRotationSelection, refillCurrentRotation, selectRotation, setCustomPermanent, setManualShelfState } from '../src/domain/rotation-engine.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++}; const ok=(value,message)=>{assert.ok(value,message);checks++};
const toy=(id,{canonicalKey=id,progressionLevel=2,mechanic='shape_sorting'}={})=>({id,canonicalKey,productName:id,brand:`Brand ${id}`,minAgeMonths:12,maxAgeMonths:48,playMechanics:[mechanic],progressionLevel,challengeLevel:progressionLevel,skillCodes:[],categoryCode:'cognitive',set:{kind:'none'}});
function stateWith({manual=0,permanent=0}={}) {
  const state=emptyState(); state.settings.rotationSize=8; state.profile.childBirthDate='2024-01-01'; state.toys=Array.from({length:22},(_,index)=>toy(`toy-${index+1}`,{progressionLevel:(index%5)+1}));
  for(const item of state.toys.slice(0,permanent)) setCustomPermanent(state,item.id,true,{childAgeMonths:24,now:'2026-09-14'});
  const initial=selectRotation({toys:state.toys,childAgeMonths:24,size:8,childDevelopmentProfile:{shape_sorting:{currentLevel:3}}});
  persistRotationSelection(state,{selected:initial.selected,diagnostics:initial.diagnostics,now:'2026-09-14'});
  for(const item of state.toys.filter(item=>item.shelfMode !== 'permanent').slice(0,manual)) setManualShelfState(state,item.id,'on_shelf',{childAgeMonths:24,now:'2026-09-14'});
  return state;
}
const shelfCount=state=>currentShelfCollections(state);
let state=stateWith(); equal(shelfCount(state).rotation.length,8,'target 8 with no manual toys keeps 8 automatic toys');
state=stateWith({manual:2}); equal(shelfCount(state).manual.length,2,'two ordinary manual toys remain on shelf'); equal(shelfCount(state).rotation.length,6,'target 8 with manual 2 auto-fills only 6');
state=stateWith({manual:5}); equal(shelfCount(state).rotation.length,3,'target 8 with manual 5 auto-fills only 3');
state=stateWith({manual:8}); equal(shelfCount(state).rotation.length,0,'target 8 with manual 8 has no auto fill');
state=stateWith({manual:10}); equal(shelfCount(state).rotation.length,0,'manual count above target never forces automatic toys'); equal(shelfCount(state).manual.length,10,'manual toys above target are never removed');
state=stateWith({permanent:2}); equal(shelfCount(state).rotation.length,8,'two permanents do not reduce automatic target'); equal(shelfCount(state).permanent.length,2,'permanents remain visible outside target');
state=stateWith({manual:2,permanent:2}); equal(shelfCount(state).rotation.length,6,'manual toys occupy target while permanents do not'); equal(shelfCount(state).totalShelfCount,10,'target 8 plus two permanents yields 10 visible toys');
const manualIds=new Set(shelfCount(state).manualIds); ok(!shelfCount(state).rotationIds.some(id=>manualIds.has(id)),'manual toy is never selected again as automatic');
const beforeManual=[...shelfCount(state).manualIds]; refillCurrentRotation(state,{childAgeMonths:24,now:'2026-09-15'}); equal(shelfCount(state).manualIds.join(','),beforeManual.join(','),'manual shelf stays authoritative through refills');
const duplicate=state.toys.find(item=>item.id===beforeManual[0]); state.toys.push(toy('same-sku-copy',{canonicalKey:duplicate.canonicalKey})); refillCurrentRotation(state,{childAgeMonths:24,now:'2026-09-15'}); ok(!shelfCount(state).rotationIds.includes('same-sku-copy'),'canonical duplicate of a manual shelf toy is excluded from refill');
const advanced=stateWith({manual:2}); advanced.profile.developmentProfile={shape_sorting:{currentLevel:4}}; const result=refillCurrentRotation(advanced,{childAgeMonths:24,now:'2026-09-15'}); equal(result.selectedRotationCount,6,'Development Fit scores only the six remaining automatic slots');
equal(JSON.parse(JSON.stringify(state)).rotationHistory[0].toyIds.length,shelfCount(state).rotation.length,'manual slot plan remains persistence-safe after serialization');
const source=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/domain/rotation-engine.js',import.meta.url),'utf8')); ok(!source.includes('getRecognition') && !source.includes('fetch('),'slot refill remains zero AI and offline');
console.log(`rotation manual slot contract v0.11.6: PASS (${checks} assertions)`);
