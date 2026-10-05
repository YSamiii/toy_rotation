import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const activeCache = source.match(/const CACHE\s*=\s*['"]([^'"]+)['"]/ )?.[1];
assert.ok(activeCache, 'SW defines a discoverable active cache name');
let checks = 0;
const equal = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const ok = (value, message) => { assert.ok(value, message); checks++; };
const listeners = new Map();
const deleted = [];
const added = [];
const put = [];
const cache = { add: async path => added.push(path), put: async (request, response) => put.push([request.url, response]) };
const oldQaCache='toy-rotation-v0.11.5-candidate-layout-diagnostic4-20260910';
const oldStableCache='toy-rotation-v0.11.5-stable-20260911';
const staleManagedCaches=[oldQaCache,oldStableCache].filter(key=>key!==activeCache);
const caches = {
  open: async () => cache,
  keys: async () => [...new Set([activeCache, ...staleManagedCaches, 'unrelated-cache'])],
  delete: async key => { deleted.push(key); return true; },
  match: async () => undefined
};
let skipWaiting = false;
let claimed = false;
let requestedCacheMode = null;
const context = {
  caches,
  URL,
  Request,
  Response,
  self: {
    location: { origin: 'https://toy.test' },
    addEventListener: (type, callback) => listeners.set(type, callback),
    skipWaiting: async () => { skipWaiting = true; },
    clients: { claim: async () => { claimed = true; } }
  },
  fetch: async request => { requestedCacheMode = request.cache; return { ok: true, clone: () => ({ cached: true }) }; }
};
context.importScripts = () => { context.self.TOY_ROTATION_PACKAGED_ASSETS = []; };
vm.runInNewContext(source, context, { filename: 'sw.js' });

let activation;
listeners.get('activate')({ waitUntil: promise => { activation = promise; } });
await activation;
ok(!deleted.includes(activeCache), 'activate retains the dynamically discovered current cache');
ok(deleted.includes(oldQaCache) || oldQaCache===activeCache, 'activate deletes an older QA cache when it is stale');
ok(deleted.includes(oldStableCache) || oldStableCache===activeCache, 'activate deletes the historical Stable cache when it is stale');
ok(!deleted.includes('unrelated-cache'), 'activate retains unrelated caches');
assert.deepEqual([...deleted].sort(), [...staleManagedCaches].sort(), 'activate cleanup set contains exactly stale managed caches'); checks++;
equal(claimed, true, 'activate claims current clients after cleanup');

let installation;
listeners.get('install')({ waitUntil: promise => { installation = promise; } });
await installation;
ok(added.includes('./src/ui/app.css'), 'install precaches the current app stylesheet');
equal(skipWaiting, true, 'install advances the current worker');

let response;
listeners.get('fetch')({ request: new Request('https://toy.test/src/ui/app.css'), respondWith: promise => { response = promise; } });
ok(response, 'stylesheet request is handled by the current worker');
await response;
equal(requestedCacheMode, 'no-store', 'stylesheet refresh bypasses the HTTP cache');
equal(put[0][0], 'https://toy.test/src/ui/app.css', 'fresh stylesheet is written into the current cache');

assert.equal(checks, 11);
console.log(`sw css cache refresh v0.11.5: PASS (${checks} assertions)`);
