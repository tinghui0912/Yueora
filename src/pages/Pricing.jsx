import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import { plans } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

const features = [
  { label: 'Scores in library', key: 'scores' },
  { label: 'Imports / recognition', key: 'imports' },
  { label: 'Practice & feedback', key: 'practice' },
  { label: 'Practice analytics', key: 'analytics' },
  { label: 'Storage', key: 'storage' },
  { label: 'Sharing', key: 'sharing' },
  { label: 'Export / download', key: 'export' },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <div className="text-center">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium">Play more, for less</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when your library grows.</p>
          <div className="mt-5 inline-flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
            <button onClick={() => setYearly(false)} className={`rounded px-3 py-1.5 text-sm ${!yearly ? 'bg-accent font-medium' : 'text-muted-foreground'}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`rounded px-3 py-1.5 text-sm ${yearly ? 'bg-accent font-medium' : 'text-muted-foreground'}`}>Yearly <span className="text-xs text-primary">save ~17%</span></button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Object.values(plans).map((p) => {
            const price = yearly ? p.priceYearly : p.priceMonthly;
            const isPro = p.id === 'pro';
            return (
              <div key={p.id} className={`rounded-md border bg-card p-6 ${isPro ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-medium">{p.name}</p>
                  {isPro && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Popular</span>}
                </div>
                <p className="mt-3 font-display text-3xl font-medium">${price}<span className="text-base font-normal text-muted-foreground">{yearly ? '/yr' : '/mo'}</span></p>
                <Button className="mt-5 w-full" variant={isPro ? 'default' : 'outline'} asChild>
                  <Link to={isPro ? '/register' : '/register'}>{isPro ? 'Start Pro' : 'Start free'} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feature</th>
                <th className="px-4 py-3 text-center font-medium">Free</th>
                <th className="px-4 py-3 text-center font-medium">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {features.map((f) => (
                <tr key={f.key}>
                  <td className="px-4 py-3 text-muted-foreground">{f.label}</td>
                  <td className="px-4 py-3 text-center">{renderVal(plans.free[f.key])}</td>
                  <td className="px-4 py-3 text-center font-medium">{renderVal(plans.pro[f.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </PublicShell>
  );
}

function renderVal(v) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (v === false) return <span className="text-muted-foreground">—</span>;
  return v;
}