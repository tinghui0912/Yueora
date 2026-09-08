import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const categories = [
  { key: 'imports', label: 'Imports', desc: 'Recognition finished, ready to review, or failed.' },
  { key: 'sharing', label: 'Sharing', desc: 'Invitations sent, accepted, or access changed.' },
  { key: 'security', label: 'Security', desc: 'New sign-ins and account changes.' },
  { key: 'billing', label: 'Billing', desc: 'Renewals, receipts, and plan changes.' },
  { key: 'practice', label: 'Practice suggestions', desc: 'A gentle nudge — never a streak reminder.' },
  { key: 'updates', label: 'Product updates', desc: 'New features and improvements.' },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    imports: { inApp: true, email: true },
    sharing: { inApp: true, email: true },
    security: { inApp: true, email: true },
    billing: { inApp: true, email: false },
    practice: { inApp: true, email: false },
    updates: { inApp: false, email: false },
  });

  const toggle = (cat, channel) => setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [channel]: !p[cat][channel] } }));

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="font-display text-lg font-medium">Notification preferences</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Choose what you hear about, and how. Practice reminders are gentle by default.</p>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Category</span>
          <span className="w-16 text-center">In-app</span>
          <span className="w-16 text-center">Email</span>
        </div>
        {categories.map((c) => (
          <div key={c.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-3 last:border-0">
            <div>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
            <div className="flex w-16 justify-center"><Switch checked={prefs[c.key].inApp} onCheckedChange={() => toggle(c.key, 'inApp')} aria-label={`${c.label} in-app`} /></div>
            <div className="flex w-16 justify-center"><Switch checked={prefs[c.key].email} onCheckedChange={() => toggle(c.key, 'email')} aria-label={`${c.label} email`} /></div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-accent/30 p-4">
        <Label className="text-sm">Practice reminder tone</Label>
        <p className="mt-1 text-xs text-muted-foreground">We’ll never say “you haven’t practiced.” Instead: “Feel like playing something today?”</p>
      </div>
    </div>
  );
}