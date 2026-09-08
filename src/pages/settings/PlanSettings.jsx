import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

const features = ['Unlimited scores', 'AI scan import', 'Practice analytics', 'Offline library'];

export default function PlanSettings() {
  const [annual, setAnnual] = useState(true);
  const pro = annual ? 72 : 8;

  return (
    <div className="space-y-6">
      <Section title="Current plan" desc="You're on the Free plan.">
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="font-display text-lg font-medium">Free</p>
            <p className="text-sm text-muted-foreground">Up to 25 scores · core practice tools</p>
          </div>
          <Button variant="outline">Manage</Button>
        </div>
      </Section>

      <Section title="Upgrade to Pro" desc="Unlock unlimited scores and advanced practice.">
        <div className="rounded-md border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 font-display text-xl font-medium">
                <Sparkles className="h-4 w-4 text-gold" /> Pro
              </p>
              <p className="mt-1 text-sm text-muted-foreground">${pro}/{annual ? 'year' : 'month'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Annual</span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <Button className="mt-5 bg-primary text-primary-foreground">Upgrade to Pro</Button>
        </div>
      </Section>

      <Section title="Billing history" desc="Past invoices and receipts.">
        <ul className="divide-y divide-border text-sm">
          <li className="flex items-center justify-between py-3">
            <span>Free plan — no charges</span>
            <span className="text-muted-foreground">—</span>
          </li>
        </ul>
      </Section>
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