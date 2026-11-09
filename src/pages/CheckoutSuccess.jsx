import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { formatPrice, intervalLabel, intervalNoun } from '@/lib/commercial';
import { Button } from '@/components/ui/button';
import StateMessage from '@/components/patterns/StateMessage';

/**
 * CheckoutSuccess — only reachable with a completed demo checkout recorded in the
 * store. Opening the URL directly shows the "nothing completed" state.
 */
export default function CheckoutSuccess() {
  const checkout = usePrototypeStore((s) => s.checkout);
  const plans = usePrototypeStore((s) => s.plans);
  const subscription = usePrototypeStore((s) => s.subscription);
  const done = checkout?.status === 'complete' && checkout.reference;
  const plan = done ? plans[checkout.planId] : null;

  if (!done || !plan) {
    return (
      <StateMessage
        icon={AlertCircle}
        title="No completed checkout"
        description="This page only confirms a checkout you completed a moment ago. Nothing has been purchased and your plan is unchanged."
        secondaryAction={<Button variant="outline" asChild><Link to="/settings/plan">View Plan &amp; billing</Link></Button>}
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
          <p className="type-caption text-ink-tertiary">Demo checkout complete</p>
          <h1 className="type-page-title text-ink-primary">You're on {plan.name}</h1>
        </div>
      </div>

      <p className="mt-4 type-body-small text-ink-secondary">
        Your prototype account has been switched to {plan.name} with {intervalLabel(checkout.interval).toLowerCase()}{' '}
        billing. This demonstrates the purchase journey only — no bank payment was made and no card was charged.
      </p>

      <div className="mt-6 rounded-container border border-line-subtle bg-surface-panel">
        <dl className="divide-y divide-line-subtle px-5 text-sm">
          <Row label="Plan" value={`Yueora ${plan.name}`} />
          <Row label="Billing interval" value={`Every ${intervalNoun(checkout.interval)}`} />
          <Row label="Amount" value={`${formatPrice(checkout.amount)} (demo — not charged)`} />
          <Row label="Demo reference" value={checkout.reference} mono />
          <Row label="Renews" value={subscription.renewal} />
        </dl>
        <div className="flex items-start gap-2 border-t border-line-subtle px-5 py-4 type-metadata text-ink-tertiary">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {checkout.reference} is a demo reference, not a payment transaction ID. A record labelled demo has been
            added to your billing history.
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild><Link to="/library">Go to Library</Link></Button>
        <Button variant="outline" asChild><Link to="/settings/plan">View Plan &amp; billing</Link></Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className={`text-right text-ink-primary ${mono ? 'font-mono text-xs tracking-wide' : ''}`}>{value}</dd>
    </div>
  );
}