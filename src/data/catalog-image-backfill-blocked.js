// Image-only hold list. These keys are deliberately excluded from Batch 2
// until a later identity audit resolves their ambiguous old/new mappings.
export const IMAGE_BACKFILL_BLOCKED_BY_IDENTITY = Object.freeze([
  { canonicalKey:'mideer-educational-balance-blocks', relatedKeys:['mideer-wisdom-tree-stackable-blocks'], reason:'possible_shared_sku_or_renamed_product' },
  { canonicalKey:'mideer-wisdom-tree-stackable-blocks', relatedKeys:['mideer-educational-balance-blocks'], reason:'possible_shared_sku_or_renamed_product' },
  { canonicalKey:'btoys-one-two-squeeze', relatedKeys:['btoys-one-two-squeeze-blocks'], reason:'possible_duplicate_canonical_identity' },
  { canonicalKey:'btoys-one-two-squeeze-blocks', relatedKeys:['btoys-one-two-squeeze'], reason:'possible_duplicate_canonical_identity' },
  { canonicalKey:'hape-shape-sorter', relatedKeys:['hape-wooden-shape-sorter'], reason:'possible_duplicate_canonical_identity' },
  { canonicalKey:'hape-wooden-shape-sorter', relatedKeys:['hape-shape-sorter'], reason:'possible_duplicate_canonical_identity' },
  { canonicalKey:'mideer-levelup-l1-animals-vehicles', relatedKeys:['mideer-level-up-l1-animals-vehicles-2p-6p'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level-up-l1-animals-vehicles-2p-6p', relatedKeys:['mideer-levelup-l1-animals-vehicles'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-levelup-l3-city-teamers', relatedKeys:['mideer-level3-city-teamers'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level3-city-teamers', relatedKeys:['mideer-levelup-l3-city-teamers'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-levelup-l3-natural-scenery', relatedKeys:['mideer-level3-natural-scenery'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level3-natural-scenery', relatedKeys:['mideer-levelup-l3-natural-scenery'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-levelup-l4-dinosaur-world', relatedKeys:['mideer-level4-dinosaur-world'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level4-dinosaur-world', relatedKeys:['mideer-levelup-l4-dinosaur-world'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level-up-dinosaur-projects-l2', relatedKeys:['mideer-level2-dinosaur-projects'], reason:'old_new_levelup_key_mapping_uncertain' },
  { canonicalKey:'mideer-level2-dinosaur-projects', relatedKeys:['mideer-level-up-dinosaur-projects-l2'], reason:'old_new_levelup_key_mapping_uncertain' }
]);
