import { Check, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS = {
  waiting: { text: 'Waiting for you', tone: 'text-ink-secondary', icon: null },
  matched: { text: 'Matched', tone: 'text-practice-correct', icon: Check },
  wrong: { text: 'Not quite — Yueora is still waiting', tone: 'text-practice-error', icon: X },
  skipped: { text: 'Skipped', tone: 'text-ink-secondary', icon: SkipForward },
};

/**
 * Follow-notes feedback. The score only moves on when a group resolves, so the
 * demo controls below stand in for the recognition model — they are labelled.
 */
export default function FollowFeedback({ current, status, matched, skipped, paused, onResolve }) {
  const state = STATUS[status] || STATUS.waiting;
  const Icon = state.icon;

  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <p className="flex items-baseline gap-2">
        <span className="type-caption text-ink-tertiary">Current note</span>
        <span className="type-display text-2xl text-ink-primary">{current}</span>
      </p>

      <span className={`flex items-center gap-1.5 type-body-small ${paused ? 'text-ink-tertiary' : state.tone}`}>
        {Icon && !paused && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {paused ? 'Paused' : state.text}
      </span>

      <span className="type-metadata text-ink-tertiary">{matched} matched · {skipped} skipped</span>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onResolve('matched')} disabled={paused}>
          Play note
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onResolve('wrong')} disabled={paused}>
          Play a wrong note
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onResolve('skipped')} disabled={paused}>
          <SkipForward className="mr-1 h-3.5 w-3.5" /> Skip
        </Button>
      </div>

      <p className="w-full text-center type-metadata text-ink-tertiary">
        Demo recognition — these controls stand in for the listening model.
      </p>
    </div>
  );
}