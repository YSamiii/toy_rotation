import { challengeLevel, developmentFit, developmentMechanics } from './development-fit.js';

export function challengeLabelKey(toy = {}) { return `developmentChallenge.${challengeLevel(toy)}`; }

export function recommendationReason(toy, { profile = {}, history = [], recentIds = [], diversityPreferred = false } = {}) {
  const fit = developmentFit(toy, profile, history);
  if (fit.kind === 'good_challenge') return { key:'recommendationReason.progression' };
  if (fit.kind === 'just_right') return { key:'recommendationReason.developmentFit' };
  if (diversityPreferred) return { key:'recommendationReason.diversity' };
  if (!recentIds.includes(toy.id)) return { key:'recommendationReason.recency' };
  return { key:'recommendationReason.familiar' };
}

export function filterCatalogDevelopment(rows, filters = {}, { childAgeMonths = null, profile = {}, history = [] } = {}) {
  const query = String(filters.query || '').normalize('NFKC').trim().toLowerCase();
  return rows.filter(toy => {
    const text = [toy.brand,toy.productName,toy.names?.en,toy.names?.zh,...(toy.aliases || []),...(toy.skillCodes || []),...(toy.playMechanics || [])].filter(Boolean).join(' ').toLowerCase();
    if (query && !text.includes(query)) return false;
    if (!matches(filters.brands, toy.brand)) return false;
    if (!matches(filters.categories, toy.categoryCode)) return false;
    if (!matchesAny(filters.skills, toy.skillCodes)) return false;
    if (!matchesAny(filters.mechanics, developmentMechanics(toy))) return false;
    if (!matches(filters.challenges, String(challengeLevel(toy)))) return false;
    if (!matchesAge(toy, filters.age, childAgeMonths)) return false;
    if (filters.fitCurrent && developmentFit(toy, profile, history).score < 12) return false;
    return true;
  });
}

function matches(selected = [], value) { return !selected?.length || selected.includes(value); }
function matchesAny(selected = [], values = []) { return !selected?.length || values.some(value => selected.includes(value)); }
function matchesAge(toy, age, childAgeMonths) {
  if (!age || age === 'all' || childAgeMonths == null) return true;
  const min = Number.isFinite(toy.minAgeMonths) ? toy.minAgeMonths : -Infinity;
  const max = Number.isFinite(toy.maxAgeMonths) ? toy.maxAgeMonths : Infinity;
  if (age === 'current') return min <= childAgeMonths && max >= childAgeMonths;
  if (age === 'later') return min > childAgeMonths;
  return true;
}
