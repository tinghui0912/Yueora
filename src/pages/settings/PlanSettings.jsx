import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import { checkoutPath, formatPrice, intervalLabel, intervalNoun, PLAN_ORDER } from '@/lib/commercial';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PlanSettings() {
  const subscription = usePrototypeStore((s) => s.subscription);
  const billingHistory = usePrototypeStore((s) => s.billingHistory);
  const plans = usePrototypeStore((s) => s.plans);
  const cancelSubscription = usePrototypeStore((s) => s.cancelSubscription);
  const resumeSubscription = usePrototypeStore((s) => s.resumeSubscription);
  const downgradeToFree = usePrototypeStore((s) => s.downgradeToFree);

  const [annual, setAnnual] = useState(subscription.billingInterval === 'yearly');
  const [dialog, setDialog] = useState(null);
  const [done, setDone] = useState(null);

  const currentPlanId = subscription.plan || 'free';
  const isFree = currentPlanId === 'free';
  const isPaid = !isFree;
  const isCancelling = subscription.status === 'cancelling';
  const currentPlan = plans[currentPlanId] || plans.free;
  const chosenInterval = annual ? 'yearly' : 'monthly';

  const confirm = () => {
    if (dialog === 'downgrade') downgradeToFree();
    if (dialog === 'cancel') cancelSubscription();
    setDone(dialog);
    setDialog(null);
    setTimeout(() => setDone(null), 2500);
  };

  // Alternative plans user can transition to
  const availablePlans = PLAN_ORDER.filter((id) => id !== 'free' && id !== currentPlanId).map((id) => plans[id]);

  return (
    <div className="divide-y divide-line-subtle">
      {/* 1. Current Plan */}
      <SettingsSection
        title="Current plan"
        desc={isPaid
          ? (isCancelling ? `${currentPlan.name} until ${subscription.cancelAt}, then Free.` : `You're on ${currentPlan.name}. Thanks for being on Yueora.`)
          : "You're on the Free plan."}
      >
        <div className="rounded-container border border-line-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-medium text-ink-primary">{currentPlan.name}</p>
              <p className="type-body-small text-ink-secondary">
                {isPaid
                  ? `${intervalLabel(subscription.billingInterval)} billing · renews ${subscription.renewal}`
                  : 'No billing interval — the Free plan never renews.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPaid && !isCancelling ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setDialog('downgrade')}>Downgrade</Button>
                  <Button variant="outline" size="sm" onClick={() => setDialog('cancel')}>Cancel subscription</Button>
                </>
              ) : isPaid && isCancelling ? (
                <Button size="sm" onClick={() => { resumeSubscription(); setDone('resume'); setTimeout(() => setDone(null), 2500); }}>
                  Resume subscription
                </Button>
              ) : null}
            </div>
          </div>

          <ul className="mt-4 grid gap-1.5 border-t border-line-subtle pt-3 type-metadata text-ink-secondary sm:grid-cols-2">
            <li>{currentPlan.scores} in your library</li>
            <li>{currentPlan.imports}</li>
            <li>{currentPlan.storage} of storage</li>
            <li>{currentPlan.sharing} sharing</li>
          </ul>
        </div>

        {isPaid && isCancelling && (
          <div className="mt-3 flex items-start gap-2 rounded-container border border-line-subtle bg-surface-panel p-3 type-body-small text-ink-secondary">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
            <span>
              Your {currentPlan.name} plan stays active until {subscription.cancelAt}. Nothing changes before then, and you can resume
              at any time.
            </span>
          </div>
        )}
        {done && (
          <p className="mt-2 type-body-small text-brand">
            {done === 'resume'
              ? 'Subscription resumed — welcome back.'
              : done === 'downgrade'
                ? `You'll keep ${currentPlan.name} until ${subscription.cancelAt}, then move to Free.`
                : `Subscription cancelled. ${currentPlan.name} stays active until the end of the period.`}
          </p>
        )}
      </SettingsSection>

      {/* 2. Usage Section (Available for all or paid accounts) */}
      <SettingsSection title="Usage" desc="How much of your current plan quota you're using.">
        <div className="space-y-3">
          <UsageBar label="Scores" value={subscription.usage.scores} limit={currentPlan.scores} />
          <UsageBar label="Imports this month" value={subscription.usage.imports} limit={currentPlan.imports} />
          <UsageBar label="Storage" value={subscription.usage.storage} limit={currentPlan.storage} />
        </div>
      </SettingsSection>

      {/* 3. Available Paid Plan Options (Free can upgrade to Plus/Pro; Plus can upgrade to Pro; Pro can switch to Plus) */}
      {availablePlans.length > 0 && (
        <SettingsSection
          title={isFree ? 'Upgrade plan' : 'Change plan'}
          desc={isFree ? 'Unlock more score capacity, practice insights, and storage.' : 'Switch to another plan that fits your practice cadence.'}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="type-body-small text-ink-secondary font-medium">Billing interval</span>
            <div className="flex items-center gap-2">
              <span className={`type-metadata ${!annual ? 'text-ink-primary font-medium' : 'text-ink-secondary'}`}>Monthly</span>
              <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Choose yearly billing" />
              <span className={`type-metadata ${annual ? 'text-ink-primary font-medium' : 'text-ink-secondary'}`}>Yearly (save 17%)</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {availablePlans.map((p) => {
              const price = annual ? p.priceYearly : p.priceMonthly;
              const isUpgrade = currentPlanId === 'free' || (currentPlanId === 'plus' && p.id === 'pro');
              return (
                <div key={p.id} className="rounded-container border border-line-subtle bg-surface-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xl font-medium text-ink-primary">{p.name}</p>
                      <span className="type-caption uppercase tracking-wider text-ink-tertiary">
                        {p.id === 'plus' ? 'Most Popular' : 'Unlimited'}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-2xl font-medium text-ink-primary">
                      {formatPrice(price)}
                      <span className="text-sm font-normal text-ink-tertiary"> / {intervalNoun(chosenInterval)}</span>
                    </p>
                    <ul className="mt-4 space-y-2 type-body-small text-ink-secondary">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> {p.scores} in library</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> {p.imports}</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> {p.storage} storage</li>
                      {p.analytics && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> Practice insights</li>}
                      {p.export && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> Recording downloads</li>}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full" asChild>
                      <Link to={checkoutPath(p.id, chosenInterval)}>
                        {isUpgrade ? `Upgrade to ${p.name}` : `Switch to ${p.name}`} <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SettingsSection>
      )}

      {/* 4. Payment Method */}
      <SettingsSection title="Payment method" desc={`How you pay for ${isPaid ? currentPlan.name : 'Yueora'}.`}>
        <div className="rounded-container border border-line-subtle p-4">
          <p className="flex items-start gap-2 type-body-small text-ink-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
            <span>
              Payment method management is not connected in this prototype. No card details are collected or stored.
            </span>
          </p>
          <p className="mt-2 type-metadata text-ink-tertiary">
            Sample data shown elsewhere in this prototype is demo data, not a real card.
          </p>
        </div>
      </SettingsSection>

      {/* 5. Billing History */}
      <SettingsSection title="Billing history" desc="Demo records from this prototype. No real payments.">
        {billingHistory.length === 0 ? (
          <p className="type-body-small text-ink-secondary">No records yet.</p>
        ) : (
          <ul className="divide-y divide-line-subtle text-sm">
            {billingHistory.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-ink-primary">{b.date} · {b.amount}</p>
                  <p className="type-metadata text-ink-tertiary">
                    {b.plan} · {b.invoice}
                    {b.demo && <span className="ml-2 rounded-control bg-neutral-muted px-2 py-0.5 type-caption font-semibold uppercase tracking-wider text-ink-secondary">Demo</span>}
                  </p>
                </div>
                <span className="type-metadata text-ink-tertiary">No invoice file in this prototype</span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>

      {/* Confirmation Dialog */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog === 'downgrade' ? 'Downgrade to Free' : 'Cancel subscription'}</DialogTitle>
          </DialogHeader>
          <p className="type-body-small text-ink-secondary">
            {dialog === 'downgrade'
              ? `You'll keep ${currentPlan.name} until ${subscription.renewal}, then move to Free.`
              : `Your ${currentPlan.name} plan will end at the next renewal. You can resume anytime.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Keep {currentPlan.name}</Button>
            <Button variant={dialog === 'cancel' ? 'destructive' : 'default'} onClick={confirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsageBar({ label, value, limit }) {
  const isUnlimited = typeof limit === 'string' && limit.toLowerCase().includes('unlimited');
  const pct = isUnlimited ? 12 : 45;
  return (
    <div>
      <div className="flex justify-between type-body-small">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-primary">{value} / {limit}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-muted">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
