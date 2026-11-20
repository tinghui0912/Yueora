import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { formatPrice, intervalLabel, intervalNoun } from '@/lib/commercial';
import { Button } from '@/components/ui/button';
import StateMessage from '@/components/patterns/StateMessage';

export default function CheckoutSuccess() {
  const checkout = usePrototypeStore((s) => s.checkout);
  const plans = usePrototypeStore((s) => s.plans);
  const subscription = usePrototypeStore((s) => s.subscription);

  const searchParams = new URLSearchParams(window.location.search);
  const isDevDemo = import.meta.env.DEV && (searchParams.get('demo') === 'true' || searchParams.get('seed') === 'true');

  const hasRealCheckout = checkout?.status === 'complete' && checkout.reference;
  const done = hasRealCheckout || isDevDemo;
  const effectiveCheckout = hasRealCheckout ? checkout : (isDevDemo ? {
    status: 'complete',
    reference: 'YUE-2026-DEMO',
    planId: searchParams.get('plan') || 'plus',
    interval: searchParams.get('interval') || 'monthly',
    amount: (searchParams.get('plan') || 'plus') === 'pro' ? 6 : 3,
    completedAt: new Date().toISOString(),
  } : null);
  const plan = done && effectiveCheckout ? (plans[effectiveCheckout.planId] || plans.plus) : null;

  if (!done || !plan || !effectiveCheckout) {
    return (
      <StateMessage
        icon={AlertCircle}
        title="No completed checkout"
        description="This page confirms a subscription you completed. Nothing has been purchased yet and your plan is unchanged."
        secondaryAction={<Button intent="secondary" asChild><Link to="/settings/plan">View Plan &amp; billing</Link></Button>}
        primaryAction={<Button asChild><Link to="/pricing">Back to pricing</Link></Button>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="type-caption text-ink-tertiary">Subscription confirmed</p>
          <h1 className="type-page-title text-ink-primary">You're on {plan.name}</h1>
        </div>
      </div>

      <p className="mt-4 type-body-small text-ink-secondary">
        Your subscription to {plan.name} is now active with {intervalLabel(effectiveCheckout.interval).toLowerCase()}{' '}
        billing. All plan features and allowances are ready for you.
      </p>

      <div className="mt-6 rounded-container border border-line-subtle bg-surface-panel">
        <dl className="divide-y divide-line-subtle px-5 type-body-small">
          <Row label="Plan" value={`Yueora ${plan.name}`} />
          <Row label="Billing interval" value={`Every ${intervalNoun(effectiveCheckout.interval)}`} />
          <Row label="Amount paid" value={formatPrice(effectiveCheckout.amount)} />
          <Row label="Invoice reference" value={effectiveCheckout.reference} mono />
          <Row label="Next renewal" value={subscription.renewal} />
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/practice">Start playing</Link>
        </Button>
        <Button intent="secondary" asChild>
          <Link to="/settings/plan">View plan &amp; billing</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className={`text-right text-ink-primary ${mono ? 'font-mono type-metadata' : ''}`}>{value}</dd>
    </div>
  );
}
