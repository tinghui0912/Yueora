import { intervalLabel, intervalNoun, planPrice, formatPrice, monthlyEquivalent } from '@/lib/commercial';

/**
 * OrderSummary — the single rendering of "what you are about to buy".
 * Every value is derived from the plan definition; nothing is hardcoded here.
 */
export default function OrderSummary({ plan, interval, className = '' }) {
  if (!plan) return null;
  const price = planPrice(plan, interval);
  const monthly = monthlyEquivalent(plan, interval);

  return (
    <div className={`rounded-container border border-line-subtle bg-surface-panel ${className}`}>
      <div className="border-b border-line-subtle px-5 py-4">
        <p className="type-caption text-ink-tertiary">Order summary</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-medium text-ink-primary">{plan.name}</p>
          <p className="type-metadata text-ink-secondary">{intervalLabel(interval)} billing</p>
        </div>
      </div>

      <dl className="divide-y divide-line-subtle px-5 text-sm">
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-ink-secondary">Plan</dt>
          <dd className="text-ink-primary">Yueora {plan.name}</dd>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-ink-secondary">Billing interval</dt>
          <dd className="text-ink-primary">Every {intervalNoun(interval)}</dd>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-ink-secondary">Unit price</dt>
          <dd className="text-ink-primary">{formatPrice(price)} / {intervalNoun(interval)}</dd>
        </div>
        {interval === 'yearly' && (
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-ink-secondary">Works out as</dt>
            <dd className="text-ink-secondary">${monthly} / month, billed once a year</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between py-3">
          <dt className="font-medium text-ink-primary">Due today</dt>
          <dd className="font-display text-lg font-medium text-ink-primary">{formatPrice(price)}</dd>
        </div>
      </dl>

      <div className="border-t border-line-subtle px-5 py-4">
        <ul className="space-y-1 type-metadata text-ink-secondary">
          <li>{plan.scores} in your library</li>
          <li>{plan.imports}</li>
          <li>{plan.storage} of storage</li>
          <li>{plan.sharing} sharing</li>
        </ul>
        <p className="mt-3 type-metadata text-ink-tertiary">
          Pro features would begin immediately and the subscription would renew every {intervalNoun(interval)}.
        </p>
      </div>
    </div>
  );
}