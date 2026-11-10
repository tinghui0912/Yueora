import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { readCheckoutQuery } from '@/lib/commercial';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OrderSummary from '@/components/commercial/OrderSummary';
import StateMessage from '@/components/patterns/StateMessage';

/**
 * Checkout — a demo purchase journey. No card details are collected, no payment
 * provider is contacted, and the only state change is a local prototype
 * subscription update after an explicit confirmation.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const plans = usePrototypeStore((s) => s.plans);
  const subscription = usePrototypeStore((s) => s.subscription);
  const completeDemoCheckout = usePrototypeStore((s) => s.completeDemoCheckout);

  // One key per checkout visit: a repeated click cannot record a second purchase.
  const sessionKey = useRef(`cs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).current;
  const [confirming, setConfirming] = useState(false);

  const { planId, interval, plan, reason } = readCheckoutQuery(window.location.search, plans);

  if (reason) {
    return (
      <StateMessage
        icon={ShieldCheck}
        title="Nothing to check out"
        description={reason}
        primaryAction={<Button asChild><Link to="/pricing">Back to pricing</Link></Button>}
      />
    );
  }

  const alreadyOnPlan = subscription.plan === planId && subscription.status === 'active';

  if (alreadyOnPlan) {
    return (
      <StateMessage
        icon={Check}
        tone="brand"
        title={`You're already on ${plan.name}`}
        description={`Your ${plan.name} subscription is active and renews ${subscription.renewal}. Nothing needs to be purchased again.`}
        secondaryAction={<Button variant="outline" asChild><Link to="/pricing">View pricing</Link></Button>}
        primaryAction={<Button asChild><Link to="/settings/plan">Manage plan</Link></Button>}
      />
    );
  }

  const complete = () => {
    completeDemoCheckout({ planId, interval, sessionKey });
    setConfirming(false);
    navigate('/checkout/success', { replace: true });
  };

  const cancel = () => navigate('/checkout/cancelled', { replace: true });

  return (
    <div>
      <p className="type-caption text-ink-tertiary">Checkout</p>
      <h1 className="mt-1 type-page-title text-ink-primary">Review your plan</h1>
      <p className="mt-2 max-w-xl type-body-small text-ink-secondary">
        One small step before you continue. You can go back at any point, and nothing changes until you confirm.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px] md:items-start">
        <div className="order-2 md:order-1">
          <div className="rounded-container border border-line-subtle bg-surface-panel p-5">
            <p className="type-caption text-ink-tertiary">Prototype checkout</p>
            <p className="mt-2 type-body-small text-ink-primary">
              Prototype checkout — no real payment will be processed and no charge will be made.
            </p>
            <p className="mt-2 type-body-small text-ink-secondary">
              Yueora does not ask for a card number, expiry date, or security code in this demo, and it does not
              contact a payment provider.
            </p>
          </div>

          <ul className="mt-5 space-y-2 type-body-small text-ink-secondary">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {plan.name} features switch on for this prototype account immediately.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> A demo record is added to Billing history, clearly marked as demo.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> You can cancel, downgrade, or resume later from Plan &amp; billing.</li>
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            <Button onClick={() => setConfirming(true)}>
              Complete demo checkout <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={cancel}>Cancel checkout</Button>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <OrderSummary plan={plan} interval={interval} />
        </div>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm demo checkout</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary">
            This switches your prototype account to {plan.name} ({interval}), and adds a demo record to your billing
            history. No payment is taken.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>Not yet</Button>
            <Button onClick={complete}>Complete demo checkout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}