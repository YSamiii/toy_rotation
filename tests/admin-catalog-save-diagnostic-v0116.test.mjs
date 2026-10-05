import assert from 'node:assert/strict';
import { AdminCatalogSaveDiagnostic, adminCatalogSaveErrorType } from '../src/features/admin-catalog-save-diagnostic.js';
import { AdminService } from '../src/features/admin-service.js';

let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const diagnostic = new AdminCatalogSaveDiagnostic({ clock:() => '2026-09-11T00:00:00.000Z', createId:() => 'attempt-1' });

ok(diagnostic.begin({ editedImagePresent:true }) === null, 'diagnostic is inert until explicitly started');
diagnostic.start();
const attemptId = diagnostic.begin({ editedImagePresent:true });
diagnostic.record(attemptId, 'catalog_image_response', { status:503, ok:false, imageDataUrl:'must-not-export-image', authorization:'must-not-export-authorization', canonicalKey:'must-not-export-key', productName:'must-not-export-product', requestBody:'must-not-export-request', responseBody:'must-not-export-response', apiKey:'must-not-export-api-key', token:'must-not-export-token', personalToyLibrary:'must-not-export-library', wishlistContents:'must-not-export-wishlist' });
diagnostic.record(attemptId, 'final_ui_state', { errorType:'catalogImageUploadFailed', modalOpen:true, errorRendered:true, editorRetained:true });
const exported = diagnostic.export({ release:'QA1' });
ok(exported.readOnly && exported.events.length === 3, 'export contains only the armed attempt metadata');
ok(exported.events[0].stage === 'submit_received' && exported.events[0].editedImagePresent, 'submit records image-edit presence without image data');
ok(exported.events[1].status === 503 && exported.events[1].ok === false, 'response metadata records only status and outcome');
ok(!JSON.stringify(exported).includes('must-not-export'), 'export excludes image, identity, request, response, credential, Library, and Wishlist values');
ok(adminCatalogSaveErrorType(new Error('catalogImageUploadFailed')) === 'catalogImageUploadFailed', 'known service codes remain identifiable');
ok(adminCatalogSaveErrorType(new TypeError('Failed to fetch')) === 'TypeError', 'unknown failures are normalized without their message');

const session = new Map([['toyRotationAdminVerifiedV095','true'],['toyRotationAdminTokenV095','test-token']]);
globalThis.window = { TOY_ROTATION_CONFIG:{ API_BASE:'https://api.example.test' } };
globalThis.sessionStorage = { getItem:key => session.get(key) || null };
const service = new AdminService({ store:{ state:{ catalogState:{ syncMetadata:{} }, catalog:[] }, update:() => {} }, catalog:{ updateAdminEdit:() => {} } });
const serviceTrace = [];
globalThis.fetch = async () => ({ status:503, ok:false });
await assert.rejects(() => service.replaceCatalogImage('private-key','data:image/jpeg;base64,secret',{ trace:(stage,details) => serviceTrace.push({ stage,...details }) }), /catalogImageUploadFailed/);
ok(serviceTrace.length === 1 && serviceTrace[0].stage === 'catalog_image_response' && serviceTrace[0].status === 503, 'image service trace exposes its HTTP outcome without its request payload');
globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
await assert.rejects(() => service.edit('private-key',{ imageUrl:'data:image/jpeg;base64,secret' },{ trace:(stage,details) => serviceTrace.push({ stage,...details }) }), /Failed to fetch/);
ok(serviceTrace.at(-1).stage === 'catalog_update_request_error' && serviceTrace.at(-1).errorType === 'TypeError', 'catalog update network failures are traced by type only');
globalThis.fetch = async () => ({ status:503, ok:false });
await assert.rejects(() => service.replaceCatalogImage('private-key','data:image/jpeg;base64,secret',{ trace:() => { throw new Error('diagnostic failed'); } }), /catalogImageUploadFailed/);
ok(true, 'a diagnostic callback failure cannot replace the original save failure');

console.log(`admin catalog save diagnostic v0.11.6: PASS (${checks} assertions)`);
