import { SkipForward } from 'lucide-react';

/**
 * Presentation language mapping for listening / recognition state.
 * Yueora separates internal engine signals from user-facing language:
 * No red 'wrong', no grading, no judgement.
 */
const STATUS_PRESENTATION = {
  waiting: {
    label: 'Listening for note…',
    tone: 'text-ink-secondary',
    dot: 'bg-practice-waiting',
  },
  matched: {
    label: 'Following your phrasing',
    tone: 'text-practice-following',
    dot: 'bg-practice-following',
  },
  wrong: {
    label: 'Take your time — Yueora is waiting here',
    tone: 'text-practice-resyncing',
    dot: 'bg-practice-resyncing',
  },
  skipped: {
    label: 'Advancing phrase',
    tone: 'text-ink-secondary',
    dot: 'bg-ink-tertiary',
  },
};

/**
 * FollowFeedback: Non-judgmental practice companion.
 * Follows the musician's pace without evaluation, grading, or red/green correction cues.
 * Internal recognition telemetry is kept out of normal musician UI.
 */
export default function FollowFeedback({
  current,
  status,
  matched: _matched = 0,
  skipped: _skipped = 0,
  paused = false,
  showSimulator = false,
  onResolve,
}) {
  const currentPresentation = STATUS_PRESENTATION[status] || STATUS_PRESENTATION.waiting;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
      {/* Current note & calm state */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-container border border-surface-paper-edge bg-surface-paper shadow-xs">
          <span className="font-display text-2xl font-medium text-ink-primary">{current}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${paused ? 'bg-ink-tertiary' : currentPresentation.dot}`}
              aria-hidden="true"
            />
            <p className={`text-sm font-medium ${paused ? 'text-ink-secondary' : currentPresentation.tone}`}>
              {paused ? 'Session paused' : currentPresentation.label}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {paused ? 'Press Space or Resume when ready' : 'Listening quietly at your natural tempo'}
          </p>
        </div>
      </div>

      {/* Developer / verification controls — hidden in normal musician view */}
      {showSimulator && onResolve && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs uppercase tracking-wider text-ink-tertiary mr-1 font-mono">Dev:</span>
          <button
            type="button"
            onClick={() => onResolve('matched')}
            disabled={paused}
            className="rounded-control border border-line-subtle bg-surface-panel px-2.5 py-1 text-xs font-medium text-ink-primary shadow-xs transition-colors hover:bg-neutral-hover disabled:opacity-40"
          >
            Play ({current})
          </button>
          <button
            type="button"
            onClick={() => onResolve('wrong')}
            disabled={paused}
            className="rounded-control border border-line-subtle bg-surface-panel px-2 py-1 text-xs text-ink-secondary transition-colors hover:bg-neutral-hover disabled:opacity-40"
          >
            Different pitch
          </button>
          <button
            type="button"
            onClick={() => onResolve('skipped')}
            disabled={paused}
            className="flex items-center gap-1 rounded-control border border-transparent px-2 py-1 text-xs text-ink-tertiary transition-colors hover:bg-neutral-hover disabled:opacity-40"
          >
            <SkipForward className="h-3 w-3" />
            <span>Advance</span>
          </button>
        </div>
      )}
    </div>
  );
}
