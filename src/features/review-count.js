import { pendingCandidateCount } from './local-candidate-queue.js';
import { getPendingCatalogReports } from './catalog-report-store.js';

// Canonical local state is the only review-count source. Remote transport is
// intentionally excluded so unavailable sync never changes the local badge.
export function getNeedsReviewCount(state) {
  return pendingCandidateCount(state) + getPendingCatalogReports(state).length;
}
