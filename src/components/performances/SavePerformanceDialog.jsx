import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Saving is the only thing that turns a temporary recording into an asset.
 */
export default function SavePerformanceDialog({ open, onOpenChange, scoreTitle, members = [], onSave }) {
  const [scope, setScope] = useState('private');
  const [selected, setSelected] = useState([]);

  const toggle = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const reset = (next) => {
    if (!next) {
      setScope('private');
      setSelected([]);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save this performance?</DialogTitle>
          <DialogDescription>
            Your recording will be added to your private Performances library.
          </DialogDescription>
        </DialogHeader>

        <p className="type-metadata text-ink-tertiary">{scoreTitle}</p>

        <div>
          <p className="type-caption text-ink-tertiary">Who can view this performance?</p>
          <RadioGroup value={scope} onValueChange={setScope} className="mt-2 gap-2">
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="private" /> Only me
            </label>
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="shared" /> Share with selected team members
            </label>
          </RadioGroup>
        </div>

        {scope === 'shared' && (
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-container border border-line-subtle p-3">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 type-body-small text-ink-primary">
                <Checkbox checked={selected.includes(m.id)} onCheckedChange={() => toggle(m.id)} />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
                <span className="type-metadata text-ink-tertiary">{m.role}</span>
              </label>
            ))}
          </div>
        )}

        <p className="type-metadata text-ink-tertiary">
          Nothing is uploaded until you save.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => reset(false)}>Cancel</Button>
          <Button
            onClick={() => onSave({ visibility: scope === 'shared' ? 'shared' : 'private', sharedWith: scope === 'shared' ? selected : [] })}
            disabled={scope === 'shared' && selected.length === 0}
          >
            Save performance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}