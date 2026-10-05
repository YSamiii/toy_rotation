import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { canonicalKey, emptyState } from '../src/data/schema.js';

const data=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url)));
const state=emptyState();const store={get state(){return state;},update(mutator){mutator(state);}};
const catalog=new CatalogRepository(store);catalog.applyBase(data.entries);
const added=data.entries.filter(item=>item.key.startsWith('vtech-')&&['vtech-musical-rhymes-book','vtech-chomp-count-dino','vtech-kidibeats-drum-set','vtech-drop-go-dump-truck','vtech-animal-rhymes-music-book','vtech-busy-learners-music-activity-cube','vtech-nest-build-tree-stacker','vtech-click-count-remote','vtech-peek-turn-discovery-book','vtech-create-discover-musical-piano','vtech-press-squish-flip-phone','vtech-put-take-peek-a-boo-house'].includes(item.key));
const keys=data.entries.map(item=>canonicalKey(item.key));assert.equal(new Set(keys).size,keys.length);
const addedKeys=new Set(added.map(item=>item.key));const addedIdentities=added.map(item=>`${item.brand.trim().toLowerCase()}|${String(item.nameEn||item.name).trim().toLowerCase()}`);assert.equal(new Set(addedIdentities).size,addedIdentities.length);for(const item of data.entries.filter(item=>!addedKeys.has(item.key))){assert.ok(!addedIdentities.includes(`${item.brand.trim().toLowerCase()}|${String(item.nameEn||item.name).trim().toLowerCase()}`));}
for(const item of added){const resolved=catalog.getByKey(item.key);assert.ok(resolved);assert.equal(resolved.canonicalKey,canonicalKey(item.key));assert.equal(catalog.search({query:item.nameEn}).filter(match=>match.canonicalKey===resolved.canonicalKey).length,1);}
assert.equal(catalog.active.length,data.entries.length-1,'legacy MD1460 parent redirects to the surviving canonical');
console.log('catalog duplicate safety: PASS (809 assertions)');
