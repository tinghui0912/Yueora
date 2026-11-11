import { plans } from './mockData';

/**
 * Commercial entitlements and quota helpers.
 * Single source of truth for gating capabilities by plan (Free, Plus, Pro).
 */

export function normalizePlanId(planOrId) {
  if (!planOrId) return 'free';
  if (typeof planOrId === 'string') return planOrId.toLowerCase();
  return planOrId.id?.toLowerCase() || 'free';
}

export function canUsePracticeInsights(planOrId) {
  const planId = normalizePlanId(planOrId);
  return planId === 'plus' || planId === 'pro';
}

export function canInviteEditors(planOrId) {
  const planId = normalizePlanId(planOrId);
  return planId === 'plus' || planId === 'pro';
}

export function canDownloadRecording(planOrId) {
  const planId = normalizePlanId(planOrId);
  return planId === 'pro';
}

export function getScoreQuota(planOrId) {
  const planId = normalizePlanId(planOrId);
  if (planId === 'pro') {
    return { limit: Infinity, label: 'Unlimited', isUnlimited: true };
  }
  if (planId === 'plus') {
    return { limit: 30, label: '30 scores', isUnlimited: false };
  }
  return { limit: 5, label: '5 scores', isUnlimited: false };
}

export function getImportQuota(planOrId) {
  const planId = normalizePlanId(planOrId);
  if (planId === 'pro') {
    return { limit: Infinity, label: 'Unlimited', isUnlimited: true };
  }
  if (planId === 'plus') {
    return { limit: 50, label: '50 imports / month', isUnlimited: false };
  }
  return { limit: 10, label: '10 imports / month', isUnlimited: false };
}

export function getStorageQuota(planOrId) {
  const planId = normalizePlanId(planOrId);
  if (planId === 'pro') return { limit: '10 GB' };
  if (planId === 'plus') return { limit: '3 GB' };
  return { limit: '500 MB' };
}
