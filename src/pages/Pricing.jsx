import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import Reveal from '@/components/public/Reveal';
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

  const proDestination = isAuthenticated
    ? checkoutPath('pro', interval)
    : `/register?returnTo=${encodeURIComponent(checkoutPath('pro', interval))}`;

  return (
    <PublicShell>
      <AppPage size="full" padding="none">
        {/* 1. Header Section */}
        <section className="pt-24 md:pt-36 pb-12">
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
            <Reveal>
              <p className="type-eyebrow text-ink-tertiary mb-4">
                Durable &amp; Fair · Pricing
              </p>
              <h1 className="type-marketing-title text-balance text-ink-primary">
                Simple, transparent pricing.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-secondary">
                Start free. Upgrade when your repertoire grows. Cancel or change your plan whenever you like.
              </p>

              {/* Billing Cycle Pill Switch */}
              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface-panel p-1.5">
                <button
                  onClick={() => setYearly(false)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    !yearly
                      ? 'bg-neutral-muted font-semibold text-ink-primary border border-line-subtle'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    yearly
                      ? 'bg-neutral-muted font-semibold text-ink-primary border border-line-subtle'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Yearly <span className="ml-1.5 text-xs text-brand font-semibold">save {saving}%</span>
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. 2-Column Plan Cards Section — UGC Parity */}
        <section className="pb-24 md:pb-36">
          <div className="max-w-5xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Reveal delay={0.05} y={32}>
              <div className="h-full rounded-[2rem] p-8 md:p-10 bg-surface-panel border border-line-subtle flex flex-col justify-between hover:border-line-strong hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="type-eyebrow text-ink-tertiary">
                      Personal Starter
                    </span>
                    <span className="type-metadata text-ink-tertiary uppercase tracking-wider">
                      Free Tier
                    </span>
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl font-medium text-ink-primary">
                    Free
                  </h3>
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                    Everything you need to keep your personal sheet music and practice calmly.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl md:text-5xl font-medium text-ink-primary">$0</span>
                    <span className="text-sm text-ink-tertiary">/month</span>
                  </div>
                  <p className="mt-1 type-metadata text-ink-tertiary">
                    No credit card required. Free forever.
                  </p>

                  <div className="mt-8 pt-6 border-t border-line-subtle">
                    <ul className="space-y-3.5 text-sm text-ink-secondary">
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.scores} in your library</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.imports}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.storage} storage</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.sharing} private sharing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>Acoustic score listener &amp; practice stand</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-10">
                  <Button asChild intent="secondary" size="lg" className="w-full rounded-full">
                    <Link to={isAuthenticated ? '/library' : '/register'}>
                      Start free
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Pro Plan — Near-Black Inverse Card Parity */}
            <Reveal delay={0.12} y={32}>
              <div className="relative h-full rounded-[2rem] p-8 md:p-10 bg-ink-primary text-surface-canvas border border-ink-primary shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Ambient glow decoration */}
                <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 select-none">
                  <Sparkles className="w-48 h-48 text-surface-canvas/[0.04]" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="type-eyebrow text-surface-canvas/60">
                      Most Devoted Repertoire
                    </span>
                    <span className="rounded-full border border-surface-canvas/20 bg-surface-canvas/10 px-3 py-0.5 type-metadata font-medium text-surface-canvas">
                      Popular
                    </span>
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl font-medium text-surface-canvas">
                    Pro Repertoire
                  </h3>
                  <p className="mt-3 text-sm text-surface-canvas/75 leading-relaxed">
                    For devoted musicians who play regularly, preserve their takes, and cherish insights.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl md:text-5xl font-medium text-surface-canvas">
                      {formatPrice(yearly ? plans.pro.priceYearly : plans.pro.priceMonthly)}
                    </span>
                    <span className="text-sm text-surface-canvas/70">
                      /{intervalNoun(interval)}
                    </span>
                  </div>
                  <p className="mt-1 type-metadata text-surface-canvas/60">
                    {yearly
                      ? `${formatPrice(monthlyEquivalent(plans.pro, 'yearly'))} a month, billed once a year`
                      : 'Billed monthly. Change or cancel anytime.'}
                  </p>

                  <div className="mt-8 pt-6 border-t border-surface-canvas/15">
                    <ul className="space-y-3.5 text-sm text-surface-canvas/85">
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.pro.scores}</strong> in your library</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.pro.imports}</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.pro.storage}</strong> high-resolution storage</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span>{plans.pro.sharing} sharing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span>Practice insights &amp; progress journal</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span>Full recording export with synchronized score</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative z-10 mt-10">
                  {onPro ? (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full border-surface-canvas/30 text-surface-canvas hover:bg-surface-canvas/10 rounded-full"
                    >
                      <Link to="/settings/plan">Manage your plan</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-surface-canvas text-ink-primary hover:bg-surface-canvas/90 font-medium py-3 rounded-full flex items-center justify-center gap-2"
                      >
                        <Link to={proDestination}>
                          <span>Start Pro</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <p className="mt-2.5 text-center type-metadata text-surface-canvas/50">
                        {isAuthenticated ? 'Continues to preview checkout.' : 'Create an account, then review preview checkout.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* 3. Detailed Side-by-Side Comparison */}
          <div className="max-w-4xl mx-auto px-6 md:px-10 mt-24">
            <Reveal>
              <div className="text-center mb-8">
                <p className="type-eyebrow text-ink-tertiary mb-2">Feature Matrix</p>
                <h2 className="font-display text-2xl sm:text-3xl text-ink-primary font-medium">
                  Detailed side-by-side comparison
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-line-subtle bg-surface-panel">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line-subtle bg-neutral-muted/40">
                      <th className="px-6 py-4 text-left font-medium text-ink-secondary">Feature</th>
                      <th className="px-6 py-4 text-center font-medium text-ink-primary">Free</th>
                      <th className="px-6 py-4 text-center font-medium text-ink-primary">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle">
                    {features.map((f) => (
                      <tr key={f.key} className="hover:bg-neutral-hover/50 transition-colors">
                        <td className="px-6 py-4 text-ink-secondary">{f.label}</td>
                        <td className="px-6 py-4 text-center text-ink-primary">{renderVal(plans.free[f.key])}</td>
                        <td className="px-6 py-4 text-center font-medium text-ink-primary">{renderVal(plans.pro[f.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            {/* Prototype and Legal Footnote */}
            <Reveal delay={0.1}>
              <div className="mt-12 text-center space-y-4">
                <p className="mx-auto max-w-xl type-metadata text-ink-tertiary leading-relaxed">
                  Checkout is a prototype: no real payment is processed and no card details are collected. Prices are shown in US
                  dollars. By continuing you agree to our{' '}
                  <Link to="/legal/terms" className="underline hover:text-ink-primary">Terms</Link> and{' '}
                  <Link to="/legal/privacy" className="underline hover:text-ink-primary">Privacy Policy</Link>.
                </p>

                <p className="type-body-small text-ink-secondary">
                  Already have an account?{' '}
                  <Link to={`/login?returnTo=${encodeURIComponent(checkoutPath('pro', interval))}`} className="font-medium text-brand hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </AppPage>
    </PublicShell>
  );
}

function renderVal(v) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-ink-primary" />;
  if (v === false) return <span className="text-ink-tertiary">—</span>;
  return v;
}
