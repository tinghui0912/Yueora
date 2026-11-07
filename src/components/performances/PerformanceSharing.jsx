import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import SectionHeader from '@/components/patterns/SectionHeader';

/**
 * Sharing a performance never shares its score.
 *
 * Watching and commenting are separate grants, and the owner can close comments
 * for everyone at any time.
 */
export default function PerformanceSharing({ performance, members = [], onSave }) {
  const [scope, setScope] = useState('private');
  const [selected, setSelected] = useState([]);
  const [commenters, setCommenters] = useState([]);
  const [allowComments, setAllowComments] = useState(true);

  useEffect(() => {
    setScope(performance.visibility === 'shared' ? 'shared' : 'private');
    setSelected(performance.sharedWith || []);
    setCommenters(performance.sharedCommenters || []);
    setAllowComments(performance.allowComments !== false);
  }, [performance]);

  const togglePerson = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const toggleCommenter = (id) =>
    setCommenters((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const shared = scope === 'shared';
  const dirty = scope !== (performance.visibility === 'shared' ? 'shared' : 'private')
    || JSON.stringify([...selected].sort()) !== JSON.stringify([...(performance.sharedWith || [])].sort())
    || JSON.stringify([...commenters].sort()) !== JSON.stringify([...(performance.sharedCommenters || [])].sort())
    || allowComments !== (performance.allowComments !== false);

  const save = () => onSave({
    visibility: shared ? 'shared' : 'private',
    sharedWith: shared ? selected : [],
    sharedCommenters: shared ? commenters.filter((id) => selected.includes(id)) : [],
    allowComments,
  });

  const canSave = !shared || selected.length > 0;

  return (
    <section>
      <SectionHeader title="Who can watch this performance" />

      <RadioGroup value={scope} onValueChange={setScope} className="mt-3 gap-2">
        <label className="flex items-center gap-2 type-body-small text-ink-primary">
          <RadioGroupItem value="private" /> Only me
        </label>
        <label className="flex items-center gap-2 type-body-small text-ink-primary">
          <RadioGroupItem value="shared" /> Selected people
        </label>
      </RadioGroup>

      {shared && (
        <div className="mt-3 divide-y divide-line-subtle rounded-container border border-line-subtle">
          {members.length === 0 && (
            <p className="px-4 py-3 type-body-small text-ink-tertiary">There is nobody to share with yet.</p>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <label className="flex min-w-0 items-center gap-2 type-body-small text-ink-primary">
                <Checkbox checked={selected.includes(m.id)} onCheckedChange={() => togglePerson(m.id)} />
                <span className="truncate">{m.name}</span>
              </label>
              <label className={`flex items-center gap-2 type-metadata ${selected.includes(m.id) ? 'text-ink-secondary' : 'text-ink-tertiary'}`}>
                Can comment
                <Switch
                  checked={commenters.includes(m.id)}
                  disabled={!selected.includes(m.id)}
                  onCheckedChange={() => toggleCommenter(m.id)}
                  aria-label={`Allow ${m.name} to comment`}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-container border border-line-subtle px-4 py-3">
        <div>
          <p className="type-body-small font-medium text-ink-primary">Allow comments</p>
          <p className="type-metadata text-ink-tertiary">Existing comments stay readable; new ones close.</p>
        </div>
        <Switch checked={allowComments} onCheckedChange={setAllowComments} aria-label="Allow comments" />
      </div>

      <p className="mt-3 type-metadata text-ink-tertiary">
        Sharing this performance does not share the score, your practice history, or your other performances.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={save} disabled={!dirty || !canSave}>Save access</Button>
        {shared && selected.length === 0 && (
          <span className="type-metadata text-destructive">Choose at least one person.</span>
        )}
      </div>
    </section>
  );
}