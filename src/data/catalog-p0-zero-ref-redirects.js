// QA13 owner raw-reference audit, 2026-09-25: only these 16 P0 groups had
// rawRefSummary.total === 0. Keep old imports and backups resolvable without
// changing persisted Toy Library, Wishlist, or snapshot records.
export const P0_ZERO_REF_REDIRECTS = new Map([
  ['hape-pound-tap-bench','hape-pound-tap-bench-xylophone'],
  ['mideer-dressup-princess-fashion','mideer-ct2283-princess-fashion-show'],
  ['mideer-magnetic-tiles-jurassic-adventure-48p','mideer-colorful-magnetic-tiles-jurassic-48p'],
  ['mideer-magnetic-tiles-wonderful-forest-40p','mideer-colorful-magnetic-tiles-wonderful-forest-40p'],
  ['mideer-level1-animals-2-6','mideer-level-up-l1-animals-2p-6p'],
  ['mideer-level1-animals-vehicles-2-6','mideer-level-up-l1-animals-vehicles-2p-6p'],
  ['mideer-level-up-l3-community-helpers-24-35p','mideer-level3-community-helpers'],
  ['mideer-level-up-l3-natural-scenery-24-35p','mideer-level3-natural-scenery'],
  ['mideer-level4-construction','mideer-level-up-l4-clanging-construction-48-72p'],
  ['mideer-level-up-l5-wonderful-adventure','mideer-level5-wonderful-adventure'],
  ['mideer-magnetic-maze-parking','mideer-magnetic-maze-parking-lot'],
  ['mideer-magnetic-tangram','mideer-magnetic-tangram-md4281'],
  ['mideer-paper-craft-windmill','mideer-paper-craft-windmill-kingdom-md2307'],
  ['mideer-portable-puzzle-our-world-100','mideer-portable-puzzle-our-world-100p-md3027'],
  ['mideer-portable-wonderful-ocean-104p','mideer-portable-puzzle-wonderful-ocean-104p'],
  ['mideer-racing-track-magnetic-115','mideer-racing-track-grooved-magnetic-tiles-115p-md6395']
]);
