import { normalizeToy } from '../data/schema.js';

export function validateSetGraph(toys) {
  const byId = new Map(toys.map(toy => [toy.id,toy]));
  return toys.filter(toy => toy.set?.kind === 'child').every(child => byId.has(child.set.parentId) && byId.get(child.set.parentId).set.kind === 'parent');
}
export function splitExplicitSet(parent, children) {
  if (parent.set?.kind !== 'parent' || parent.set.rotationMode !== 'split') return { parent, children: [] };
  const created = children.map((child, index) => normalizeToy({ ...child, id: crypto.randomUUID(), canonicalKey: `${parent.canonicalKey}:${index+1}`, brand: child.brand || parent.brand, minAgeMonths: child.minAgeMonths ?? parent.minAgeMonths, maxAgeMonths: child.maxAgeMonths ?? parent.maxAgeMonths, set: { kind:'child', parentId:parent.id, childIds:[], rotationMode:'split' } }));
  parent.set.childIds = created.map(child => child.id); return { parent, children: created };
}

// Split only where the catalog/AI explicitly marks a split set.  A generic set is
// never guessed into child toys; that would create false inventory records.
export function deriveExplicitChildren(parent, definition = {}) {
  if (parent.set?.kind !== 'parent' || parent.set.rotationMode !== 'split') return [];
  const supplied = Array.isArray(definition.children) ? definition.children : [];
  if (supplied.length) return supplied;
  const count = parseExplicitChildCount(definition, parent);
  if (!count) return [];
  const baseName = parent.productName || definition.name || 'Puzzle set';
  return Array.from({ length: count }, (_, index) => ({
    canonicalKey: `${parent.canonicalKey}:part-${index + 1}`,
    productName: `${baseName} · ${index + 1}`,
    names: parent.names,
    brand: parent.brand,
    categoryCode: parent.categoryCode,
    skillCodes: parent.skillCodes,
    playMechanics: parent.playMechanics,
    minAgeMonths: parent.minAgeMonths,
    maxAgeMonths: parent.maxAgeMonths,
    // This is an explicit inherited preview, never a catalog/public-image write.
    imageRef: parent.imageRef,
  }));
}

export function parseExplicitChildCount(definition = {}, parent = {}) {
  const explicit = Number(definition.childCount || definition.puzzleCount);
  if (Number.isInteger(explicit) && explicit > 1 && explicit <= 24) return explicit;
  const value = [definition.productName, definition.name, definition.nameZh, parent.productName, parent.names?.zh]
    .filter(Boolean).join(' ');
  const match = value.match(/(?:\b|\s)(\d{1,2})\s*(?:[- ]?in[- ]?1|合\s*1|款)/i);
  const count = Number(match?.[1]);
  return Number.isInteger(count) && count > 1 && count <= 24 ? count : 0;
}

export function ensureSplitSetChildren(toys, definitionsByKey) {
  toys ||= [];
  const existingByKey = new Map(toys.map(toy => [toy.canonicalKey, toy]));
  const additions = [];
  for (const parent of toys.filter(toy => toy.set?.kind === 'parent' && toy.set.rotationMode === 'split')) {
    const definition = definitionsByKey.get(parent.canonicalKey) || parent;
    const supplied = deriveExplicitChildren(parent, definition);
    const { children: planned } = splitExplicitSet(parent, supplied);
    const childIds = [];
    for (const child of planned) {
      const existing = existingByKey.get(child.canonicalKey);
      if (existing) { childIds.push(existing.id); continue; }
      additions.push(child); existingByKey.set(child.canonicalKey, child); childIds.push(child.id);
    }
    parent.set.childIds = childIds;
  }
  return additions;
}
