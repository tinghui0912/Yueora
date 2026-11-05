import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * One dialog, two resources. Sharing an activity never shares a performance,
 * and sharing a performance never shares the score.
 */
export default function ShareResourceDialog({ open, onOpenChange, kind, title, members = [], value, onSave }) {
  const [scope, setScope] = useState('private');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setScope(value?.visibility === 'shared' ? 'shared' : 'private');
    setSelected(value?.sharedWith || []);
  }, [open, value]);

  const toggle = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const isActivity = kind === 'activity';
  const noun = isActivity ? 'activity' : 'performance';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isActivity ? 'Share practice activity' : 'Share performance'}</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>

        <div>
          <p className="type-caption text-ink-tertiary">
            {isActivity ? 'Who can see this activity?' : 'Who can watch this performance?'}
          </p>
          <RadioGroup value={scope} onValueChange={setScope} className="mt-2 gap-2">
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="private" /> Only me
            </label>
            <label className="flex items-center gap-2 type-body-small text-ink-primary">
              <RadioGroupItem value="shared" /> Selected team members
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
          {isActivity
            ? 'Members see the piece, date, duration and mode. Never a report or recording.'
            : 'Members can watch this recording. Activity and score access stay separate.'}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => onSave({ visibility: scope === 'shared' ? 'shared' : 'private', sharedWith: scope === 'shared' ? selected : [] })}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}