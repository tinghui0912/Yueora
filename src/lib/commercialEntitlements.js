import { plans as canonicalPlans } from './mockData.js';

/**
 * Commercial entitlements and quota helpers.
 *
 * Single source of truth: all capabilities and quotas derive directly from the
 * canonical plan definitions. No entitlement values are duplicated here.
 */

export function normalizePlanId(planOrId) {
  if (!planOrId) return 'free';
  if (typeof planOrId === 'string') return planOrId.toLowerCase();
  return planOrId.id?.toLowerCase() || 'free';
}

export function resolvePlan(planOrId, customPlans = canonicalPlans) {
  if (planOrId && typeof planOrId === 'object' && planOrId.scores !== undefined) {
    return planOrId;
  }
  const id = normalizePlanId(planOrId);
  return customPlans?.[id] || canonicalPlans?.[id] || canonicalPlans?.free;
}

export function canUsePracticeInsights(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  return Boolean(plan?.analytics);
}

export function canInviteEditors(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  return plan?.sharing === 'View & edit';
}

export function canDownloadRecording(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  return Boolean(plan?.export);
}

export function getScoreQuota(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  const raw = plan?.scores || '5 scores';
  if (/unlimited/i.test(raw)) {
    return { limit: Infinity, label: 'Unlimited', isUnlimited: true };
  }
  const match = raw.match(/\d+/);
  const limit = match ? parseInt(match[0], 10) : 5;
  return { limit, label: raw, isUnlimited: false };
}

export function getImportQuota(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  const raw = plan?.imports || '10 imports / month';
  if (/unlimited/i.test(raw)) {
    return { limit: Infinity, label: 'Unlimited', isUnlimited: true };
  }
  const match = raw.match(/\d+/);
  const limit = match ? parseInt(match[0], 10) : 10;
  return { limit, label: raw, isUnlimited: false };
}

export function getStorageQuota(planOrId, customPlans = canonicalPlans) {
  const plan = resolvePlan(planOrId, customPlans);
  const raw = plan?.storage || '500 MB';
  const match = raw.match(/([\d.]+)\s*(GB|MB)/i);
  let bytes = 0;
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    bytes = unit === 'GB' ? val * 1024 * 1024 * 1024 : val * 1024 * 1024;
  }
  return { limit: raw, bytes, label: raw };
}
