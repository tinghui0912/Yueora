import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StateMessage from '@/components/patterns/StateMessage';

/**
 * CheckoutCancelled — leaving checkout is not the same as cancelling a
 * subscription. Nothing was recorded and the plan is untouched.
 */
export default function CheckoutCancelled() {
  return (
    <div className="mx-auto max-w-xl">
      <StateMessage
        icon={Info}
        title="Checkout cancelled"
        description="No payment was made and your subscription has not changed."
        secondaryAction={<Button variant="outline" asChild><Link to="/settings/plan">Plan &amp; billing</Link></Button>}
        primaryAction={<Button asChild><Link to="/pricing">Return to Pricing</Link></Button>}
      />
      <p className="mx-auto max-w-md text-center type-metadata text-ink-tertiary">
        Cancelling a checkout is different from cancelling a subscription. If you already have Pro, it is still
        active — manage it from Plan &amp; billing at any time.
      </p>
    </div>
  );
}