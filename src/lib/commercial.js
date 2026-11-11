import {
  plans as canonicalPlans,
  practiceActivities as seedPracticeActivities,
  savedPerformances as seedSavedPerformances,
  teamMembers as seedTeamMembers,
} from './mockData.js';

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

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
  return `YUE-${stamp}`;
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

/**
 * Canonical checkout state mutation for completing a demo purchase.
 * Pure state transition function consumed by prototypeStore completeDemoCheckout.
 */
export function applyDemoCheckout(state, { planId, interval, sessionKey }) {
  const plan = state.plans?.[planId];
  if (!plan || planId === 'free') return state;
  if (state.checkout?.sessionKey === sessionKey) return state;

  const now = new Date();
  const amount = planPrice(plan, interval);
  const reference = demoReference();
  const renewal = formatDate(addBillingPeriod(now, interval));

  return {
    ...state,
    subscription: {
      ...state.subscription,
      plan: planId,
      status: 'active',
      billingInterval: interval,
      renewal,
      cancelAt: null,
      pendingPlan: null,
    },
    billingHistory: [
      {
        id: `demo-${Date.now()}`,
        date: formatDate(now),
        amount: `$${amount}.00`,
        plan: `${plan.name} ${interval === 'yearly' ? 'yearly' : 'monthly'}`,
        invoice: reference,
        demo: true,
      },
      ...(state.billingHistory || []),
    ],
    checkout: {
      status: 'complete',
      reference,
      planId,
      interval,
      amount,
      completedAt: now.toISOString(),
      sessionKey,
    },
  };
}

/**
 * Production Zustand persistence migration logic (v8 -> v9+).
 * Pure state transition function consumed by prototypeStore persist.migrate.
 */
export function migratePrototypeState(persistedState, version) {
  const raw = (persistedState && typeof persistedState === 'object') ? persistedState : {};
  /** @type {Record<string, any>} */
  const merged = { ...raw };

  // Ensure canonical product plans (free, plus, pro) are always synchronized
  merged.plans = {
    ...(merged.plans || {}),
    ...canonicalPlans,
  };

  if (!Array.isArray(merged.performanceComments)) merged.performanceComments = [];
  if (merged.notificationPrefs) {
    if (!merged.notificationPrefs.performances) merged.notificationPrefs.performances = { inApp: true, email: true };
    if (!merged.notificationPrefs.comments) merged.notificationPrefs.comments = { inApp: true, email: true };
  }
  if (Array.isArray(merged.savedPerformances)) {
    merged.savedPerformances = merged.savedPerformances.map((p) => ({
      allowComments: true,
      sharedCommenters: [],
      positionTimeline: null,
      ...p,
    }));
  }
  if (!merged.invitations) merged.invitations = [];
  if (!merged.revokedShareTokens) merged.revokedShareTokens = [];
  if (!merged.sharing) merged.sharing = {};
  if (!Array.isArray(merged.practiceActivities)) merged.practiceActivities = clone(seedPracticeActivities);
  if (!Array.isArray(merged.savedPerformances)) merged.savedPerformances = clone(seedSavedPerformances);
  if (!Array.isArray(merged.teamMembers)) merged.teamMembers = clone(seedTeamMembers);
  delete merged.practiceSessions;
  delete merged.practicePerformances;
  if (Array.isArray(merged.practiceActivities)) {
    merged.practiceActivities = merged.practiceActivities.map((a) => {
      const { visibility, sharedWith, teamId, ...rest } = a;
      return rest;
    });
  }
  if (Array.isArray(merged.savedPerformances)) {
    merged.savedPerformances = merged.savedPerformances
      .filter((p) => !!p.fileUri)
      .map(({ mediaRef, ...rest }) => rest);
  }
  if (!merged.preflight) merged.preflight = { modelReady: false, micGranted: false, midiConnected: false, cameraGranted: false };
  if (merged.subscription && merged.subscription.renewal === 'Sep 15, 2026') {
    merged.subscription.renewal = 'Nov 15, 2026';
  }
  if (Array.isArray(merged.scores)) {
    merged.scores = merged.scores.map((s) => {
      if (s.id === 'gymnopedie-1' && !s.savedPermission) {
        return { ...s, savedPermission: { canPractice: true, canDownload: true } };
      }
      if (s.ownership === 'shared' && !s.permissions) {
        return { ...s, permissions: { practice: true, download: s.permission === 'Can edit' } };
      }
      return s;
    });
  }
  if (merged.sharing) {
    for (const [sid, sh] of Object.entries(merged.sharing)) {
      if (sh.link && !sh.link.token) {
        sh.link.token = null;
        sh.link.createdAt = null;
        sh.link.expiresAt = null;
      }
    }
  }

  if (merged.account) {
    if (!merged.account.displayName) merged.account.displayName = 'You';
    if (!merged.account.provider) merged.account.provider = 'email';
    if (merged.account.emailVerified === undefined) merged.account.emailVerified = true;
    if (!Array.isArray(merged.account.sessions)) {
      merged.account.sessions = [
        { id: 's1', device: 'MacBook Pro', browser: 'Chrome', location: 'Los Angeles, CA', current: true, lastActive: 'Active now' },
        { id: 's2', device: 'iPhone 15', browser: 'Safari', location: 'San Francisco, CA', current: false, lastActive: '2 days ago' },
        { id: 's3', device: 'iPad Air', browser: 'Safari', location: 'San Jose, CA', current: false, lastActive: '5 days ago' },
      ];
    }
    if (!Array.isArray(merged.account.securityActivity)) {
      merged.account.securityActivity = [
        { id: 'act-1', type: 'signin', title: 'New sign-in', detail: 'Chrome on macOS · Los Angeles, CA', timestamp: 'Today · 10:24 AM' },
        { id: 'act-2', type: 'password', title: 'Password updated', detail: 'Primary account password', timestamp: 'Yesterday' },
        { id: 'act-3', type: 'mfa', title: 'MFA enrolled', detail: 'Authenticator app enrolled', timestamp: 'Nov 8, 2026' },
      ];
    }
    if (!merged.account.mfa) {
      merged.account.mfa = { totp: false, sms: false, phone: null };
    }
  }

  return merged;
}
