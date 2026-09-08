import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PrivacySettings() {
  const [analytics, setAnalytics] = useState(true);
  const [practiceShare, setPracticeShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Data sharing" desc="Control how your practice data is used.">
        <div className="max-w-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymous analytics</Label>
              <p className="text-xs text-muted-foreground">Help improve NoteVerse with usage data.</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Share practice stats with collaborators</Label>
              <p className="text-xs text-muted-foreground">Let editors see your accuracy and tempo.</p>
            </div>
            <Switch checked={practiceShare} onCheckedChange={setPracticeShare} />
          </div>
        </div>
      </Section>

      <Section title="Your data" desc="Export or remove your library and account.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Export my data</Button>
          <Button variant="outline" className="text-destructive hover:text-destructive">
            Delete account
          </Button>
        </div>
        {confirmDelete && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p>This permanently deletes your scores and practice history. This cannot be undone.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" size="sm">Confirm delete</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          </div>
        )}
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