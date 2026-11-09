import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { checkoutPath, formatPrice, intervalNoun, monthlyEquivalent, yearlySavingPercent } from '@/lib/commercial';
import { Button } from '@/components/ui/button';

const features = [
  { label: 'Scores in library', key: 'scores' },
  { label: 'Imports / recognition', key: 'imports' },
  { label: 'Practice & feedback', key: 'practice' },
  { label: 'Practice insights', key: 'analytics' },
  { label: 'Storage', key: 'storage' },
  { label: 'Sharing', key: 'sharing' },
  { label: 'Recording downloads', key: 'export' },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { isAuthenticated } = useAuth();
  const plans = usePrototypeStore((s) => s.plans);
  const subscription = usePrototypeStore((s) => s.subscription);

  const interval = yearly ? 'yearly' : 'monthly';
  const saving = yearlySavingPercent(plans.pro);
  const onPro = subscription.plan === 'pro' && subscription.status === 'active';

  // The purchase choice travels with the user: an anonymous visitor registers
  // and comes back to the exact same checkout configuration.
  const proDestination = isAuthenticated
    ? checkoutPath('pro', interval)
    : `/register?returnTo=${encodeURIComponent(checkoutPath('pro', interval))}`;

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <div className="text-center">
          <h1 className="type-marketing-title text-ink-primary">Play more, for less</h1>
          <p className="mx-auto mt-3 max-w-md type-body-small text-ink-secondary">
            Start free. Upgrade when your library grows. Cancel or change your plan whenever you like.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-control border border-line-subtle bg-surface-panel p-0.5">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-control px-3 py-1.5 text-sm transition-colors ${!yearly ? 'bg-neutral-muted font-semibold text-ink-primary shadow-xs border border-line-subtle' : 'text-ink-secondary hover:text-ink-primary'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-control px-3 py-1.5 text-sm transition-colors ${yearly ? 'bg-neutral-muted font-semibold text-ink-primary shadow-xs border border-line-subtle' : 'text-ink-secondary hover:text-ink-primary'}`}
            >
              Yearly <span className="ml-1 text-xs text-brand">save {saving}%</span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Object.values(plans).map((p) => {
            const isPro = p.id === 'pro';
            const amount = isPro ? (yearly ? p.priceYearly : p.priceMonthly) : 0;
            const per = isPro ? `/${intervalNoun(interval)}` : '';

            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-container border bg-surface-panel p-6 ${isPro ? 'border-brand' : 'border-line-subtle'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-medium text-ink-primary">{p.name}</p>
                  {isPro && (
                    <span className="rounded-control border border-line-subtle bg-surface-panel px-2.5 py-0.5 type-caption font-semibold text-brand">Popular</span>
                  )}
                </div>

                <p className="mt-3 font-display text-3xl font-medium text-ink-primary">
                  {formatPrice(amount)}
                  <span className="text-base font-normal text-ink-tertiary">{per}</span>
                </p>
                <p className="mt-1 type-metadata text-ink-tertiary">
                  {isPro
                    ? yearly
                      ? `${formatPrice(monthlyEquivalent(p, 'yearly'))} a month, billed once a year`
                      : 'Billed monthly. Change or cancel anytime.'
                    : 'Everything you need to keep your own music.'}
                </p>

                <ul className="mt-5 flex-1 space-y-2 type-body-small text-ink-secondary">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p.scores} in your library</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p.imports}</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p.storage} storage · {p.sharing.toLowerCase()} sharing</li>
                  {isPro && <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> Practice insights and recording downloads</li>}
                </ul>

                <div className="mt-6">
                  {isPro ? (
                    onPro ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/settings/plan">Manage your plan</Link>
                      </Button>
                    ) : (
                      <>
                        <Button className="w-full" asChild>
                          <Link to={proDestination}>
                            Start Pro <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                        <p className="mt-2 text-center type-metadata text-ink-tertiary">
                          {isAuthenticated ? 'Continues to a demo checkout.' : 'Create an account, then review the demo checkout.'}
                        </p>
                      </>
                    )
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={isAuthenticated ? '/library' : '/register'}>Start free</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto rounded-container border border-line-subtle bg-surface-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-subtle">
                <th className="px-4 py-3 text-left font-medium text-ink-secondary">Feature</th>
                <th className="px-4 py-3 text-center font-medium text-ink-primary">Free</th>
                <th className="px-4 py-3 text-center font-medium text-ink-primary">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {features.map((f) => (
                <tr key={f.key}>
                  <td className="px-4 py-3 text-ink-secondary">{f.label}</td>
                  <td className="px-4 py-3 text-center text-ink-primary">{renderVal(plans.free[f.key])}</td>
                  <td className="px-4 py-3 text-center font-medium text-ink-primary">{renderVal(plans.pro[f.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center type-metadata text-ink-tertiary">
          Checkout is a prototype: no payment is processed and no card details are collected. Prices are shown in US
          dollars. By continuing you agree to our{' '}
          <Link to="/legal/terms" className="underline hover:text-ink-primary">Terms</Link> and{' '}
          <Link to="/legal/privacy" className="underline hover:text-ink-primary">Privacy Policy</Link>.
        </p>

        <p className="mt-6 text-center type-body-small text-ink-secondary">
          Already have an account?{' '}
          <Link to={`/login?returnTo=${encodeURIComponent(checkoutPath('pro', interval))}`} className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}

function renderVal(v) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-brand" />;
  if (v === false) return <span className="text-ink-tertiary">—</span>;
  return v;
}