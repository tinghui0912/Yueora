import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ShieldCheck, ArrowRight, CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { readCheckoutQuery, planPrice, formatPrice, intervalNoun } from '@/lib/commercial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { NativeSelect } from '@/components/ui/select';
import OrderSummary from '@/components/commercial/OrderSummary';
import StateMessage from '@/components/patterns/StateMessage';

export default function Checkout() {
  const navigate = useNavigate();
  const plans = usePrototypeStore((s) => s.plans);
  const subscription = usePrototypeStore((s) => s.subscription);
  const account = usePrototypeStore((s) => s.account);
  const completeDemoCheckout = usePrototypeStore((s) => s.completeDemoCheckout);
  const updatePaymentMethod = usePrototypeStore((s) => s.updatePaymentMethod);

  // One key per checkout visit: a repeated click cannot record a duplicate purchase
  const sessionKey = useRef(`cs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).current;

  const { planId, interval, plan, reason } = readCheckoutQuery(window.location.search, plans);

  // Mock payment card state
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState(account?.displayName || 'Alex Morgan');
  const [billingCountry, setBillingCountry] = useState('United States');

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    setPaymentError('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setPaymentError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      setPaymentError('Please enter a valid card expiry date (MM/YY).');
      return;
    }
    if (cardCvc.length < 3) {
      setPaymentError('Please enter a valid 3 or 4-digit security code (CVC).');
      return;
    }
    if (!cardName.trim()) {
      setPaymentError('Please enter the name printed on your card.');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      // Save card details in store
      const last4 = cleanCard.slice(-4);
      const [expMonth, expYear] = cardExpiry.split('/').map((s) => s.trim());
      updatePaymentMethod({
        brand: 'Visa',
        last4: last4 || '4242',
        expMonth: expMonth || '08',
        expYear: expYear || '29',
      });

      // Complete checkout transition
      completeDemoCheckout({ planId, interval, sessionKey });
      setProcessing(false);
      navigate('/checkout/success', { replace: true });
    }, 900);
  };

  const cancel = () => navigate('/checkout/cancelled', { replace: true });

  const price = planPrice(plan, interval);

  return (
    <div>
      <p className="type-caption text-ink-tertiary">Checkout</p>
      <h1 className="mt-1 type-page-title text-ink-primary">Subscribe to {plan.name}</h1>
      <p className="mt-2 max-w-xl type-body-small text-ink-secondary">
        Review your order and enter payment details to start your subscription.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_340px] md:items-start">
        {/* Payment form */}
        <div className="order-2 md:order-1">
          <form onSubmit={handleSubscribe} className="rounded-container border border-line-subtle bg-surface-panel p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line-subtle pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="icon-sm text-ink-primary" />
                <h2 className="type-section-title text-ink-primary">Payment method</h2>
              </div>
              <span className="flex items-center gap-1 type-caption text-ink-tertiary">
                <Lock className="icon-xs" /> Secure checkout
              </span>
            </div>

            {paymentError && (
              <div role="alert" className="flex items-center gap-2 rounded-control bg-danger/10 p-3 text-danger type-metadata">
                <AlertCircle className="icon-xs shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <Field label="Cardholder name" htmlFor="cardName" required>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name on card"
                disabled={processing}
                required
              />
            </Field>

            <Field label="Card number" htmlFor="cardNumber" required>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  disabled={processing}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 type-caption font-semibold text-ink-tertiary">
                  VISA
                </span>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiration" htmlFor="cardExpiry" required>
                <Input
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM / YY"
                  disabled={processing}
                  required
                />
              </Field>

              <Field label="Security code" htmlFor="cardCvc" description="CVC / CVV" required>
                <Input
                  id="cardCvc"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  disabled={processing}
                  required
                />
              </Field>
            </div>

            <Field label="Billing country / region" htmlFor="billingCountry">
              <NativeSelect
                id="billingCountry"
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                disabled={processing}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
              </NativeSelect>
            </Field>

            <ul className="pt-2 space-y-2 border-t border-line-subtle type-metadata text-ink-secondary">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 icon-xs shrink-0 text-brand" />
                <span>{plan.name} features activate immediately upon confirmation.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 icon-xs shrink-0 text-brand" />
                <span>Renews automatically every {intervalNoun(interval)}. Cancel or change plans anytime.</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button type="submit" intent="primary" size="lg" disabled={processing} className="flex-1 sm:flex-initial">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 icon-sm animate-spin" />
                    <span>Processing subscription…</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe to {plan.name} · {formatPrice(price)}</span>
                    <ArrowRight className="ml-1.5 icon-sm" />
                  </>
                )}
              </Button>
              <Button type="button" intent="secondary" size="lg" onClick={cancel} disabled={processing}>
                Cancel checkout
              </Button>
            </div>
          </form>
        </div>

        {/* Order summary sidebar */}
        <div className="order-1 md:order-2">
          <OrderSummary plan={plan} interval={interval} />
        </div>
      </div>
    </div>
  );
}
