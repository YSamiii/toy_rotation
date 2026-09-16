import { BATCH1_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch1.js';
import { BATCH2_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch2.js';
import { BATCH3_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch3.js';
import { BATCH4_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch4.js';
import { BATCH5_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch5.js';
import { BATCH6_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch6.js';
import { BATCH7_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch7.js';
import { BATCH8_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch8.js';
import { BATCH9_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch9.js';
import { BATCH10_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch10.js';
import { BATCH11_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch11.js';
import { BATCH12_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch12.js';
import { BATCH13_OFFICIAL_IMAGE_ROWS } from './catalog-image-assets-batch13.js';
import { HAPE_PRIORITY_BATCH1_IMAGE_ROWS } from './catalog-image-assets-hape-batch1.js';
import { HAPE_PRIORITY_BATCH2_IMAGE_ROWS } from './catalog-image-assets-hape-batch2.js';
import { HAPE_FINAL_RESOLUTION_IMAGE_ROWS } from './catalog-image-assets-hape-final-resolution.js';

// Curated stable catalog image assets; independent from personal IndexedDB photos.
const UPDATED_AT = '2026-08-24T00:00:00.000Z';
function remote(url, imageSource, imageSourceType) {
  return { kind:'remote', url, catalogImageRef:url, imageSource, imageSourceType, verificationStatus:imageSourceType === 'official_cdn' ? 'verified_real' : 'manually_confirmed', updatedAt:UPDATED_AT, fallbackState:'none', assetState:imageSourceType === 'official_cdn' ? 'verified_real' : 'stable_remote' };
}
function packaged(path, imageSource, sourceType, mimeType, contentHash) {
  return { kind:'packaged', path, catalogImageRef:`./${path}`, imageSource, imageSourceType:sourceType, verificationStatus:'verified_real', updatedAt:'2026-09-16T00:00:00.000Z', fallbackState:'none', assetState:'verified_packaged', mimeType, contentHash };
}
const BATCH1_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH1_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, 'official_cdn')]));
const BATCH2_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH2_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, 'official_cdn')]));
const BATCH3_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH3_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, 'official_cdn')]));
const BATCH4_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH4_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, 'official_cdn')]));
const BATCH5_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH5_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), updatedAt:'2026-08-27T00:00:00.000Z' }]));
const BATCH6_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH6_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-08-27T00:00:00.000Z' }]));
const BATCH7_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH7_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-08-27T00:00:00.000Z' }]));
const BATCH8_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH8_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-08-27T00:00:00.000Z' }]));
const BATCH9_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH9_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-08-28T00:00:00.000Z' }]));
const BATCH10_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH10_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-09-11T00:00:00.000Z' }]));
const BATCH11_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH11_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-09-11T00:00:00.000Z' }]));
const BATCH12_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH12_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-09-11T00:00:00.000Z' }]));
const BATCH13_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH13_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, 'official_cdn'), imageOwnerCanonicalKey:key, updatedAt:'2026-09-11T00:00:00.000Z' }]));
const HAPE_PRIORITY_BATCH1_IMAGE_ASSETS = Object.fromEntries(HAPE_PRIORITY_BATCH1_IMAGE_ROWS.map(row => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey:row.canonicalKey,
  sku:row.sku,
  officialProductName:row.officialProductName,
  updatedAt:'2026-08-28T00:00:00.000Z'
}]));
const HAPE_PRIORITY_BATCH2_IMAGE_ASSETS = Object.fromEntries(HAPE_PRIORITY_BATCH2_IMAGE_ROWS.map(row => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey:row.canonicalKey,
  sku:row.sku,
  officialProductName:row.officialProductName,
  updatedAt:'2026-08-28T00:00:00.000Z'
}]));
const HAPE_FINAL_RESOLUTION_IMAGE_ASSETS = Object.fromEntries(HAPE_FINAL_RESOLUTION_IMAGE_ROWS.map(row => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey:row.canonicalKey,
  sku:row.sku,
  regionalSku:row.regionalSku,
  officialProductName:row.officialProductName,
  updatedAt:'2026-08-28T00:00:00.000Z'
}]));

export const CATALOG_IMAGE_ASSETS = Object.freeze({
  "plantoys-baby-car": remote("http://www.plantoys.com/cdn/shop/files/5229_-_Main_-_sq_1200x1200.jpg?v=1755249036", "https://www.plantoys.com/products/baby-car", 'official_cdn'),
  "plantoys-breakfast-menu": remote("http://www.plantoys.com/cdn/shop/files/3415_-_Main_1200x1200.jpg?v=1754368688", "https://www.plantoys.com/products/breakfast-menu", 'official_cdn'),
  "plantoys-bowling-set": remote("http://www.plantoys.com/cdn/shop/files/5735_-_Main_-_sq_1200x1200.jpg?v=1754369785", "https://www.plantoys.com/products/bowling-set", 'official_cdn'),
  "plantoys-balancing-cactus": remote("http://www.plantoys.com/cdn/shop/files/4101_-_Main_-_sq_1200x1200.jpg?v=1755165869", "https://www.plantoys.com/products/balancing-cactus", 'official_cdn'),
  "plantoys-animal-set": remote("http://www.plantoys.com/cdn/shop/files/6625_-_Main_1200x1200.jpg?v=1754371476", "https://www.plantoys.com/products/animal-set", 'official_cdn'),
  "plantoys-beehives": remote("http://www.plantoys.com/cdn/shop/files/4125_-_Main_-_sq_1200x1200.jpg?v=1755248677", "https://www.plantoys.com/products/beehives", 'official_cdn'),
  "plantoys-baby-key-rattle": remote("http://www.plantoys.com/cdn/shop/files/5217_-_Main_-_sq_1200x1200.jpg?v=1754373929", "https://www.plantoys.com/products/baby-key-rattle", 'official_cdn'),
  "plantoys-dancing-alligator": remote("http://www.plantoys.com/cdn/shop/files/5105_-_Main_-_sq_1200x1200.jpg?v=1755248940", "https://www.plantoys.com/products/dancing-alligator", 'official_cdn'),
  "plantoys-bulldozer": remote("http://www.plantoys.com/cdn/shop/files/6123_-_Main_-_sq_1200x1200.jpg?v=1754376692", "https://www.plantoys.com/products/bulldozer", 'official_cdn'),
  "plantoys-creative-board": remote("http://www.plantoys.com/cdn/shop/files/5459_-_Main_1200x1200.jpg?v=1754373904", "https://www.plantoys.com/products/creative-board", 'official_cdn'),
  "plantoys-farm-to-market-roadway": remote("http://www.plantoys.com/cdn/shop/files/2623_-_Main_-_web_1200x1200.jpg?v=1772768368", "https://www.plantoys.com/products/farm-to-market-roadway", 'official_cdn'),
  "plantoys-doctor-set": remote("http://www.plantoys.com/cdn/shop/files/3451_-_Main_1200x1200.jpg?v=1755248863", "https://www.plantoys.com/products/doctor-set", 'official_cdn'),
  "plantoys-cubes": remote("http://www.plantoys.com/cdn/shop/files/5374_-_Main_-_sq_1200x1200.jpg?v=1754375620", "https://www.plantoys.com/products/cubes", 'official_cdn'),
  "plantoys-clatter": remote("http://www.plantoys.com/cdn/shop/files/6413_-_Main_-_sq_1200x1200.jpg?v=1754373258", "https://www.plantoys.com/products/clatter", 'official_cdn'),
  "plantoys-meadow-ring-toss": remote("http://www.plantoys.com/cdn/shop/files/5652_-_Main_-_sq_1200x1200.jpg?v=1754370845", "https://www.plantoys.com/products/meadow-ring-toss", 'official_cdn'),
  "plantoys-fountain-bowl-set": remote("http://www.plantoys.com/cdn/shop/files/5714_-_Main_-_sq_1200x1200.jpg?v=1754368807", "https://www.plantoys.com/products/fountain-bowl-set", 'official_cdn'),
  "plantoys-miracle-pounding-ii": remote("http://www.plantoys.com/cdn/shop/files/5454_-_Main_1200x1200.jpg?v=1754373123", "https://www.plantoys.com/products/miracle-pounding-ii", 'official_cdn'),
  "plantoys-geometric-sorting-board": remote("http://www.plantoys.com/cdn/shop/files/2403_-_Main_1200x1200.jpg?v=1755164521", "https://www.plantoys.com/products/geometric-sorting-board", 'official_cdn'),
  "plantoys-oval-xylophone": remote("http://www.plantoys.com/cdn/shop/files/6405_-_Main_-_sq_1200x1200.jpg?v=1754372666", "https://www.plantoys.com/products/oval-xylophone", 'official_cdn'),
  "plantoys-peek-a-boo-roller": remote("http://www.plantoys.com/cdn/shop/files/5252_-_Main_-_sq_1200x1200.jpg?v=1754375561", "https://www.plantoys.com/products/peek-a-boo-roller", 'official_cdn'),
  "plantoys-penguin-wobbler": remote("http://www.plantoys.com/cdn/shop/files/5900_-_Packshot_-_01_1200x1200.jpg?v=1758422552", "https://www.plantoys.com/products/penguin-wobbler", 'official_cdn'),
  "plantoys-pull-along-snail": remote("http://www.plantoys.com/cdn/shop/files/5108_-_Main_-_sq_1200x1200.jpg?v=1755249011", "https://www.plantoys.com/products/pull-along-snail", 'official_cdn'),
  "plantoys-solid-drum": remote("http://www.plantoys.com/cdn/shop/files/6404_-_Main_-_sq_1200x1200.jpg?v=1755249303", "https://www.plantoys.com/products/solid-drum", 'official_cdn'),
  "plantoys-road-system": remote("http://www.plantoys.com/cdn/shop/files/6208_-_Main_-_sq_1200x1200.jpg?v=1754375416", "https://www.plantoys.com/products/road-system", 'official_cdn'),
  "plantoys-sensory-blocks": remote("http://www.plantoys.com/cdn/shop/products/5257_-_Packshot_-_01_1200x1200.jpg?v=1754375844", "https://www.plantoys.com/products/sensory-blocks", 'official_cdn'),
  "plantoys-sea-life-bath-set": remote("http://www.plantoys.com/cdn/shop/files/5658_-_Main_-_sq_1200x1200.jpg?v=1754371545", "https://www.plantoys.com/products/sea-life-bath-set", 'official_cdn'),
  "plantoys-stacking-rocket": remote("http://www.plantoys.com/cdn/shop/files/5694_-_Main_1200x1200.jpg?v=1754373079", "https://www.plantoys.com/products/stacking-rocket", 'official_cdn'),
  "plantoys-roller-classic": remote("http://www.plantoys.com/cdn/shop/files/5220_-_Main_-_sq_1200x1200.jpg?v=1755248508", "https://www.plantoys.com/products/roller-classic", 'official_cdn'),
  "plantoys-walk-n-roll": remote("http://www.plantoys.com/cdn/shop/files/5137_-_Main_-_sq_1200x1200.jpg?v=1755164188", "https://www.plantoys.com/products/walk-n-roll", 'official_cdn'),
  "plantoys-stacking-tree": remote("http://www.plantoys.com/cdn/shop/files/5149_-_Main_-_sq_1200x1200.jpg?v=1754376978", "https://www.plantoys.com/products/stacking-tree", 'official_cdn'),
  "plantoys-water-play-set": remote("http://www.plantoys.com/cdn/shop/files/5801_-_Main_-_sq_1200x1200.jpg?v=1754380289", "https://www.plantoys.com/products/water-play-set", 'official_cdn'),
  "plantoys-wave-stacker": remote("http://www.plantoys.com/cdn/shop/files/5486_-_Main_1200x1200.jpg?v=1755249158", "https://www.plantoys.com/products/wave-stacker", 'official_cdn'),
  "plantoys-vet-set": remote("http://www.plantoys.com/cdn/shop/files/3490_-_Main_-_sq_1200x1200.jpg?v=1754371916", "https://www.plantoys.com/products/vet-set", 'official_cdn'),
  "plantoys-victorian-dollhouse": remote("http://www.plantoys.com/cdn/shop/files/712409_-_Main_-_01_1200x1200.jpg?v=1770801189", "https://www.plantoys.com/products/victorian-dollhouse", 'official_cdn'),
  "plantoys-wautomobile": remote("http://www.plantoys.com/cdn/shop/products/5449_1636_1637_1638_-_Packshot_-_01_1200x1200.jpg?v=1754379041", "https://www.plantoys.com/products/wautomobile", 'official_cdn'),
  "lovevery-inspector": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262273?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-inspector", "stable_retailer"),
  "lovevery-explorer": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262271?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-explorer", "stable_retailer"),
  "lovevery-thinker": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262282?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-thinker", "stable_retailer"),
  "mideer-my-first-animal-family-6in1": remote("https://mideer.store/wp-content/uploads/2025/01/4feea2da3990e75917faf4dbdf87ff47.webp", "https://mideer.store/en/product/my-first-pieces-animal-family-6-in-1/", 'stable_retailer'),
  "mideer-my-first-construction-6in1": remote("https://mideer.store/wp-content/uploads/2025/01/0dafc3f81f68ef0ab4a49d4a2d91dcfb_4460e93b-5e45-4e1e-9d4b-5f9a4182a94d.webp", "https://mideer.store/en/product/my-first-pieces-6-in-1-construction-machines/", 'stable_retailer'),
  "hape-jungle-musical-railway": remote("https://eurekakids.com.hk/cdn/shop/files/E3825-jpg.webp?v=1773987744", "https://eurekakids.com.hk/products/music-and-monkey-railway", "stable_retailer"),
  "bduck-bounce-catch-game": remote("./catalog-assets/bduck-bounce-catch-game.webp", "bundled:catalog-assets/bduck-bounce-catch-game.webp", "manually_confirmed"),
  "cherrypick-original-magic-playwall": packaged('catalog-assets/cherrypick-original-magic-playwall.jpg', 'https://shopcherrypick.com/products/magic-playwall?variant=44481003192508', 'official_variant_cdn', 'image/jpeg', 'sha256:49c4ef0ede77ba62d5c8ff385deb84005a5a05fac32c6cd45b96215785e097a3'),
  "cherrypick-emotions-magnets-soft-foam-20pc": packaged('catalog-assets/cherrypick-emotions-magnets-soft-foam-20pc.jpg', 'https://shopcherrypick.com/products/emotions-magnets-soft-foam-magnetic-set', 'official_variant_cdn', 'image/jpeg', 'sha256:f7dbc7585e1dec66dfb620b8a19a86e2f198a8bb4a4abd59b3344054b62a7fa5'),
  "cherrypick-soft-foam-magnetic-letters": packaged('catalog-assets/cherrypick-soft-foam-magnetic-letters.jpg', 'https://shopcherrypick.com/products/soft-foam-magnetic-letters-symbols-150pc-set?variant=44529740382396', 'official_variant_cdn', 'image/jpeg', 'sha256:3c3fbf7c25b1c94c3e6879213d771f18bc1ead0903b2aa4f90b38ac95a4a8ad3'),
  "cherrypick-dustless-chalk-crayons": packaged('catalog-assets/cherrypick-dustless-chalk-crayons.jpg', 'https://shopcherrypick.com/products/dustless-chalk-crayons-magnetic-holder-bundle-for-magic-playwall?variant=44190785765564', 'official_variant_cdn', 'image/jpeg', 'sha256:3c0a08b8bdce7a4bed2065f3050fd63b6058a9b599cc00fc36de50d5a9e5ba70'),
  "mideer-animal-toys-set-15pcs": packaged('catalog-assets/mideer-animal-toys-set-15pcs.jpg', 'https://www.toytag.com/products/animals-toy-set-15p', 'authorized_retailer_exact_sku', 'image/jpeg', 'sha256:e062bf4ff7b9136ce15263bd994abf587b26a1c9bfa896c4ff87975c89998e90'),
  "mideer-level1-home-sweet-home-puzzle": packaged('catalog-assets/mideer-level1-home-sweet-home-puzzle.jpg', 'https://mideermall.com/products/mideer-level-up-puzzles-level-1-home-sweet-home', 'authorized_retailer_exact_sku', 'image/jpeg', 'sha256:b926afe91148eccc63e9ea4367482f0833d566a5b6b55fd09020b6d8466cd98b'),
  "mideer-my-first-puzzle-dinosaurs-6in1": packaged('catalog-assets/mideer-my-first-puzzle-dinosaurs-6in1.webp', 'https://mideer.store/en/product/my-first-dinosaur-pieces-6-in-1/', 'official_cdn', 'image/webp', 'sha256:e5fe90815379cd197aa58f5aeaaa5bb3cde546a2fb35882c2d2cbe9074043432'),
  "lego-duplo-fire-truck-hose-firefighter-10473": packaged('catalog-assets/lego-duplo-fire-truck-hose-firefighter-10473.jpg', 'https://www.lego.com/en-ca/product/fire-truck-with-hose-and-firefighter-10473', 'authorized_retailer_exact_set', 'image/jpeg', 'sha256:ad876feeb6209405527d7e3813de4aedc9509053471b6c9f59b874b741c0d174'),
  "lego-duplo-3in1-construction-vehicles-10475": packaged('catalog-assets/lego-duplo-3in1-construction-vehicles-10475.png', 'https://www.lego.com/en-us/product/3-in-1-construction-vehicles-10475', 'authorized_retailer_exact_set', 'image/png', 'sha256:510aa25bcf9f1abd6385364236972e96c1673fb52044fd44ca9a8b1f5aa572d0'),
  "lego-duplo-animal-train": packaged('catalog-assets/lego-duplo-animal-train-10955.jpg', 'https://www.lego.com/en-pt/product/animal-train-10955', 'authorized_retailer_exact_set', 'image/jpeg', 'sha256:3736cac2185ac843f8ceed04a9ab7d4c042ef5afffb54ff1a09d0b7301de8ccd'),
  ...BATCH1_OFFICIAL_IMAGE_ASSETS,
  ...BATCH2_OFFICIAL_IMAGE_ASSETS,
  ...BATCH3_OFFICIAL_IMAGE_ASSETS,
  ...BATCH4_OFFICIAL_IMAGE_ASSETS,
  ...BATCH5_OFFICIAL_IMAGE_ASSETS,
  ...BATCH6_OFFICIAL_IMAGE_ASSETS,
  ...BATCH7_OFFICIAL_IMAGE_ASSETS,
  ...BATCH8_OFFICIAL_IMAGE_ASSETS,
  ...BATCH9_OFFICIAL_IMAGE_ASSETS,
  ...BATCH10_OFFICIAL_IMAGE_ASSETS,
  ...BATCH11_OFFICIAL_IMAGE_ASSETS,
  ...BATCH12_OFFICIAL_IMAGE_ASSETS,
  ...BATCH13_OFFICIAL_IMAGE_ASSETS,
  ...HAPE_PRIORITY_BATCH1_IMAGE_ASSETS,
  ...HAPE_PRIORITY_BATCH2_IMAGE_ASSETS,
  ...HAPE_FINAL_RESOLUTION_IMAGE_ASSETS,
});
export function catalogImageAsset(key) { return CATALOG_IMAGE_ASSETS[String(key || '').toLowerCase()] || null; }
