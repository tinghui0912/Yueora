import { useState } from 'react';
import { Check, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { currentPlan, billingHistory, plans } from '@/lib/mockData';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PlanSettings() {
  const [plan, setPlan] = useState('pro');
  const [annual, setAnnual] = useState(true);
  const [dialog, setDialog] = useState(null); // upgrade | downgrade | cancel | null
  const [done, setDone] = useState(null);

  const confirm = () => {
    if (dialog === 'upgrade') setPlan('pro');
    if (dialog === 'downgrade') setPlan('free');
    if (dialog === 'cancel') setPlan('free');
    setDone(dialog);
    setDialog(null);
  };

  const isPro = plan === 'pro';

  return (
    <div className="space-y-6">
      <Section title="Current plan" desc={isPro ? 'You’re on Pro. Thanks for being on Yueora.' : 'You’re on the Free plan.'}>
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="flex items-center gap-1.5 font-display text-lg font-medium">{isPro && <Sparkles className="h-4 w-4 text-gold" />} {plans[plan].name}</p>
            <p className="text-sm text-muted-foreground">{plans[plan].scores} · {plans[plan].storage} storage</p>
          </div>
          {isPro ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialog('downgrade')}>Downgrade</Button>
              <Button variant="outline" size="sm" onClick={() => setDialog('cancel')}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setDialog('upgrade')}>Upgrade to Pro</Button>
          )}
        </div>
        {isPro && <p className="mt-2 text-xs text-muted-foreground">Renews {currentPlan.renewal} · {currentPlan.payment}</p>}
      </Section>

      {isPro && (
        <Section title="Usage" desc="How much of your plan you’re using.">
          <div className="space-y-3">
            <UsageBar label="Scores" value={currentPlan.usage.scores} limit={currentPlan.usage.scoreLimit} />
            <UsageBar label="Imports this month" value={currentPlan.usage.imports} limit={currentPlan.usage.importLimit} />
            <UsageBar label="Storage" value={currentPlan.usage.storage} limit={currentPlan.usage.storageLimit} />
          </div>
        </Section>
      )}

      <Section title="Pro plan" desc="Unlimited scores, analytics, and export.">
        <div className="rounded-md border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-medium">Pro</p>
              <p className="mt-1 text-sm text-muted-foreground">${annual ? plans.pro.priceYearly : plans.pro.priceMonthly}/{annual ? 'year' : 'month'}</p>
            </div>
            <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Annual</span><Switch checked={annual} onCheckedChange={setAnnual} /></div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {['Unlimited scores', 'Unlimited imports & recognition', 'Practice analytics', '10 GB storage', 'View & edit sharing', 'Export / download'].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</li>
            ))}
          </ul>
          {isPro ? <Button variant="outline" className="mt-5" disabled>Current plan</Button> : <Button className="mt-5" onClick={() => setDialog('upgrade')}>Upgrade to Pro</Button>}
        </div>
      </Section>

      <Section title="Payment method" desc="How you pay for Pro.">
        <div className="flex items-center justify-between">
          <span className="text-sm">{isPro ? currentPlan.payment : 'No card on file'}</span>
          <Button variant="outline" size="sm">{isPro ? 'Update' : 'Add card'}</Button>
        </div>
      </Section>

      <Section title="Billing history" desc="Past invoices and receipts.">
        {billingHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No charges yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {billingHistory.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div><p className="font-medium">{b.date} · {b.amount}</p><p className="text-xs text-muted-foreground">{b.plan} · {b.invoice}</p></div>
                <Button variant="ghost" size="sm"><Download className="mr-1.5 h-4 w-4" /> Invoice</Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Dialogs */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{dialog === 'upgrade' ? 'Upgrade to Pro' : dialog === 'downgrade' ? 'Downgrade to Free' : 'Cancel subscription'}</DialogTitle></DialogHeader>
          {done ? (
            <p className="py-4 text-sm text-primary">{done === 'upgrade' ? 'Welcome to Pro!' : done === 'downgrade' ? 'You’re now on Free.' : 'Subscription cancelled.'} Changes take effect at your next renewal.</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dialog === 'upgrade' ? 'You’ll be charged the Pro rate at your next renewal.' : dialog === 'downgrade' ? 'You’ll keep Pro until your renewal, then move to Free.' : 'Your plan will end at the next renewal. You can resume anytime.'}
            </p>
          )}
          <DialogFooter>
            {done ? <Button onClick={() => setDone(null)}>Done</Button> : (<>
              <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              <Button variant={dialog === 'cancel' ? 'destructive' : 'default'} onClick={confirm}>Confirm</Button>
            </>)}
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
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span>{value} / {limit}</span></div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}