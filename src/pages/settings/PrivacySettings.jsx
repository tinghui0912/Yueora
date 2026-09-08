import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PrivacySettings() {
  const [analytics, setAnalytics] = useState(true);
  const [practiceShare, setPracticeShare] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleted, setDeleted] = useState(false);

  const exportData = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); }, 1500);
  };

  const doDelete = () => {
    if (confirmText === 'DELETE') { setDeleted(true); setDeleteOpen(false); }
  };

  return (
    <div className="space-y-6">
      <Section title="Data sharing" desc="Control how your data is used to improve Yueora.">
        <div className="max-w-sm space-y-5">
          <div className="flex items-center justify-between">
            <div><Label>Anonymous analytics</Label><p className="text-xs text-muted-foreground">Help improve Yueora with usage data — no personal content.</p></div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Share practice stats with collaborators</Label><p className="text-xs text-muted-foreground">Let editors see your tempo and progress.</p></div>
            <Switch checked={practiceShare} onCheckedChange={setPracticeShare} />
          </div>
        </div>
      </Section>

      <Section title="Your data" desc="Export a copy of everything Yueora holds for you.">
        {exported ? (
          <p className="text-sm text-primary">Export ready — we’ve saved a copy to your downloads.</p>
        ) : (
          <Button variant="outline" onClick={exportData} disabled={exporting}>{exporting ? 'Preparing export…' : 'Export my data'}</Button>
        )}
      </Section>

      <Section title="Delete account" desc="Permanently delete your account, scores, and practice history.">
        <p className="text-sm text-muted-foreground">This can’t be undone. If you just want a break, you can sign out instead.</p>
        <Button variant="outline" className="mt-3 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>Delete account</Button>
      </Section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete account?</DialogTitle></DialogHeader>
          {deleted ? (
            <div className="py-4 text-center">
              <p className="font-medium">Account scheduled for deletion</p>
              <p className="mt-1 text-sm text-muted-foreground">You’ll be signed out shortly. We’re sorry to see you go.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">This permanently deletes your scores, practice history, and account. To confirm, type <strong>DELETE</strong> below.</p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" className="mt-3" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={doDelete} disabled={confirmText !== 'DELETE'}>Delete account</Button>
              </DialogFooter>
            </>
          )}
          {deleted && <DialogFooter><Button onClick={() => setDeleted(false)}>Close</Button></DialogFooter>}
        </DialogContent>
      </Dialog>
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