/**
 * Commercial helpers — one place for prices, intervals and checkout URLs.
 *
 * Prices always come from the plans data in the prototype store (seeded from
 * mockData). No component holds its own copy of a price.
 */

export const INTERVALS = ['monthly', 'yearly'];
export const PLAN_ORDER = ['free', 'plus', 'pro'];

export function intervalLabel(interval) {
  return interval === 'yearly' ? 'Yearly' : 'Monthly';
}

export function intervalNoun(interval) {
  return interval === 'yearly' ? 'year' : 'month';
}

/** The amount actually charged for one billing period. */
export function planPrice(plan, interval) {
  if (!plan) return 0;
  return interval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
}

/** Whole dollars, e.g. "$60". */
export function formatPrice(amount) {
  return `$${Number(amount || 0)}`;
}

/** e.g. "$6 / month" */
export function priceLine(plan, interval) {
  return `${formatPrice(planPrice(plan, interval))} / ${intervalNoun(interval)}`;
}

export function monthlyEquivalent(plan, interval) {
  const price = planPrice(plan, interval);
  if (interval !== 'yearly') return price;
  return Math.round((price / 12) * 100) / 100;
}

/** Savings of the yearly price against 12 monthly payments, as a percentage. */
export function yearlySavingPercent(plan) {
  if (!plan || !plan.priceMonthly) return 0;
  const full = plan.priceMonthly * 12;
  return Math.round(((full - plan.priceYearly) / full) * 100);
}

export function checkoutPath(planId, interval) {
  return `/checkout?plan=${encodeURIComponent(planId)}&interval=${encodeURIComponent(interval)}`;
}

/**
 * Validates the checkout query against the real plan definitions.
 * A free plan or an unknown interval is not purchasable.
 */
export function readCheckoutQuery(search, plans) {
  const params = new URLSearchParams(search || '');
  const planId = params.get('plan') || '';
  const interval = params.get('interval') || 'monthly';
  const plan = plans?.[planId];
  if (!plan) return { planId, interval, plan: null, reason: 'That plan could not be found.' };
  if (planId === 'free') return { planId, interval, plan, reason: 'The Free plan does not need a checkout.' };
  if (!INTERVALS.includes(interval)) return { planId, interval, plan, reason: 'That billing interval is not available.' };
  return { planId, interval, plan, reason: null };
}

/** A long, clearly-fake confirmation reference for the demo journey. */
export function demoReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  return `DEMO-${stamp}`;
}

export function addBillingPeriod(date, interval) {
  const next = new Date(date);
  if (interval === 'yearly') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}