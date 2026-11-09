import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import { checkoutPath, formatPrice, intervalLabel, intervalNoun } from '@/lib/commercial';
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

  const isPro = subscription.plan === 'pro';
  const isCancelling = subscription.status === 'cancelling';
  const currentPlan = plans[subscription.plan] || plans.free;
  const chosenInterval = annual ? 'yearly' : 'monthly';

  const confirm = () => {
    if (dialog === 'downgrade') downgradeToFree();
    if (dialog === 'cancel') cancelSubscription();
    setDone(dialog);
    setDialog(null);
    setTimeout(() => setDone(null), 2500);
  };

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection
        title="Current plan"
        desc={isPro
          ? (isCancelling ? `Pro until ${subscription.cancelAt}, then Free.` : "You're on Pro. Thanks for being on Yueora.")
          : "You're on the Free plan."}
      >
        <div className="rounded-container border border-line-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-medium text-ink-primary">{currentPlan.name}</p>
              <p className="type-body-small text-ink-secondary">
                {isPro
                  ? `${intervalLabel(subscription.billingInterval)} billing · renews ${subscription.renewal}`
                  : 'No billing interval — the Free plan never renews.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPro && !isCancelling ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setDialog('downgrade')}>Downgrade</Button>
                  <Button variant="outline" size="sm" onClick={() => setDialog('cancel')}>Cancel subscription</Button>
                </>
              ) : isPro && isCancelling ? (
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

        {isPro && isCancelling && (
          <div className="mt-3 flex items-start gap-2 rounded-container border border-line-subtle bg-accent/40 p-3 type-body-small text-ink-secondary">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
            <span>
              Your Pro plan stays active until {subscription.cancelAt}. Nothing changes before then, and you can resume
              at any time.
            </span>
          </div>
        )}
        {done && (
          <p className="mt-2 type-body-small text-brand">
            {done === 'resume' ? 'Subscription resumed — welcome back.' : done === 'downgrade' ? `You'll keep Pro until ${subscription.cancelAt}, then move to Free.` : 'Subscription cancelled. Pro stays active until the end of the period.'}
          </p>
        )}
      </SettingsSection>

      {isPro && (
        <SettingsSection title="Usage" desc="How much of your plan you're using.">
          <div className="space-y-3">
            <UsageBar label="Scores" value={subscription.usage.scores} limit={currentPlan.scores} />
            <UsageBar label="Imports this month" value={subscription.usage.imports} limit="Unlimited" />
            <UsageBar label="Storage" value={subscription.usage.storage} limit={`${currentPlan.storage}`} />
          </div>
        </SettingsSection>
      )}

      {!isPro && (
        <SettingsSection title="Pro plan" desc="Unlimited scores, insights, and recording downloads.">
          <div className="rounded-container border border-line-subtle p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-medium text-ink-primary">Pro</p>
                <p className="mt-1 type-body-small text-ink-secondary">
                  {formatPrice(annual ? plans.pro.priceYearly : plans.pro.priceMonthly)} / {intervalNoun(chosenInterval)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-metadata text-ink-secondary">Yearly</span>
                <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Choose yearly billing" />
              </div>
            </div>
            <ul className="mt-4 space-y-2 type-body-small text-ink-secondary">
              {[`${plans.pro.scores} scores`, plans.pro.imports, 'Practice insights', `${plans.pro.storage} storage`, `${plans.pro.sharing} sharing`, 'Recording downloads'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> {f}</li>
              ))}
            </ul>
            <Button className="mt-5" asChild>
              <Link to={checkoutPath('pro', chosenInterval)}>
                Continue to checkout <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-2 type-metadata text-ink-tertiary">
              Your plan changes only when you complete the demo checkout.
            </p>
          </div>
        </SettingsSection>
      )}

      <SettingsSection title="Payment method" desc="How you pay for Pro.">
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
                    {b.demo && <span className="ml-2 rounded-control bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">Demo</span>}
                  </p>
                </div>
                <span className="type-metadata text-ink-tertiary">No invoice file in this prototype</span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog === 'downgrade' ? 'Downgrade to Free' : 'Cancel subscription'}</DialogTitle>
          </DialogHeader>
          <p className="type-body-small text-ink-secondary">
            {dialog === 'downgrade'
              ? `You'll keep Pro until ${subscription.renewal}, then move to Free.`
              : 'Your plan will end at the next renewal. You can resume anytime.'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Keep Pro</Button>
            <Button variant={dialog === 'cancel' ? 'destructive' : 'default'} onClick={confirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsageBar({ label, value, limit }) {
  const pct = limit === 'Unlimited' ? 8 : 50;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-primary">{value} / {limit}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}