const MONTH_MS = 2629800000;
const DAY_MS = 86400000;

export function childAgeMonths(birthDate, now = Date.now()) {
  if (!birthDate) return null;
  const timestamp = new Date(`${birthDate}T00:00:00`).getTime();
  return Number.isFinite(timestamp) ? Math.max(0, Math.floor((now - timestamp) / MONTH_MS)) : null;
}

export function reassessmentState({ lastRotationAt, rotationHistory = [], rotationDays = 7, now = Date.now() }) {
  const rotationAt = lastRotationAt || rotationHistory[0]?.at;
  const days = Math.max(1, Number(rotationDays) || 7);
  if (!rotationAt) return { due:true, daysRemaining:0, days, nextAt:null };
  const nextAt = new Date(new Date(rotationAt).getTime() + days * DAY_MS);
  const daysRemaining = Math.max(0, Math.ceil((nextAt.getTime() - now) / DAY_MS));
  return { due:daysRemaining === 0, daysRemaining, days, nextAt:nextAt.toISOString() };
}

export function saveProfileAndRotationSettings(store, { childName, childBirthDate, rotationSize, rotationDays, onboardingDone = true }) {
  store.update(state => {
    state.profile.childName = String(childName || '').trim();
    state.profile.childBirthDate = childBirthDate || '';
    state.settings.rotationSize = Math.max(1, Math.min(50, Number(rotationSize) || 6));
    state.settings.rotationDays = Math.max(1, Math.min(90, Number(rotationDays) || 7));
    if (onboardingDone) state.settings.onboardingDone = true;
  }, 'profile-and-rotation-settings');
}
