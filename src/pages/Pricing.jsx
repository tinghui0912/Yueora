import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import Surface from '@/components/patterns/Surface';
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
  const scores = usePrototypeStore((s) => s.scores);
  const activeScoresCount = (scores || []).filter((s) => s.ownership !== 'trash').length;

  const interval = yearly ? 'yearly' : 'monthly';
  const saving = yearlySavingPercent(plans.plus || plans.pro);
  const onPlus = subscription.plan === 'plus' && subscription.status === 'active';
  const onPro = subscription.plan === 'pro' && subscription.status === 'active';

  const freeDestination = isAuthenticated ? (activeScoresCount > 0 ? '/practice' : '/add-score') : '/register';

  const plusDestination = isAuthenticated
    ? checkoutPath('plus', interval)
    : `/register?returnTo=${encodeURIComponent(checkoutPath('plus', interval))}`;

  const proDestination = isAuthenticated
    ? checkoutPath('pro', interval)
    : `/register?returnTo=${encodeURIComponent(checkoutPath('pro', interval))}`;

  return (
    <PublicShell>
      <AppPage size="full" padding="none">
        {/* 1. Header Section */}
        <section className="pt-24 md:pt-36 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 text-center">
            <Reveal>
              <p className="type-eyebrow text-ink-tertiary mb-4">
                Durable &amp; Fair · Pricing
              </p>
              <h1 className="type-marketing-title text-balance text-ink-primary">
                Simple, transparent pricing.
              </h1>
              <p className="mx-auto mt-4 max-w-xl type-marketing-body text-ink-secondary">
                Start free. Upgrade when your repertoire grows. Cancel or change your plan whenever you like.
              </p>

              {/* Billing Cycle Pill Switch */}
              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface-panel p-1.5">
                <button
                  onClick={() => setYearly(false)}
                  className={`rounded-full px-5 py-2 type-label font-medium transition-all ${
                    !yearly
                      ? 'bg-neutral-muted font-semibold text-ink-primary border border-line-subtle'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`rounded-full px-5 py-2 type-label font-medium transition-all ${
                    yearly
                      ? 'bg-neutral-muted font-semibold text-ink-primary border border-line-subtle'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Yearly <span className="ml-1.5 type-metadata text-brand font-semibold">save {saving}%</span>
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. 3-Column Plan Cards Section — UGC Services Parity (Free | Plus | Pro) */}
        <section className="pb-24 md:pb-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan (White Panel) */}
            <Reveal delay={0.05} y={32}>
              <div className="h-full rounded-container p-6 sm:p-8 md:p-9 bg-surface-panel border border-line-subtle flex flex-col justify-between hover:border-line-strong hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="type-eyebrow text-ink-tertiary">
                      Starter
                    </span>
                    <span className="type-caption text-ink-tertiary">
                      Free Tier
                    </span>
                  </div>

                  <h3 className="type-display font-medium text-ink-primary">
                    {plans.free.name}
                  </h3>
                  <p className="mt-2.5 type-body-small text-ink-secondary">
                    A personal starter library to begin your musical journey calmly.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="type-display font-medium text-ink-primary">$0</span>
                    <span className="type-metadata text-ink-tertiary">/month</span>
                  </div>
                  <p className="mt-1 type-metadata text-ink-tertiary">
                    Free forever. No credit card required.
                  </p>

                  <div className="mt-7 pt-5 border-t border-line-subtle">
                    <ul className="space-y-3 type-body-small text-ink-secondary">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.scores} in your library</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.imports}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.storage} storage</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.free.sharing} sharing</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>Acoustic score listener &amp; practice stand</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <Button asChild intent="secondary" size="xl" className="w-full">
                    <Link to={freeDestination}>
                      Start free
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Plus Plan — Featured Middle Near-Black Inverse Card (Most Popular) */}
            <Reveal delay={0.1} y={32}>
              <div className="relative h-full rounded-container p-6 sm:p-8 md:p-9 bg-ink-primary text-surface-canvas border border-ink-primary flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Ambient glow decoration */}
                <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 select-none">
                  <Sparkles className="w-40 h-40 text-surface-canvas/[0.04]" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="type-eyebrow text-surface-canvas/60">
                      Regular Musician
                    </span>
                    <span className="rounded-full border border-surface-canvas/20 bg-surface-canvas/15 px-3 py-0.5 type-metadata font-medium text-surface-canvas">
                      Most Popular
                    </span>
                  </div>

                  <h3 className="type-display font-medium text-surface-canvas">
                    {plans.plus.name}
                  </h3>
                  <p className="mt-2.5 type-body-small text-surface-canvas/75">
                    For active players who build a solid repertoire and value practice insights.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="type-display font-medium text-surface-canvas">
                      {formatPrice(yearly ? plans.plus.priceYearly : plans.plus.priceMonthly)}
                    </span>
                    <span className="type-metadata text-surface-canvas/70">
                      /{intervalNoun(interval)}
                    </span>
                  </div>
                  <p className="mt-1 type-metadata text-surface-canvas/60">
                    {yearly
                      ? `${formatPrice(monthlyEquivalent(plans.plus, 'yearly'))} a month, billed annually`
                      : 'Billed monthly. Change or cancel anytime.'}
                  </p>

                  <div className="mt-7 pt-5 border-t border-surface-canvas/15">
                    <ul className="space-y-3 type-body-small text-surface-canvas/85">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.plus.scores}</strong> in your library</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.plus.imports}</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span><strong>{plans.plus.storage}</strong> storage</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span>{plans.plus.sharing} sharing</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-surface-canvas shrink-0" />
                        <span>Practice insights &amp; progress journal</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative z-10 mt-8">
                  {onPlus ? (
                    <Button
                      asChild
                      intent="inverse-secondary"
                      size="xl"
                      className="w-full"
                    >
                      <Link to="/settings/plan">Manage your plan</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        intent="inverse"
                        size="xl"
                        className="w-full"
                      >
                        <Link to={plusDestination}>
                          <span>Start Plus</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <p className="mt-2 text-center type-metadata text-surface-canvas/50">
                        {isAuthenticated ? 'Continue to checkout.' : 'Create an account, then continue.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Reveal>

            {/* Pro Plan — Highest Capability Tier (White Panel) */}
            <Reveal delay={0.15} y={32}>
              <div className="h-full rounded-container p-6 sm:p-8 md:p-9 bg-surface-panel border border-line-subtle flex flex-col justify-between hover:border-line-strong hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="type-eyebrow text-ink-tertiary">
                      Devoted Repertoire
                    </span>
                    <span className="type-caption text-ink-tertiary">
                      Unlimited
                    </span>
                  </div>

                  <h3 className="type-display font-medium text-ink-primary">
                    {plans.pro.name}
                  </h3>
                  <p className="mt-2.5 type-body-small text-ink-secondary">
                    For devoted musicians who play regularly, preserve takes, and archive recordings.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="type-display font-medium text-ink-primary">
                      {formatPrice(yearly ? plans.pro.priceYearly : plans.pro.priceMonthly)}
                    </span>
                    <span className="type-metadata text-ink-tertiary">
                      /{intervalNoun(interval)}
                    </span>
                  </div>
                  <p className="mt-1 type-metadata text-ink-tertiary">
                    {yearly
                      ? `${formatPrice(monthlyEquivalent(plans.pro, 'yearly'))} a month, billed annually`
                      : 'Billed monthly. Change or cancel anytime.'}
                  </p>

                  <div className="mt-7 pt-5 border-t border-line-subtle">
                    <ul className="space-y-3 type-body-small text-ink-secondary">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span><strong>{plans.pro.scores}</strong> in your library</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span><strong>{plans.pro.imports}</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span><strong>{plans.pro.storage}</strong> storage</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>{plans.pro.sharing} sharing</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span>Practice insights &amp; progress journal</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 text-ink-primary shrink-0" />
                        <span><strong>Full recording downloads</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  {onPro ? (
                    <Button
                      asChild
                      intent="secondary"
                      size="xl"
                      className="w-full"
                    >
                      <Link to="/settings/plan">Manage your plan</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        intent="primary"
                        size="xl"
                        className="w-full"
                      >
                        <Link to={proDestination}>
                          <span>Start Pro</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <p className="mt-2 text-center type-metadata text-ink-tertiary">
                        {isAuthenticated ? 'Continue to checkout.' : 'Create an account, then continue.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* 3. Detailed Side-by-Side Comparison (Feature | Free | Plus | Pro) */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 mt-24">
            <Reveal>
              <div className="text-center mb-8">
                <p className="type-eyebrow text-ink-tertiary mb-2">Feature Matrix</p>
                <h2 className="type-section-title text-ink-primary font-medium">
                  Detailed side-by-side comparison
                </h2>
              </div>

              <Surface className="overflow-x-auto">
                <table className="w-full type-body-small">
                  <thead>
                    <tr className="border-b border-line-subtle bg-neutral-muted/40">
                      <th className="px-6 py-4 text-left font-medium text-ink-secondary">Feature</th>
                      <th className="px-6 py-4 text-center font-medium text-ink-primary">Free</th>
                      <th className="px-6 py-4 text-center font-medium text-ink-primary bg-neutral-muted/30">Plus</th>
                      <th className="px-6 py-4 text-center font-medium text-ink-primary">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle">
                    {features.map((f) => (
                      <tr key={f.key} className="hover:bg-neutral-hover/50 transition-colors">
                        <td className="px-6 py-4 text-ink-secondary">{f.label}</td>
                        <td className="px-6 py-4 text-center text-ink-primary">{renderVal(plans.free[f.key])}</td>
                        <td className="px-6 py-4 text-center font-medium text-ink-primary bg-neutral-muted/20">{renderVal(plans.plus[f.key])}</td>
                        <td className="px-6 py-4 text-center font-medium text-ink-primary">{renderVal(plans.pro[f.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Surface>
            </Reveal>

            {/* Prototype and Legal Footnote */}
            <Reveal delay={0.1}>
              <div className="mt-12 text-center space-y-4">
                <p className="mx-auto max-w-xl type-metadata text-ink-tertiary">
                  Checkout is a prototype: no real payment is processed and no card details are collected. Prices are shown in US
                  dollars. By continuing you agree to our{' '}
                  <Link to="/legal/terms" className="underline hover:text-ink-primary">Terms</Link> and{' '}
                  <Link to="/legal/privacy" className="underline hover:text-ink-primary">Privacy Policy</Link>.
                </p>

                <p className="type-body-small text-ink-secondary">
                  Already have an account?{' '}
                  <Link to="/login?returnTo=/pricing" className="font-medium text-brand hover:underline">
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
