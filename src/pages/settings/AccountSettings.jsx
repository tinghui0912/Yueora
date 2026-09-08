import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || 'You');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await base44.auth.updateMe({ full_name: name });
    } catch {
      /* mock */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <Section title="Profile" desc="Your name and email as shown across NoteVerse.">
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || 'you@example.com'} disabled />
            <p className="text-xs text-muted-foreground">Email changes are managed by your login provider.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save}>Save changes</Button>
            {saved && <span className="text-sm text-primary">Saved</span>}
          </div>
        </div>
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