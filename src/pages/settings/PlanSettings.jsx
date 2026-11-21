import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, ArrowRight, CreditCard, Receipt, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { NativeSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Surface } from '@/components/patterns/Surface';
import SettingsSection from '@/components/patterns/SettingsSection';
import { checkoutPath, formatPrice, intervalLabel, intervalNoun, PLAN_ORDER, yearlySavingPercent } from '@/lib/commercial';
import { getStorageUsageState, parseStorageToBytes } from '@/lib/commercialEntitlements';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PlanSettings() {
  const subscription = usePrototypeStore((s) => s.subscription);
  const billingHistory = usePrototypeStore((s) => s.billingHistory) || [];
  const account = usePrototypeStore((s) => s.account);
  const plans = usePrototypeStore((s) => s.plans);
  const cancelSubscription = usePrototypeStore((s) => s.cancelSubscription);
  const resumeSubscription = usePrototypeStore((s) => s.resumeSubscription);
  const downgradeToFree = usePrototypeStore((s) => s.downgradeToFree);
  const updatePaymentMethod = usePrototypeStore((s) => s.updatePaymentMethod);

  const [annual, setAnnual] = useState(subscription.billingInterval === 'yearly');
  const [dialog, setDialog] = useState(null);
  const [done, setDone] = useState(null);

  // Card update dialog state
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [newCardholder, setNewCardholder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newCvc, setNewCvc] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [cardError, setCardError] = useState('');

  // Receipt viewer state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const currentPlanId = subscription.plan || 'free';
  const isFree = currentPlanId === 'free';
  const isPaid = !isFree;
  const isCancelling = subscription.status === 'cancelling';
  const currentPlan = plans[currentPlanId] || plans.free;
  const chosenInterval = annual ? 'yearly' : 'monthly';
  const liveScoresCount = usePrototypeStore((s) => s.scores.filter((sc) => sc.ownership !== 'trash').length);
  const storageState = getStorageUsageState(subscription?.usage?.storage || '0 MB', currentPlanId);

  const payment = subscription.payment || { brand: 'Visa', last4: '4242', expMonth: '08', expYear: '29' };

  const confirm = () => {
    if (dialog === 'downgrade') downgradeToFree();
    if (dialog === 'cancel') cancelSubscription();
    setDone(dialog);
    setDialog(null);
    setTimeout(() => setDone(null), 2500);
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    setCardError('');
    if (!newCardholder.trim()) {
      setCardError('Please enter the cardholder name.');
      return;
    }
    const clean = newCardNumber.replace(/\s+/g, '');
    if (clean.length < 15) {
      setCardError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!newExpiry || !newExpiry.includes('/')) {
      setCardError('Please enter a valid expiration date (MM/YY).');
      return;
    }
    const [expMonth, expYear] = newExpiry.split('/').map((s) => s.trim());
    updatePaymentMethod({
      brand: 'Visa',
      last4: clean.slice(-4),
      expMonth: expMonth || '08',
      expYear: expYear || '29',
      cardholderName: newCardholder.trim(),
      billingCountry: newCountry,
    });
    setEditCardOpen(false);
    setNewCardholder('');
    setNewCardNumber('');
    setNewExpiry('');
    setNewCvc('');
  };

  // Alternative plans user can transition to
  const availablePlans = PLAN_ORDER.filter((id) => id !== 'free' && id !== currentPlanId).map((id) => plans[id]);
  const targetPlanForSaving = availablePlans[0] || plans.plus || plans.pro;
  const saving = yearlySavingPercent(targetPlanForSaving);

  return (
    <div className="divide-y divide-line-subtle">
      {/* 1. Current Plan */}
      <SettingsSection
        title="Current plan"
        desc={isPaid
          ? (isCancelling ? `${currentPlan.name} until ${subscription.cancelAt}, then Free.` : `You're on ${currentPlan.name}. Thanks for being on Yueora.`)
          : "You're on the Free plan."}
      >
        <Surface padding="md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="type-subsection font-medium text-ink-primary">{currentPlan.name}</p>
              <p className="type-body-small text-ink-secondary">
                {isPaid
                  ? `${intervalLabel(subscription.billingInterval)} billing · renews ${subscription.renewal}`
                  : 'No billing interval — the Free plan never renews.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPaid && !isCancelling ? (
                <>
                  <Button intent="secondary" size="sm" onClick={() => setDialog('downgrade')}>Downgrade</Button>
                  <Button intent="secondary" size="sm" onClick={() => setDialog('cancel')}>Cancel subscription</Button>
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
        </Surface>

        {isPaid && isCancelling && (
          <div className="mt-3 flex items-start gap-2 rounded-container border border-line-subtle bg-surface-panel p-3 type-body-small text-ink-secondary">
            <AlertCircle className="mt-0.5 icon-xs shrink-0 text-ink-tertiary" />
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

      {/* 2. Usage Section */}
      <SettingsSection title="Usage" desc="How much of your current plan quota you're using.">
        <div className="space-y-3">
          <UsageBar label="Scores" value={liveScoresCount} limit={currentPlan.scores} />
          <UsageBar label="Imports this month" value={subscription.usage.imports} limit={currentPlan.imports} />
          <UsageBar label="Storage" value={subscription.usage.storage} limit={currentPlan.storage} />
          {storageState.isAtLimit ? (
            <p className="type-metadata text-ink-primary bg-neutral-muted p-2.5 rounded-control border border-line-subtle">
              Storage limit reached. Free up space or upgrade your plan.
            </p>
          ) : storageState.isNearLimit ? (
            <p className="type-metadata text-ink-secondary bg-neutral-muted p-2.5 rounded-control border border-line-subtle">
              Storage is nearly full. New recordings may require additional space.
            </p>
          ) : null}
        </div>
      </SettingsSection>

      {/* 3. Available Paid Plan Options */}
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
              <span className={`type-metadata ${annual ? 'text-ink-primary font-medium' : 'text-ink-secondary'}`}>Yearly{saving > 0 ? ` (save ${saving}%)` : ''}</span>
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
                      <p className="type-subsection font-medium text-ink-primary">{p.name}</p>
                      <span className="type-caption text-ink-tertiary">
                        {p.id === 'plus' ? 'Most Popular' : 'Unlimited'}
                      </span>
                    </div>
                    <p className="mt-2 type-section-title font-medium text-ink-primary">
                      {formatPrice(price)}
                      <span className="type-metadata font-normal text-ink-tertiary"> / {intervalNoun(chosenInterval)}</span>
                    </p>
                    <ul className="mt-4 space-y-2 type-body-small text-ink-secondary">
                      <li className="flex items-center gap-2"><Check className="icon-xs text-brand" /> {p.scores} in library</li>
                      <li className="flex items-center gap-2"><Check className="icon-xs text-brand" /> {p.imports}</li>
                      <li className="flex items-center gap-2"><Check className="icon-xs text-brand" /> {p.storage} storage</li>
                      {p.analytics && <li className="flex items-center gap-2"><Check className="icon-xs text-brand" /> Practice insights</li>}
                      {p.export && <li className="flex items-center gap-2"><Check className="icon-xs text-brand" /> Recording downloads</li>}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full" asChild>
                      <Link to={checkoutPath(p.id, chosenInterval)}>
                        {isUpgrade ? `Upgrade to ${p.name}` : `Switch to ${p.name}`} <ArrowRight className="ml-1.5 icon-xs" />
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
      <SettingsSection title="Payment method" desc={`How you pay for ${isPaid ? currentPlan.name : 'your subscription'}.`}>
        <Surface padding="md" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-neutral-muted text-ink-primary shrink-0">
              <CreditCard className="icon-sm" />
            </span>
            <div>
              <p className="type-body-small font-medium text-ink-primary">
                {payment.brand || 'Visa'} •••• {payment.last4 || '4242'}
              </p>
              <p className="type-metadata text-ink-secondary">
                Expires {payment.expMonth || '08'}/{payment.expYear || '29'}
              </p>
            </div>
          </div>
          <Button intent="secondary" size="sm" onClick={() => setEditCardOpen(true)}>
            Change payment method
          </Button>
        </Surface>
      </SettingsSection>

      {/* 5. Billing History */}
      <SettingsSection title="Billing history" desc="Past payments and itemized invoice receipts.">
        {billingHistory.length === 0 ? (
          <p className="type-body-small text-ink-secondary">No billing records yet.</p>
        ) : (
          <div className="rounded-container border border-line-subtle bg-surface-panel overflow-hidden">
            <div className="divide-y divide-line-subtle type-body-small">
              {billingHistory.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-neutral-hover transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-primary">{b.date} · {b.amount}</p>
                    <p className="type-metadata text-ink-tertiary">
                      {b.plan} · {b.invoice}
                      <span className="ml-2 rounded-control bg-neutral-muted px-2 py-0.5 type-caption text-ink-primary">
                        Paid
                      </span>
                    </p>
                  </div>
                  <Button intent="secondary" size="sm" onClick={() => setSelectedReceipt(b)}>
                    <Receipt className="mr-1.5 icon-xs" /> View receipt
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SettingsSection>

      {/* Downgrade / Cancel Dialog */}
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
            <Button intent="secondary" onClick={() => setDialog(null)}>Keep {currentPlan.name}</Button>
            <Button intent={dialog === 'cancel' ? 'danger' : 'primary'} onClick={confirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Payment Method Dialog */}
      <Dialog open={editCardOpen} onOpenChange={setEditCardOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCard} className="space-y-4">
            {cardError && (
              <div role="alert" className="flex items-center gap-2 rounded-control bg-danger/10 p-2.5 text-danger type-metadata">
                <AlertCircle className="icon-xs shrink-0" />
                <span>{cardError}</span>
              </div>
            )}
            <Field label="Cardholder name" htmlFor="editCardName" required>
              <Input
                id="editCardName"
                value={newCardholder}
                onChange={(e) => setNewCardholder(e.target.value)}
                placeholder="Alex Morgan"
                required
              />
            </Field>
            <Field label="Card number" htmlFor="editCardNum" required>
              <Input
                id="editCardNum"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                placeholder="4242 •••• •••• 4242"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiration" htmlFor="editExpiry" required>
                <Input
                  id="editExpiry"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
              </Field>
              <Field label="CVC" htmlFor="editCvc" required>
                <Input
                  id="editCvc"
                  value={newCvc}
                  onChange={(e) => setNewCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </Field>
            </div>
            <Field label="Billing country / region" htmlFor="editCountry">
              <NativeSelect
                id="editCountry"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
              </NativeSelect>
            </Field>
            <DialogFooter>
              <Button type="button" intent="secondary" onClick={() => setEditCardOpen(false)}>Cancel</Button>
              <Button type="submit">Save card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog */}
      <Dialog open={selectedReceipt !== null} onOpenChange={(o) => !o && setSelectedReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yueora Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 type-body-small">
              <div className="rounded-container border border-line-subtle bg-surface-panel p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                  <div>
                    <p className="type-caption text-ink-tertiary">Invoice Number</p>
                    <p className="type-body-small font-mono font-medium text-ink-primary">{selectedReceipt.invoice}</p>
                  </div>
                  <span className="rounded-control bg-neutral-muted px-2.5 py-0.5 type-caption text-ink-primary">
                    Paid
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 type-metadata">
                  <div>
                    <span className="type-caption text-ink-tertiary">Date Paid</span>
                    <p className="type-body-small text-ink-primary mt-0.5">{selectedReceipt.date}</p>
                  </div>
                  <div>
                    <span className="type-caption text-ink-tertiary">Billing Interval</span>
                    <p className="type-body-small text-ink-primary mt-0.5">{selectedReceipt.plan.includes('yearly') ? 'Yearly' : 'Monthly'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 type-metadata">
                  <div>
                    <span className="type-caption text-ink-tertiary">Payment Method</span>
                    <p className="type-body-small text-ink-primary mt-0.5">{payment.brand || 'Visa'} •••• {payment.last4 || '4242'}</p>
                  </div>
                  <div>
                    <span className="type-caption text-ink-tertiary">Plan</span>
                    <p className="type-body-small text-ink-primary mt-0.5">{selectedReceipt.plan}</p>
                  </div>
                </div>

                <div className="border-t border-line-subtle pt-3 type-metadata">
                  <span className="type-caption text-ink-tertiary">Billed To</span>
                  <p className="type-body-small font-medium text-ink-primary mt-0.5">{account?.displayName || 'Alex Morgan'}</p>
                  <p className="type-caption text-ink-secondary">{account?.email || 'you@example.com'}</p>
                  <p className="type-caption text-ink-tertiary mt-0.5">123 Music Row, Suite 400, Los Angeles, CA 90028</p>
                </div>

                <div className="border-t border-line-subtle pt-3 space-y-1.5 type-metadata">
                  <div className="flex justify-between text-ink-secondary">
                    <span>Subtotal</span>
                    <span>{selectedReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-line-subtle pt-1.5 type-body-small font-medium text-ink-primary">
                    <span>Total Paid</span>
                    <span>{selectedReceipt.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <Button intent="secondary" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 icon-xs" /> Print receipt
                </Button>
                <Button intent="secondary" size="sm" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsageBar({ label, value, limit }) {
  const isStorage = typeof label === 'string' && label.toLowerCase().includes('storage');
  const numValue = isStorage ? parseStorageToBytes(value) : (typeof value === 'number' ? value : parseFloat(value));
  const numLimit = isStorage ? parseStorageToBytes(limit) : (typeof limit === 'number' ? limit : parseFloat(limit));
  const isUnlimited = typeof limit === 'string' && limit.toLowerCase().includes('unlimited');
  const hasNumericLimit = !isUnlimited && !Number.isNaN(numValue) && !Number.isNaN(numLimit) && numLimit > 0;
  const pct = hasNumericLimit ? Math.min(100, Math.max(0, Math.round((numValue / numLimit) * 100))) : null;

  return (
    <div>
      <div className="flex justify-between type-body-small">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-primary">{value} / {limit}</span>
      </div>
      {pct !== null && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-muted">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
