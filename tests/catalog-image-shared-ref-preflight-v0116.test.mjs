import assert from 'node:assert/strict';
import { preflightCatalogImageSharedRef } from '../src/domain/catalog-image-shared-ref-preflight.js';

let checks = 0;
const ok = (value,message) => { assert.ok(value,message); checks++; };
const same = { key:'same-copy', canonicalKey:'same-copy', brand:'Brand', name:'Exact Product', aliases:['Exact Product'] };
const other = { key:'other-sku', canonicalKey:'other-sku', brand:'Brand', name:'Other Product', sku:'SKU-2' };
const candidate = { key:'candidate', canonicalKey:'candidate', brand:'Brand', name:'Exact Product', aliases:['Exact Product'] };
const rows = [same, other, candidate];
const result = (overrides = {}) => preflightCatalogImageSharedRef({ candidateKey:'candidate', candidateIdentity:candidate, catalogRows:rows, candidateRef:'https://cdn.example.test/a.jpg?v=1', ...overrides });

ok(result({ imageAssets:{} }).allowed,'unique ref is allowed');
ok(result({ imageAssets:{ 'same-copy':'https://cdn.example.test/a.jpg?v=1' } }).allowed,'same canonical identity representation may share');
ok(!result({ imageAssets:{ 'other-sku':'https://cdn.example.test/a.jpg?v=1' } }).allowed,'different canonical key and product sharing a ref is rejected');
ok(!result({ candidateIdentity:{ ...candidate, name:'SKU One', sku:'SKU-1' }, imageAssets:{ 'other-sku':'https://cdn.example.test/a.jpg?v=1' } }).allowed,'same brand with different SKU is rejected');
ok(!result({ candidateIdentity:{ ...candidate, name:'Series Set', sku:'SKU-1' }, imageAssets:{ 'other-sku':'https://cdn.example.test/a.jpg?v=1' } }).allowed,'same series with different SKU is rejected');
ok(!result({ candidateIdentity:{ ...candidate, name:'Mechanism Toy', sku:'SKU-1' }, imageAssets:{ 'other-sku':'https://cdn.example.test/a.jpg?v=1' } }).allowed,'same mechanism with different SKU is rejected');
ok(!result({ candidateRef:'HTTPS://CDN.EXAMPLE.TEST:443/a.jpg#fragment?v=1', imageAssets:{ 'other-sku':'https://cdn.example.test/a.jpg' } }).allowed,'normalized URL collision is rejected');
ok(!result({ candidateRef:'https://cdn.example.test/candidate.jpg', candidateFinalUrl:'https://assets.example.test/shared.jpg', imageAssets:{ 'other-sku':'https://cdn.example.test/other.jpg' }, existingMetadata:{ 'other-sku':{ finalUrl:'https://assets.example.test/shared.jpg' } } }).allowed,'redirect final-URL collision is rejected');
ok(!result({ candidateRef:'https://cdn.example.test/candidate.jpg', candidateHash:'hash-shared', imageAssets:{ 'other-sku':'https://cdn.example.test/other.jpg' }, existingMetadata:{ 'other-sku':{ contentHash:'hash-shared' } } }).allowed,'image hash collision is rejected');
const mappings = { 'other-sku':'https://cdn.example.test/a.jpg?v=1' };
const rejected = result({ imageAssets:mappings });
if (rejected.allowed) mappings.candidate = 'https://cdn.example.test/a.jpg?v=1';
ok(!Object.hasOwn(mappings,'candidate'),'rejected candidate causes no production mapping write');

assert.equal(checks,10);
console.log(`catalog image shared-ref preflight v0.11.6: PASS (${checks} assertions)`);
