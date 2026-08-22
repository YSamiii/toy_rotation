import { runMigrations } from './store.js';

export async function exportBackup(store, imageRepository) {
  const state = structuredClone(store.state);
  const imageRefs = state.toys.map(toy => toy.imageRef).filter(ref => ref?.kind === 'personal' || ref?.kind === 'catalog');
  const images = {};
  for (const ref of imageRefs) {
    const dataUrl = await imageRepository.resolve(ref);
    if (dataUrl) images[`${ref.kind}:${ref.id}`] = dataUrl;
  }
  return { format: 'toy-rotation-clean-baseline-backup', schemaVersion: state.schemaVersion, exportedAt: new Date().toISOString(), state, images };
}

export async function restoreBackup(payload, store, imageRepository) {
  if (!payload || payload.format !== 'toy-rotation-clean-baseline-backup') throw new Error('unsupportedBackup');
  const state = runMigrations(payload.state);
  for (const [key, dataUrl] of Object.entries(payload.images || {})) {
    if (!key || !dataUrl) continue;
    const [kind, ...rest] = key.split(':'); const id = rest.join(':');
    if (kind === 'catalog') await imageRepository.importCatalog(id, dataUrl);
    else if (kind === 'personal') await imageRepository.importPersonal(id, dataUrl);
    else await imageRepository.importPersonal(key, dataUrl); // v1 backup compatibility
  }
  store.replace(state, 'restore');
}
