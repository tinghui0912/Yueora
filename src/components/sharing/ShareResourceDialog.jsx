import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Sharing a performance is always an explicit choice, and it never shares the
 * score or the practice history behind it.
 */
export default function ShareResourceDialog({ open, onOpenChange, title, members = [], value, onSave }) {
  const [scope, setScope] = useState('private');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setScope(value?.visibility === 'shared' ? 'shared' : 'private');
    setSelected(value?.sharedWith || []);
  }, [open, value]);

  const toggle = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share performance</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>

        <div>
          <p className="type-caption text-ink-tertiary">Who can watch this performance?</p>
          <RadioGroup value={scope} onValueChange={setScope} className="mt-2 gap-2">
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="private" /> Only me
            </label>
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="shared" /> Selected people
            </label>
          </RadioGroup>
        </div>

        {scope === 'shared' && (
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-container border border-line-subtle p-3">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 type-body-small text-ink-primary">
                <Checkbox checked={selected.includes(m.id)} onCheckedChange={() => toggle(m.id)} />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
              </label>
            ))}
          </div>
        )}

        <p className="type-metadata text-ink-tertiary">
          People you choose can watch this recording. Your practice history and score permissions stay exactly as they are.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => onSave({ visibility: scope === 'shared' ? 'shared' : 'private', sharedWith: scope === 'shared' ? selected : [] })}
            disabled={scope === 'shared' && selected.length === 0}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}