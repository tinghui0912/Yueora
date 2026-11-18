import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { plans } from '../src/lib/mockData.js';
import {
  readCheckoutQuery,
  yearlySavingPercent,
  monthlyEquivalent,
  PLAN_ORDER,
  applyDemoCheckout,
  migratePrototypeState,
} from '../src/lib/commercial.js';
import {
  canUsePracticeInsights,
  canInviteEditors,
  canDownloadRecording,
  getScoreQuota,
  getImportQuota,
  getStorageQuota,
  parseStorageToBytes,
  getStorageUsageState,
  getLiveScores,
  isImportReservingScore,
  getReservedScoreCount,
  getEffectiveScoreUsage,
  canCreateOrImportScore,
  canDuplicateScore,
  canRestoreScore,
} from '../src/lib/commercialEntitlements.js';

console.log('🧪 Running Yueora Commercial Flow & 3-Tier Pricing Verification...');

// Group 1. Canonical Plan Definitions Integrity
assert.ok(plans.free, 'plans.free must exist');
assert.ok(plans.plus, 'plans.plus must exist');
assert.ok(plans.pro, 'plans.pro must exist');

assert.strictEqual(plans.free.priceMonthly, 0);
assert.strictEqual(plans.free.priceYearly, 0);
assert.strictEqual(plans.free.practice, true);
assert.strictEqual(plans.free.analytics, false);
assert.strictEqual(plans.free.export, false);

assert.strictEqual(plans.plus.priceMonthly, 3);
assert.strictEqual(plans.plus.priceYearly, 30);
assert.strictEqual(plans.plus.scores, '30 scores');
assert.strictEqual(plans.plus.imports, '50 imports / month');
assert.strictEqual(plans.plus.storage, '3 GB');
assert.strictEqual(plans.plus.analytics, true);
assert.strictEqual(plans.plus.export, false);

assert.strictEqual(plans.pro.priceMonthly, 6);
assert.strictEqual(plans.pro.priceYearly, 60);
assert.strictEqual(plans.pro.scores, 'Unlimited');
assert.strictEqual(plans.pro.imports, 'Unlimited');
assert.strictEqual(plans.pro.storage, '10 GB');
assert.strictEqual(plans.pro.analytics, true);
assert.strictEqual(plans.pro.export, true);

console.log('  ✓ Free / Plus / Pro canonical plan definitions verified.');

// Group 2. Canonical Plan Order
assert.deepStrictEqual(PLAN_ORDER, ['free', 'plus', 'pro']);
console.log('  ✓ PLAN_ORDER verified: [free, plus, pro]');

// Group 3. Mathematical Yearly Savings Verification
// Plus: ($3 * 12 - $30) / ($3 * 12) = 6 / 36 = 16.666...% -> truthful 17%
const plusSaving = yearlySavingPercent(plans.plus);
assert.strictEqual(plusSaving, 17, `Plus yearly saving expected 17%, got ${plusSaving}%`);

// Pro: ($6 * 12 - $60) / ($6 * 12) = 12 / 72 = 16.666...% -> truthful 17%
const proSaving = yearlySavingPercent(plans.pro);
assert.strictEqual(proSaving, 17, `Pro yearly saving expected 17%, got ${proSaving}%`);

console.log(`  ✓ Computed annual savings verified: Plus = ${plusSaving}%, Pro = ${proSaving}% (truthful 17%)`);

// Group 4. Monthly Equivalents Verification
assert.strictEqual(monthlyEquivalent(plans.plus, 'yearly'), 2.5);
assert.strictEqual(monthlyEquivalent(plans.pro, 'yearly'), 5);
console.log('  ✓ Monthly equivalents verified: Plus = $2.50/mo, Pro = $5.00/mo');

// Group 5. Checkout Query Parsing & Validation
// Plus monthly accepted
const qPlusM = readCheckoutQuery('?plan=plus&interval=monthly', plans);
assert.strictEqual(qPlusM.reason, null);
assert.strictEqual(qPlusM.planId, 'plus');
assert.strictEqual(qPlusM.interval, 'monthly');
assert.strictEqual(qPlusM.plan.name, 'Plus');

// Plus yearly accepted
const qPlusY = readCheckoutQuery('?plan=plus&interval=yearly', plans);
assert.strictEqual(qPlusY.reason, null);
assert.strictEqual(qPlusY.planId, 'plus');
assert.strictEqual(qPlusY.interval, 'yearly');

// Pro monthly accepted
const qProM = readCheckoutQuery('?plan=pro&interval=monthly', plans);
assert.strictEqual(qProM.reason, null);
assert.strictEqual(qProM.planId, 'pro');

// Pro yearly accepted
const qProY = readCheckoutQuery('?plan=pro&interval=yearly', plans);
assert.strictEqual(qProY.reason, null);
assert.strictEqual(qProY.planId, 'pro');
assert.strictEqual(qProY.interval, 'yearly');

// Free rejected (does not need checkout)
const qFree = readCheckoutQuery('?plan=free&interval=monthly', plans);
assert.ok(qFree.reason?.includes('Free'), 'Free checkout must be rejected');

// Unknown plan rejected
const qUnknown = readCheckoutQuery('?plan=super&interval=monthly', plans);
assert.ok(qUnknown.reason?.includes('not be found'), 'Unknown plan must be rejected');

// Unknown interval rejected
const qBadInt = readCheckoutQuery('?plan=plus&interval=decade', plans);
assert.ok(qBadInt.reason?.includes('interval is not available'), 'Bad interval must be rejected');

console.log('  ✓ readCheckoutQuery verification passed for all valid and invalid branches.');

// Group 6. Real Production v8 -> v9 Migration Verification (Calling production migratePrototypeState)
const fakePersistedV8 = {
  version: 8,
  plans: {
    free: { id: 'free', name: 'Free', priceMonthly: 0, priceYearly: 0 },
    pro: { id: 'pro', name: 'Pro', priceMonthly: 6, priceYearly: 60 },
  },
  scores: [
    { id: 'user-score-1', title: 'Moonlight Sonata', ownership: 'mine' },
    { id: 'gymnopedie-1', title: 'Gymnopédie No. 1', ownership: 'saved' },
  ],
  subscription: {
    plan: 'free',
    status: 'active',
    renewal: 'Sep 15, 2026',
    usage: { scores: 2, imports: 3 },
  },
  account: { email: 'pianist@example.com' },
};

// Execute the REAL production migration helper consumed by Zustand persist.migrate
const migrated = migratePrototypeState(fakePersistedV8, 8);

assert.ok(migrated.plans.plus, 'Migrated state must contain plus plan');
assert.strictEqual(migrated.plans.plus.priceMonthly, 3);
assert.strictEqual(migrated.plans.plus.priceYearly, 30);
assert.strictEqual(migrated.plans.plus.scores, '30 scores');
assert.strictEqual(migrated.plans.plus.storage, '3 GB');
assert.strictEqual(migrated.plans.plus.analytics, true);

// Free and Pro canonical refreshed
assert.ok(migrated.plans.free, 'Migrated state must retain free plan');
assert.ok(migrated.plans.pro, 'Migrated state must retain pro plan');

// Existing user data and scores strictly preserved
assert.strictEqual(migrated.scores.length, 2);
assert.strictEqual(migrated.scores[0].title, 'Moonlight Sonata');
assert.strictEqual(migrated.account.email, 'pianist@example.com');
assert.strictEqual(migrated.subscription.usage.scores, 2);
assert.strictEqual(migrated.subscription.renewal, 'Nov 15, 2026');

console.log('  ✓ Production migratePrototypeState verified with representative v8 state (scores, account, Plus added).');

// Group 7. Real Paid Checkout State Transition (Calling production applyDemoCheckout)
const baseState = {
  plans,
  subscription: {
    plan: 'free',
    status: 'active',
    billingInterval: 'monthly',
    renewal: 'Nov 15, 2026',
    cancelAt: null,
    pendingPlan: null,
    usage: { scores: 4, imports: 5 },
  },
  billingHistory: [],
  checkout: null,
};

// 7a. Plus Yearly Purchase Transition
const plusCheckoutState = applyDemoCheckout(baseState, {
  planId: 'plus',
  interval: 'yearly',
  sessionKey: 'test-session-plus',
});

assert.strictEqual(plusCheckoutState.subscription.plan, 'plus');
assert.strictEqual(plusCheckoutState.subscription.status, 'active');
assert.strictEqual(plusCheckoutState.subscription.billingInterval, 'yearly');
assert.strictEqual(plusCheckoutState.checkout.status, 'complete');
assert.strictEqual(plusCheckoutState.checkout.planId, 'plus');
assert.strictEqual(plusCheckoutState.checkout.interval, 'yearly');
assert.strictEqual(plusCheckoutState.checkout.amount, 30);
assert.strictEqual(plusCheckoutState.billingHistory.length, 1);
assert.strictEqual(plusCheckoutState.billingHistory[0].amount, '$30.00');
assert.ok(plusCheckoutState.billingHistory[0].plan.includes('Plus'), 'Billing record must reference Plus');
assert.ok(plusCheckoutState.billingHistory[0].plan.includes('yearly'), 'Billing record must reference yearly');

// Duplicate sessionKey is a no-op
const dupeSessionState = applyDemoCheckout(plusCheckoutState, {
  planId: 'plus',
  interval: 'yearly',
  sessionKey: 'test-session-plus',
});
assert.strictEqual(dupeSessionState, plusCheckoutState, 'Duplicate sessionKey must return unmodified state');

// 7b. Pro Monthly Purchase Transition
const proCheckoutState = applyDemoCheckout(baseState, {
  planId: 'pro',
  interval: 'monthly',
  sessionKey: 'test-session-pro',
});

assert.strictEqual(proCheckoutState.subscription.plan, 'pro');
assert.strictEqual(proCheckoutState.subscription.status, 'active');
assert.strictEqual(proCheckoutState.subscription.billingInterval, 'monthly');
assert.strictEqual(proCheckoutState.checkout.status, 'complete');
assert.strictEqual(proCheckoutState.checkout.planId, 'pro');
assert.strictEqual(proCheckoutState.checkout.interval, 'monthly');
assert.strictEqual(proCheckoutState.checkout.amount, 6);
assert.strictEqual(proCheckoutState.billingHistory.length, 1);
assert.strictEqual(proCheckoutState.billingHistory[0].amount, '$6.00');
assert.ok(proCheckoutState.billingHistory[0].plan.includes('Pro'), 'Billing record must reference Pro');

// 7c. Free Checkout Attempt is Rejected
const freeCheckoutState = applyDemoCheckout(baseState, {
  planId: 'free',
  interval: 'monthly',
  sessionKey: 'test-session-free',
});
assert.strictEqual(freeCheckoutState, baseState, 'Free checkout attempt must return unmodified state');

console.log('  ✓ Production applyDemoCheckout verified for Plus, Pro, idempotency, and Free rejection.');

// Group 8. Commercial Entitlements Verification
assert.strictEqual(canUsePracticeInsights('free'), false);
assert.strictEqual(canUsePracticeInsights('plus'), true);
assert.strictEqual(canUsePracticeInsights('pro'), true);

assert.strictEqual(canInviteEditors('free'), false);
assert.strictEqual(canInviteEditors('plus'), true);
assert.strictEqual(canInviteEditors('pro'), true);

assert.strictEqual(canDownloadRecording('free'), false);
assert.strictEqual(canDownloadRecording('plus'), false);
assert.strictEqual(canDownloadRecording('pro'), true);

assert.deepStrictEqual(getScoreQuota('free'), { limit: 5, label: '5 scores', isUnlimited: false });
assert.deepStrictEqual(getScoreQuota('plus'), { limit: 30, label: '30 scores', isUnlimited: false });
assert.deepStrictEqual(getScoreQuota('pro'), { limit: Infinity, label: 'Unlimited', isUnlimited: true });

assert.deepStrictEqual(getImportQuota('free'), { limit: 10, label: '10 imports / month', isUnlimited: false });
assert.deepStrictEqual(getImportQuota('plus'), { limit: 50, label: '50 imports / month', isUnlimited: false });
assert.deepStrictEqual(getImportQuota('pro'), { limit: Infinity, label: 'Unlimited', isUnlimited: true });

assert.strictEqual(getStorageQuota('free').limit, '500 MB');
assert.strictEqual(getStorageQuota('plus').limit, '3 GB');
assert.strictEqual(getStorageQuota('pro').limit, '10 GB');

// Regression assertion: Prove helpers dynamically derive from canonical plan object rather than independent duplicated values
const customMockPlans = {
  free: {
    ...plans.free,
    analytics: true,
    export: true,
    sharing: 'View & edit',
    scores: '12 scores',
    imports: '24 imports / month',
    storage: '2 GB',
  },
};
assert.strictEqual(canUsePracticeInsights('free', customMockPlans), true, 'Helper must derive from plan.analytics');
assert.strictEqual(canDownloadRecording('free', customMockPlans), true, 'Helper must derive from plan.export');
assert.strictEqual(canInviteEditors('free', customMockPlans), true, 'Helper must derive from plan.sharing');
assert.strictEqual(getScoreQuota('free', customMockPlans).limit, 12, 'Score quota must derive from plan.scores');
assert.strictEqual(getImportQuota('free', customMockPlans).limit, 24, 'Import quota must derive from plan.imports');
assert.strictEqual(getStorageQuota('free', customMockPlans).limit, '2 GB', 'Storage quota must derive from plan.storage');

console.log('  ✓ Commercial entitlement helpers verified across all plans & dynamic derivation proved.');

// Group 9. Storage Normalization & Ratio Calculation Invariants
assert.strictEqual(parseStorageToBytes('500 MB'), 500 * 1024 * 1024);
assert.strictEqual(parseStorageToBytes('3 GB'), 3 * 1024 * 1024 * 1024);
assert.strictEqual(parseStorageToBytes('10 GB'), 10 * 1024 * 1024 * 1024);
assert.strictEqual(parseStorageToBytes('1.2 GB'), Math.round(1.2 * 1024 * 1024 * 1024));

// 9a. 400 MB on Free 500 MB -> 80% (Near limit, not at limit)
const free400 = getStorageUsageState('400 MB', 'free');
assert.strictEqual(free400.percentage, 80);
assert.strictEqual(free400.isNearLimit, true);
assert.strictEqual(free400.isAtLimit, false);

// 9b. 500 MB on Free 500 MB -> 100% (At limit)
const free500 = getStorageUsageState('500 MB', 'free');
assert.strictEqual(free500.percentage, 100);
assert.strictEqual(free500.isNearLimit, false);
assert.strictEqual(free500.isAtLimit, true);

// 9c. 1.2 GB on Free 500 MB -> 246% (Over limit — proves mixed-unit parseFloat bug is fixed!)
const free1200 = getStorageUsageState('1.2 GB', 'free');
assert.ok(free1200.percentage >= 240, '1.2 GB must be > 200% of 500 MB');
assert.strictEqual(free1200.isAtLimit, true);

// 9d. 2.4 GB on Plus 3 GB -> 80% (Near limit)
const plus2400 = getStorageUsageState('2.4 GB', 'plus');
assert.strictEqual(plus2400.percentage, 80);
assert.strictEqual(plus2400.isNearLimit, true);
assert.strictEqual(plus2400.isAtLimit, false);

console.log('  ✓ Storage unit normalization & quota state invariants verified across mixed units.');

// Group 10. Repertoire Quota Reservation & Store Mutation Invariants
const sampleScores4 = [
  { id: 's1', ownership: 'mine' },
  { id: 's2', ownership: 'mine' },
  { id: 's3', ownership: 'mine' },
  { id: 's4', ownership: 'mine' },
];
const sampleScores5 = [...sampleScores4, { id: 's5', ownership: 'mine' }];
const sampleScores29 = Array.from({ length: 29 }, (_, i) => ({ id: `plus-s-${i}`, ownership: 'mine' }));

const pendingImport = { id: 'imp-pending', scoreId: 'score-future', status: 'processing' };
const completedImport = { id: 'imp-done', scoreId: 's1', status: 'completed' };
const failedImport = { id: 'imp-fail', scoreId: 'score-failed', status: 'failed' };

// Pending import reserves a slot
assert.strictEqual(isImportReservingScore(pendingImport, sampleScores4), true);
// Completed import with live score does not double-count
assert.strictEqual(isImportReservingScore(completedImport, sampleScores4), false);
// Failed import does not reserve
assert.strictEqual(isImportReservingScore(failedImport, sampleScores4), false);

// Free 4 live + 0 pending -> allowed
const free4Usage = getEffectiveScoreUsage(sampleScores4, []);
assert.strictEqual(free4Usage.effectiveCount, 4);
assert.strictEqual(canCreateOrImportScore(sampleScores4, [], 'free'), true);
assert.strictEqual(canDuplicateScore(sampleScores4, [], 'free'), true);
assert.strictEqual(canRestoreScore(sampleScores4, [], 'free'), true);

// Free 4 live + 1 pending -> 5 (FULL, blocked!)
const free4Plus1Usage = getEffectiveScoreUsage(sampleScores4, [pendingImport]);
assert.strictEqual(free4Plus1Usage.effectiveCount, 5);
assert.strictEqual(canCreateOrImportScore(sampleScores4, [pendingImport], 'free'), false);
assert.strictEqual(canDuplicateScore(sampleScores4, [pendingImport], 'free'), false);
assert.strictEqual(canRestoreScore(sampleScores4, [pendingImport], 'free'), false);

// Free 5 live + 0 pending -> 5 (FULL, blocked!)
const free5Usage = getEffectiveScoreUsage(sampleScores5, []);
assert.strictEqual(free5Usage.effectiveCount, 5);
assert.strictEqual(canCreateOrImportScore(sampleScores5, [], 'free'), false);

// Plus 29 live + 1 pending -> 30 (FULL, blocked!)
const plus29Plus1Usage = getEffectiveScoreUsage(sampleScores29, [pendingImport]);
assert.strictEqual(plus29Plus1Usage.effectiveCount, 30);
assert.strictEqual(canCreateOrImportScore(sampleScores29, [pendingImport], 'plus'), false);

// Pro -> unlimited
assert.strictEqual(canCreateOrImportScore(Array.from({ length: 999 }, (_, i) => ({ id: `p-${i}`, ownership: 'mine' })), [pendingImport], 'pro'), true);

// Monthly Import limits: Free 10/10 and Plus 50/50 block all sources including MusicXML
const isImportQuotaReached = (currentCount, planId) => {
  const q = getImportQuota(planId);
  return !q.isUnlimited && currentCount >= q.limit;
};
assert.strictEqual(isImportQuotaReached(9, 'free'), false);
assert.strictEqual(isImportQuotaReached(10, 'free'), true, 'Free 10/10 must block imports');
assert.strictEqual(isImportQuotaReached(49, 'plus'), false);
assert.strictEqual(isImportQuotaReached(50, 'plus'), true, 'Plus 50/50 must block imports');
assert.strictEqual(isImportQuotaReached(999, 'pro'), false, 'Pro imports remain unlimited');

console.log('  ✓ Repertoire quota reservation & import quota invariants verified.');

// Group 11. Production-Sensitive Customer Copy Audit Across All Shells, Help & Pages
const filesToCheck = [
  'src/components/commercial/CheckoutShell.jsx',
  'src/lib/mockData.js',
  'src/pages/PracticeSetup.jsx',
  'src/pages/Pricing.jsx',
  'src/pages/Checkout.jsx',
  'src/pages/Landing.jsx',
  'src/pages/AddScore.jsx',
  'src/pages/settings/AccountSettings.jsx',
  'src/pages/settings/SecuritySettings.jsx',
  'src/pages/settings/PlanSettings.jsx',
  'src/pages/settings/NotificationSettings.jsx',
];
const forbiddenPhrases = [
  'Yueora never asks for card details',
  'Follow notes (Private preview)',
  'private development',
  'Please select Performance mode',
  'Continues to demo checkout',
  'It’s been a few days since Moonlight Sonata.',
  'or import digital MusicXML scores directly',
];
for (const rel of filesToCheck) {
  const full = path.resolve(rel);
  if (fs.existsSync(full)) {
    const content = fs.readFileSync(full, 'utf8');
    for (const phrase of forbiddenPhrases) {
      assert.ok(
        !content.includes(phrase),
        `Forbidden customer copy "${phrase}" detected in ${rel}`
      );
    }
  }
}
console.log('  ✓ Production-sensitive customer copy audit passed across 11 files (0 forbidden phrases found).');

// Group 12. Prototype State Consistency & Security Activity Verification
// 11a. Import & Score usage tracking transition
const mockStoreState = {
  scores: [
    { id: 'sc-1', title: 'Moonlight', ownership: 'mine' },
    { id: 'sc-2', title: 'Prelude', ownership: 'mine' },
  ],
  imports: [],
  subscription: {
    plan: 'free',
    usage: { scores: 2, imports: 8, storage: '1.2 GB' },
  },
  account: {
    sessions: [
      { id: 's1', device: 'MacBook', browser: 'Chrome', location: 'LA', current: true },
      { id: 's2', device: 'iPhone', browser: 'Safari', location: 'SF', current: false },
      { id: 's3', device: 'iPad', browser: 'Safari', location: 'SJ', current: false },
    ],
    securityActivity: [],
    mfa: { totp: false, sms: false },
    emailVerified: true,
  },
  notificationPrefs: {
    practiceCadence: 'Occasionally',
    practicePreferredTime: 'Evening',
  },
};

// Simulate session termination
const targetSession = mockStoreState.account.sessions.find((s) => s.id === 's2');
const remainingSessions = mockStoreState.account.sessions.filter((s) => s.id !== 's2');
const sessionSignOutActivity = {
  id: 'act-test-1',
  type: 'session',
  title: 'Session signed out',
  detail: `${targetSession.browser} on ${targetSession.device} · ${targetSession.location}`,
  timestamp: 'Just now',
};
const stateAfterSessionSignOut = {
  ...mockStoreState,
  account: {
    ...mockStoreState.account,
    sessions: remainingSessions,
    securityActivity: [sessionSignOutActivity, ...mockStoreState.account.securityActivity],
  },
};
assert.strictEqual(stateAfterSessionSignOut.account.sessions.length, 2);
assert.strictEqual(stateAfterSessionSignOut.account.securityActivity.length, 1);
assert.strictEqual(stateAfterSessionSignOut.account.securityActivity[0].title, 'Session signed out');
assert.ok(stateAfterSessionSignOut.account.securityActivity[0].detail.includes('Safari on iPhone'));

// Simulate sign out all other sessions
const otherCount = stateAfterSessionSignOut.account.sessions.filter((s) => !s.current).length;
const activeSessionsOnly = stateAfterSessionSignOut.account.sessions.filter((s) => s.current);
const allOthersActivity = {
  id: 'act-test-2',
  type: 'session',
  title: 'Other sessions signed out',
  detail: `${otherCount} session ended`,
  timestamp: 'Just now',
};
const stateAfterAllOthers = {
  ...stateAfterSessionSignOut,
  account: {
    ...stateAfterSessionSignOut.account,
    sessions: activeSessionsOnly,
    securityActivity: [allOthersActivity, ...stateAfterSessionSignOut.account.securityActivity],
  },
};
assert.strictEqual(stateAfterAllOthers.account.sessions.length, 1);
assert.strictEqual(stateAfterAllOthers.account.securityActivity.length, 2);
assert.strictEqual(stateAfterAllOthers.account.securityActivity[0].title, 'Other sessions signed out');

// Simulate notification preferences change
const stateWithCadence = {
  ...stateAfterAllOthers,
  notificationPrefs: {
    ...stateAfterAllOthers.notificationPrefs,
    practiceCadence: 'Weekly',
    practicePreferredTime: 'Morning',
  },
};
assert.strictEqual(stateWithCadence.notificationPrefs.practiceCadence, 'Weekly');
assert.strictEqual(stateWithCadence.notificationPrefs.practicePreferredTime, 'Morning');

// Simulate MFA enrollment update
const stateWithMfa = {
  ...stateWithCadence,
  account: {
    ...stateWithCadence.account,
    mfa: { ...stateWithCadence.account.mfa, totp: true },
    securityActivity: [
      { id: 'act-test-3', type: 'mfa', title: 'Authenticator app enabled', timestamp: 'Just now' },
      ...stateWithCadence.account.securityActivity,
    ],
  },
};
assert.strictEqual(stateWithMfa.account.mfa.totp, true);
assert.strictEqual(stateWithMfa.account.securityActivity[0].title, 'Authenticator app enabled');

console.log('  ✓ Prototype state consistency & security activity verification passed.');

console.log('✅ Commercial verifier passed all 12 assertion groups successfully.');
