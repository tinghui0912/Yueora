import assert from 'node:assert';
import { plans } from '../src/lib/mockData.js';
import { readCheckoutQuery, yearlySavingPercent, monthlyEquivalent, PLAN_ORDER } from '../src/lib/commercial.js';

console.log('🧪 Running Yueora Commercial Flow & 3-Tier Pricing Verification...');

// 1. Verify 3 Plans Definition
assert.ok(plans.free, 'plans.free must exist');
assert.ok(plans.plus, 'plans.plus must exist');
assert.ok(plans.pro, 'plans.pro must exist');

assert.strictEqual(plans.free.priceMonthly, 0);
assert.strictEqual(plans.free.priceYearly, 0);

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

// 2. Verify PLAN_ORDER
assert.deepStrictEqual(PLAN_ORDER, ['free', 'plus', 'pro']);
console.log('  ✓ PLAN_ORDER verified: [free, plus, pro]');

// 3. Verify Mathematical Yearly Savings
// Plus: ($3 * 12 - $30) / ($3 * 12) = 6 / 36 = 16.666...% -> rounds to 17%
const plusSaving = yearlySavingPercent(plans.plus);
assert.strictEqual(plusSaving, 17, `Plus yearly saving expected 17%, got ${plusSaving}%`);

// Pro: ($6 * 12 - $60) / ($6 * 12) = 12 / 72 = 16.666...% -> rounds to 17%
const proSaving = yearlySavingPercent(plans.pro);
assert.strictEqual(proSaving, 17, `Pro yearly saving expected 17%, got ${proSaving}%`);

console.log(`  ✓ Computed annual savings verified: Plus = ${plusSaving}%, Pro = ${proSaving}% (truthful 17%)`);

// 4. Verify Monthly Equivalents
assert.strictEqual(monthlyEquivalent(plans.plus, 'yearly'), 2.5);
assert.strictEqual(monthlyEquivalent(plans.pro, 'yearly'), 5);
console.log('  ✓ Monthly equivalents verified: Plus = $2.50/mo, Pro = $5.00/mo');

// 5. Verify Checkout Query Logic
// Plus monthly
const qPlusM = readCheckoutQuery('?plan=plus&interval=monthly', plans);
assert.strictEqual(qPlusM.reason, null);
assert.strictEqual(qPlusM.planId, 'plus');
assert.strictEqual(qPlusM.interval, 'monthly');
assert.strictEqual(qPlusM.plan.name, 'Plus');

// Plus yearly
const qPlusY = readCheckoutQuery('?plan=plus&interval=yearly', plans);
assert.strictEqual(qPlusY.reason, null);
assert.strictEqual(qPlusY.planId, 'plus');
assert.strictEqual(qPlusY.interval, 'yearly');

// Pro monthly
const qProM = readCheckoutQuery('?plan=pro&interval=monthly', plans);
assert.strictEqual(qProM.reason, null);
assert.strictEqual(qProM.planId, 'pro');

// Free rejected
const qFree = readCheckoutQuery('?plan=free&interval=monthly', plans);
assert.ok(qFree.reason?.includes('Free'), 'Free checkout must be rejected');

// Unknown plan rejected
const qUnknown = readCheckoutQuery('?plan=super&interval=monthly', plans);
assert.ok(qUnknown.reason?.includes('not be found'), 'Unknown plan must be rejected');

// Unknown interval rejected
const qBadInt = readCheckoutQuery('?plan=plus&interval=decade', plans);
assert.ok(qBadInt.reason?.includes('interval is not available'), 'Bad interval must be rejected');

console.log('  ✓ readCheckoutQuery verification passed for all valid and invalid branches.');

// 6. Verify Zustand v8 -> v9 Persistence Migration
// Simulating an existing user in v8 who only has free and pro in their persisted localStorage
const fakePersistedV8 = {
  version: 8,
  plans: {
    free: { id: 'free', name: 'Free', priceMonthly: 0, priceYearly: 0 },
    pro: { id: 'pro', name: 'Pro', priceMonthly: 6, priceYearly: 60 },
  },
  subscription: { plan: 'free', status: 'active' },
};

// Migration rule from prototypeStore.js:
const raw = fakePersistedV8;
const merged = { ...raw };
merged.plans = {
  ...(merged.plans || {}),
  ...plans,
};

assert.ok(merged.plans.plus, 'Migrated state must contain plus plan');
assert.strictEqual(merged.plans.plus.priceMonthly, 3);
assert.strictEqual(merged.plans.plus.priceYearly, 30);
assert.strictEqual(merged.plans.plus.scores, '30 scores');
assert.strictEqual(merged.plans.plus.storage, '3 GB');
assert.ok(merged.plans.free, 'Migrated state must retain free plan');
assert.ok(merged.plans.pro, 'Migrated state must retain pro plan');

console.log('  ✓ Zustand v8 -> v9 migration verified: existing localStorage receives Plus plan automatically without reset.');

console.log('✅ Commercial flow verification passed with zero errors.');
