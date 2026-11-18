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

/**
 * Normalizes a storage string (e.g. '500 MB', '1.2 GB', '10 GB') to integer bytes.
 */
export function parseStorageToBytes(storageStr) {
  if (typeof storageStr === 'number') return storageStr;
  if (!storageStr || typeof storageStr !== 'string') return 0;
  const match = storageStr.match(/([\d.]+)\s*(GB|MB|KB|B)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return Math.round(val * 1024 * 1024 * 1024);
  if (unit === 'MB') return Math.round(val * 1024 * 1024);
  if (unit === 'KB') return Math.round(val * 1024);
  return Math.round(val);
}

/**
 * Canonical storage usage state derivation.
 * Compares normalized bytes, computing exact ratios and threshold states.
 */
export function getStorageUsageState(usageStrOrBytes, planOrId, customPlans = canonicalPlans) {
  const quota = getStorageQuota(planOrId, customPlans);
  const usedBytes = parseStorageToBytes(usageStrOrBytes);
  const totalBytes = quota.bytes;
  const ratio = totalBytes > 0 ? usedBytes / totalBytes : 0;
  const percentage = Math.round(ratio * 100);
  const isAtLimit = ratio >= 1.0;
  const isNearLimit = !isAtLimit && ratio >= 0.8;
  return {
    usedBytes,
    totalBytes,
    ratio,
    percentage,
    isNearLimit,
    isAtLimit,
    status: isAtLimit ? 'at_limit' : isNearLimit ? 'near_limit' : 'normal',
  };
}

/**
 * Live repertoire scores: all active scores not in Trash.
 */
export function getLiveScores(scores = []) {
  if (!Array.isArray(scores)) return [];
  return scores.filter((s) => s && s.ownership !== 'trash');
}

/**
 * Checks whether an import currently reserves a future repertoire slot.
 * Pending imports in 'processing' or 'needs_review' reserve capacity unless
 * their score already exists in live scores.
 */
export function isImportReservingScore(imp, liveScores = []) {
  if (!imp) return false;
  if (imp.status !== 'processing' && imp.status !== 'needs_review') return false;
  if (imp.scoreId && liveScores.some((s) => s.id === imp.scoreId && s.ownership !== 'trash')) {
    return false;
  }
  return true;
}

/**
 * Returns the count of pending score-producing imports reserving capacity.
 */
export function getReservedScoreCount(imports = [], liveScores = []) {
  if (!Array.isArray(imports)) return 0;
  return imports.filter((i) => isImportReservingScore(i, liveScores)).length;
}

/**
 * Single source of truth for effective repertoire usage:
 * live repertoire scores + pending score-producing imports.
 * @param {any} [stateOrScores]
 * @param {any[]} [maybeImports]
 */
export function getEffectiveScoreUsage(stateOrScores, maybeImports = []) {
  let scoresList = [];
  let importsList = [];

  if (Array.isArray(stateOrScores)) {
    scoresList = stateOrScores;
    importsList = maybeImports;
  } else if (stateOrScores && typeof stateOrScores === 'object') {
    const stateObj = /** @type {Record<string, any>} */ (stateOrScores);
    scoresList = stateObj.scores || [];
    importsList = stateObj.imports || [];
  }

  const live = getLiveScores(scoresList);
  const liveCount = live.length;
  const reservedCount = getReservedScoreCount(importsList, live);
  return {
    liveCount,
    reservedCount,
    effectiveCount: liveCount + reservedCount,
  };
}

/**
 * Quota invariant guards for creation, duplication, and restoration.
 */
export function canCreateOrImportScore(scores = [], imports = [], planOrId, customPlans = canonicalPlans) {
  const quota = getScoreQuota(planOrId, customPlans);
  if (quota.isUnlimited) return true;
  const { effectiveCount } = getEffectiveScoreUsage(scores, imports);
  return effectiveCount < quota.limit;
}

export function canDuplicateScore(scores = [], imports = [], planOrId, customPlans = canonicalPlans) {
  return canCreateOrImportScore(scores, imports, planOrId, customPlans);
}

export function canRestoreScore(scores = [], imports = [], planOrId, customPlans = canonicalPlans) {
  return canCreateOrImportScore(scores, imports, planOrId, customPlans);
}
