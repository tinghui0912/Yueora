import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Saving keeps the recording privately. Sharing is always a separate, later step.
 */
export default function SavePerformanceDialog({ open, onOpenChange, scoreTitle, saving, error, onSave }) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keep this performance?</DialogTitle>
          <DialogDescription>
            The recording is uploaded to your private Performances library. Only you can watch it until you choose to share it.
          </DialogDescription>
        </DialogHeader>

        <p className="type-metadata text-ink-tertiary">{scoreTitle}</p>

        {error && <p className="type-body-small text-destructive">{error}</p>}

        <DialogFooter>
          <Button intent="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving…</> : 'Save performance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}