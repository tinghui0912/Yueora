import assert from 'node:assert';
import { plans } from '../src/lib/mockData.js';
import {
  readCheckoutQuery,
  yearlySavingPercent,
  monthlyEquivalent,
  PLAN_ORDER,
  applyDemoCheckout,
  migratePrototypeState,
} from '../src/lib/commercial.js';

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

console.log('✅ Commercial verifier passed all 7 assertion groups successfully.');
