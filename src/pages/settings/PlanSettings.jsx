import { useState } from 'react';
import { Check, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrototypeStore } from '@/stores/prototypeStore';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PlanSettings() {
  const subscription = usePrototypeStore((s) => s.subscription);
  const billingHistory = usePrototypeStore((s) => s.billingHistory);
  const plans = usePrototypeStore((s) => s.plans);
  const upgradeToPro = usePrototypeStore((s) => s.upgradeToPro);
  const cancelSubscription = usePrototypeStore((s) => s.cancelSubscription);
  const resumeSubscription = usePrototypeStore((s) => s.resumeSubscription);
  const downgradeToFree = usePrototypeStore((s) => s.downgradeToFree);

  const [annual, setAnnual] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [done, setDone] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [paySaving, setPaySaving] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const updatePayment = usePrototypeStore((s) => s.updatePayment);

  const isPro = subscription.plan === 'pro';
  const isCancelling = subscription.status === 'cancelling';

  const confirm = () => {
    if (dialog === 'upgrade') upgradeToPro();
    if (dialog === 'downgrade') downgradeToFree();
    if (dialog === 'cancel') cancelSubscription();
    setDone(dialog);
    setDialog(null);
    setTimeout(() => setDone(null), 2500);
  };

  const downloadInvoice = (invoiceId) => {
    setDownloadingInvoice(invoiceId);
    setTimeout(() => setDownloadingInvoice(null), 1500);
  };

  return (
    <div className="space-y-6">
      <Section title="Current plan" desc={isPro ? (isCancelling ? `Pro until ${subscription.cancelAt}, then Free.` : "You're on Pro. Thanks for being on Yueora.") : "You're on the Free plan."}>
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="flex items-center gap-1.5 font-display text-lg font-medium">{isPro && <Sparkles className="h-4 w-4 text-gold" />} {plans[subscription.plan]?.name || 'Pro'}</p>
            <p className="text-sm text-muted-foreground">{plans[subscription.plan]?.scores} · {plans[subscription.plan]?.storage} storage</p>
          </div>
          {isPro && !isCancelling ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialog('downgrade')}>Downgrade</Button>
              <Button variant="outline" size="sm" onClick={() => setDialog('cancel')}>Cancel</Button>
            </div>
          ) : isPro && isCancelling ? (
            <Button size="sm" onClick={() => { resumeSubscription(); setDone('resume'); setTimeout(() => setDone(null), 2500); }}>Resume Pro</Button>
          ) : (
            <Button size="sm" onClick={() => setDialog('upgrade')}>Upgrade to Pro</Button>
          )}
        </div>
        {isPro && !isCancelling && <p className="mt-2 text-xs text-muted-foreground">Renews {subscription.renewal} · {subscription.payment.method} •{subscription.payment.last4}</p>}
        {isPro && isCancelling && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-accent/40 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Your subscription ends on {subscription.cancelAt}. You'll keep Pro features until then.</span>
          </div>
        )}
        {done && <p className="mt-2 text-sm text-primary">{done === 'upgrade' ? 'Welcome to Pro!' : done === 'resume' ? 'Subscription resumed — welcome back.' : done === 'downgrade' ? `You'll keep Pro until ${subscription.cancelAt}, then move to Free.` : 'Subscription cancelled.'}</p>}
      </Section>

      {isPro && (
        <Section title="Usage" desc="How much of your plan you're using.">
          <div className="space-y-3">
            <UsageBar label="Scores" value={subscription.usage.scores} limit={plans.pro.scores} />
            <UsageBar label="Imports this month" value={subscription.usage.imports} limit="Unlimited" />
            <UsageBar label="Storage" value={subscription.usage.storage} limit="10 GB" />
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
          <span className="text-sm">{isPro ? `${subscription.payment.method} •${subscription.payment.last4}` : 'No card on file'}</span>
          <Button variant="outline" size="sm" onClick={() => setPayOpen(true)}>{isPro ? 'Update' : 'Add card'}</Button>
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
                <Button variant="ghost" size="sm" onClick={() => downloadInvoice(b.id)} disabled={downloadingInvoice === b.id}>
                  <Download className="mr-1.5 h-4 w-4" /> {downloadingInvoice === b.id ? 'Preparing…' : 'Invoice'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{dialog === 'upgrade' ? 'Upgrade to Pro' : dialog === 'downgrade' ? 'Downgrade to Free' : 'Cancel subscription'}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {dialog === 'upgrade' ? 'You\'ll be charged the Pro rate at your next renewal.' : dialog === 'downgrade' ? `You\'ll keep Pro until ${subscription.renewal}, then move to Free.` : 'Your plan will end at the next renewal. You can resume anytime.'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant={dialog === 'cancel' ? 'destructive' : 'default'} onClick={confirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment method dialog */}
      <Dialog open={payOpen} onOpenChange={(o) => !o && setPayOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isPro ? 'Update payment method' : 'Add a card'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="card">Card number</Label>
              <Input id="card" value={cardNum} onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" placeholder="12/28" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                setPaySaving(true);
                setTimeout(() => {
                  const last4 = cardNum.slice(-4) || '4242';
                  updatePayment('Visa', last4);
                  setPaySaving(false);
                  setPayOpen(false);
                  setCardNum('');
                }, 1000);
              }} disabled={paySaving || cardNum.length < 12}>{paySaving ? 'Saving…' : 'Save card'}</Button>
            </DialogFooter>
          </div>
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