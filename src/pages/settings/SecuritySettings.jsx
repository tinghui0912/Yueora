import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const sessions = [
  { device: 'MacBook Pro · Chrome', location: 'San Francisco, US', current: true, icon: Monitor },
  { device: 'iPhone 15 · NoteVerse App', location: 'San Francisco, US', current: false, icon: Smartphone },
];

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const changePw = (e) => {
    e.preventDefault();
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <Section title="Password" desc="Choose a strong password you don't use elsewhere.">
        <form onSubmit={changePw} className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cur">Current password</Label>
            <Input id="cur" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">Update password</Button>
            {pwSaved && <span className="text-sm text-primary">Updated</span>}
          </div>
        </form>
      </Section>

      <Section title="Two-factor authentication" desc="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between">
          <span className="text-sm">{twoFactor ? 'Enabled' : 'Disabled'}</span>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>
      </Section>

      <Section title="Active sessions" desc="Devices currently signed in to your account.">
        <ul className="divide-y divide-border">
          {sessions.map((s) => (
            <li key={s.device} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-xs text-primary">This device</span>
              ) : (
                <Button variant="ghost" size="sm">Sign out</Button>
              )}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-3">Sign out all other sessions</Button>
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