// Privacy-safe structural fixture derived from the 2026-09-27 17:48 iPhone
// audit. IDs and image references are synthetic; dates/reasons/counts match.
import {emptyState} from '../src/data/schema.js';
import {PARENT,CHILDREN} from './md1460-migration-simulator-v0116.mjs';

const legacy=['mideer-my-first-puzzle-dinosaurs-6in1','mideer-first-artist-cute-dinosaurs'];
const early='2026-09-15T16:18:07.493Z',late='2026-09-17T15:32:14.526Z';
export function realOwnerStructure() {
  const state=emptyState();
  const childIds=CHILDREN.map((_,index)=>`current-child-${index+1}`);
  state.toys=[{id:'current-parent',canonicalKey:PARENT,brand:'Mideer',productName:'Dinosaurs',sku:'MD1460',skillCodes:[],playMechanics:[],
    legacyCanonicalKeys:[...legacy,PARENT],imageRef:{kind:'personal',id:'synthetic-current-parent-photo'},
    set:{kind:'parent',rotationMode:'split',childIds}},
    ...CHILDREN.map((canonicalKey,index)=>({id:childIds[index],canonicalKey,brand:'Mideer',productName:`Part ${index+1}`,
      skillCodes:[],playMechanics:[],imageRef:{kind:'placeholder'},
      set:{kind:'child',parentId:'current-parent',parentCanonicalKey:PARENT,partIndex:index+1,rotationMode:'split'}}))];
  for(const key of legacy)state.catalogState.tombstones[key]={deleted:false,mergedInto:PARENT,repairedBy:'qa6-md1460-canonical-v1'};
  state.catalogState.removedOwnerships={
    'historical-parent-1':{canonicalKey:PARENT,removedAt:early,reason:'parent_delete_cascade',ownership:{kind:'parent'},preservedUserData:{imageRef:{kind:'personal',id:'synthetic-old-parent-photo-1'}}},
    'historical-parent-2':{canonicalKey:PARENT,removedAt:late,reason:'parent_delete_cascade',ownership:{kind:'parent'},preservedUserData:{imageRef:{kind:'personal',id:'synthetic-old-parent-photo-2'}}}
  };
  CHILDREN.forEach((canonicalKey,index)=>{state.catalogState.removedOwnerships[`historical-child-${index+1}`]={canonicalKey,parentCanonicalKey:PARENT,removedAt:late,reason:'parent_delete_cascade',ownership:{kind:'child'},preservedUserData:{imageRef:{kind:'placeholder'}}};});
  state.catalogState.removedOwnerships['historical-child-6-earlier']={canonicalKey:CHILDREN[5],parentCanonicalKey:PARENT,removedAt:early,reason:'parent_delete_cascade',ownership:{kind:'child'},preservedUserData:{imageRef:{kind:'placeholder'}}};
  state.wishlist=[];state.rotationHistory=[];
  const snapshots=['toyRotation.cleanBaseline','toyRotation.cleanBaseline.lastKnownGood',...Array.from({length:3},(_,index)=>`toyRotation.cleanBaseline.snapshot-${index+1}`)]
    .map(key=>({key,value:structuredClone(state)}));
  return {state,snapshots};
}
