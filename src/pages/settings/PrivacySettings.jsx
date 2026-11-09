import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { downloadBlob } from '@/lib/media';
import SettingsSection from '@/components/patterns/SettingsSection';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function PrivacySettings() {
  const resetPrototype = usePrototypeStore((s) => s.resetPrototype);
  const { logout } = useAuth();
  const [analytics, setAnalytics] = useState(true);
  const [practiceShare, setPracticeShare] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteState, setDeleteState] = useState('confirm'); // 'confirm' | 'processing' | 'scheduled'

  const exportData = () => {
    setExporting(true);
    setTimeout(() => {
      const state = usePrototypeStore.getState();
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        scores: state.scores,
        folders: state.folders,
        practiceActivities: state.practiceActivities,
        savedPerformances: state.savedPerformances,
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `yueora-data-${new Date().toISOString().slice(0, 10)}.json`);
      setExporting(false);
      setExported(true);
    }, 600);
  };

  const doDelete = () => {
    if (confirmText !== 'DELETE') return;
    setDeleteState('processing');
    setTimeout(() => {
      setDeleteState('scheduled');
      resetPrototype();
    }, 1500);
  };

  const signOutAfterDelete = () => {
    setDeleteOpen(false);
    logout?.('/');
  };

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Data sharing" desc="Control how your data is used to improve Yueora.">
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
      </SettingsSection>

      <SettingsSection title="Your data" desc="Export a copy of everything Yueora holds for you.">
        {exported ? (
          <p className="text-sm text-primary">Export ready — we've saved a copy to your downloads.</p>
        ) : (
          <Button variant="outline" onClick={exportData} disabled={exporting}>{exporting ? 'Preparing export…' : 'Export my data'}</Button>
        )}
      </SettingsSection>

      <SettingsSection title="Delete account" desc="Permanently delete your account, scores, and practice history.">
        <p className="text-sm text-muted-foreground">This can't be undone. If you just want a break, you can sign out instead.</p>
        <Button variant="outline" className="mt-3 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>Delete account</Button>
      </SettingsSection>

      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o && deleteState !== 'scheduled') setDeleteOpen(false); }}>
        <DialogContent className="max-w-sm">
          {deleteState === 'scheduled' ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Account scheduled for deletion</p>
              <p className="mt-1 text-sm text-muted-foreground">Your account will be removed shortly. We're sorry to see you go.</p>
              <Button onClick={signOutAfterDelete} className="mt-5 w-full">Sign out</Button>
            </div>
          ) : (
            <>
              <DialogHeader><DialogTitle>Delete account?</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">This permanently deletes your scores, practice history, and account. To confirm, type <strong>DELETE</strong> below.</p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" className="mt-3" disabled={deleteState === 'processing'} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteState === 'processing'}>Cancel</Button>
                <Button variant="destructive" onClick={doDelete} disabled={confirmText !== 'DELETE' || deleteState === 'processing'}>
                  {deleteState === 'processing' ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</> : 'Delete account'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}