// Shared Toy Library mutations.  UI cards and future views use the same
// interest/shelf semantics instead of each carrying a local implementation.
export function setToyInterest(store, toyId, value) {
  store.update(state => {
    const toy = state.toys.find(item => item.id === toyId);
    if (toy) toy.interest = toy.interest === value ? null : value;
  }, 'interest');
}

export function toggleToyShelf(store, toyId) {
  store.update(state => {
    const toy = state.toys.find(item => item.id === toyId);
    if (!toy) return;
    toy.status = toy.status === 'active' ? 'stored' : 'active';
    if (toy.status === 'active') toy.lastActivatedAt = new Date().toISOString();
  }, 'shelf');
}
