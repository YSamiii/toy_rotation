import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createI18n } from '../src/ui/i18n.js';
import { CATEGORY_CODES, SKILL_CODES } from '../src/data/schema.js';

Object.defineProperty(globalThis, 'navigator', { value:{ language:'en-CA' }, configurable:true });

function makeStore(language) {
  return {
    state:{ settings:{ language } },
    update(mutator) { mutator(this.state); }
  };
}

test('English and Chinese dictionaries resolve all fixed UI keys used by the clean renderer', () => {
  const keys = [
    'home','library','rotation','wishlist','settings','standardCatalog','addToy','recognizeToy',
    'pendingReview','confirmAdd','retryRecognition','remove','edit','delete','save','cancel',
    'search','name','skills','minimumAge','maximumAge','image','language','theme','system',
    'light','dark','purchasePriority','overlaps','viewAll','high','medium','low','noOverlap',
    'adminMode','managerDashboard','backendDiagnostics','permanentDelete','confirmDelete',
    'exportBackup','restoreBackup','liked','neutral','disliked','onShelf','stored','generate','noData'
  ];
  for (const language of ['en', 'zh']) {
    const { t } = createI18n(makeStore(language));
    for (const key of keys) assert.notEqual(t(key), key, `${language}:${key}`);
    for (const code of CATEGORY_CODES) assert.notEqual(t(`category.${code}`), `category.${code}`);
    for (const code of SKILL_CODES) assert.notEqual(t(`skill.${code}`), `skill.${code}`);
  }
});

test('renderer has no hard-coded Chinese UI and every literal translation key is available in both languages', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /[\u3400-\u9fff]/, 'fixed Chinese UI must live in the dictionary');
  const keys = [...main.matchAll(/\bt\('([^']+)'/g)].map(match => match[1]);
  for (const language of ['en', 'zh']) {
    const { t } = createI18n(makeStore(language));
    for (const key of keys) assert.notEqual(t(key), key, `${language}:${key}`);
  }
});

test('theme defines the same semantic tokens in light and dark modes, while components only consume tokens', async () => {
  const [theme, appCss] = await Promise.all([
    readFile(new URL('../src/ui/theme.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8')
  ]);
  const tokens = ['bg','surface','surface-secondary','surface-elevated','text-primary','text-secondary','text-muted','border','input-bg','chip-bg','danger-bg','danger-text','accent','accent-text','focus','overlay','shadow'];
  for (const token of tokens) {
    assert.match(theme, new RegExp(`--${token}:`));
    assert.match(theme, new RegExp(`data-theme=\"dark\"[^}]*--${token}:`));
  }
  assert.doesNotMatch(appCss, /#[0-9a-f]{3,8}|rgba\(/i);
  assert.match(appCss, /env\(safe-area-inset-top\)/);
  assert.match(appCss, /overscroll-behavior: contain/);
});

test('mobile infrastructure protects safe areas, dialog scrolling, background scroll, and accidental double-tap zoom', async () => {
  const [index, theme, css, modal] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/theme.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/modal-manager.js', import.meta.url), 'utf8')
  ]);
  assert.match(index, /viewport-fit=cover/);
  assert.match(theme, /touch-action:manipulation/);
  assert.match(css, /100dvh/);
  assert.match(css, /-webkit-overflow-scrolling: touch/);
  assert.match(modal, /touchmove/);
  assert.match(modal, /event\.preventDefault\(\)/);
});

test('renderer does not render escaped newlines, legacy patch labels, or old runtime imports', async () => {
  const [main, index] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8')
  ]);
  assert.doesNotMatch(main, /\\\\n|>\\?n</);
  assert.doesNotMatch(main, /monkeyPatch|hotfix|definitive|legacy renderer/i);
  assert.doesNotMatch(index, /app-v0|final_v|patch/i);
});

test('offline worker caches every application module imported by the entry point', async () => {
  const [main, worker] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8')
  ]);
  const imports = [...main.matchAll(/from '(\.[^']+)'/g)].map(match => match[1].replace('./', './src/'));
  for (const imported of imports) assert.match(worker, new RegExp(imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
