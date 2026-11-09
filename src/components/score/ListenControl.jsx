import { useEffect, useState } from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import { fmtClock } from '@/lib/practiceUtils';

// Listening to a score is a different act from practicing it: no feedback, no
// listening model, just the music at its own tempo.
export default function ListenControl({ score }) {
  // Scores that arrived as photos have no engraved audio yet.
  const unavailable = score.source === 'Photo';
  const totalSec = Math.max(
    30,
    Math.round(((score.measures || 32) * 4 * 60) / (score.tempo || 80))
  );
  const [status, setStatus] = useState('idle'); // idle | preparing | playing | paused
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (status !== 'preparing') return undefined;
    const t = setTimeout(() => setStatus('playing'), 900);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= totalSec) {
          setStatus('idle');
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, totalSec]);

  const toggle = () => {
    if (status === 'idle') setStatus('preparing');
    else if (status === 'playing') setStatus('paused');
    else if (status === 'paused') setStatus('playing');
  };

  if (unavailable) {
    return (
      <p className="mt-3 border-t border-line-subtle pt-3 type-body-small text-ink-tertiary">
        Listening isn’t available for this score yet.
      </p>
    );
  }

  const busy = status === 'preparing';
  const percent = (pos / totalSec) * 100;
  const stateLabel =
    status === 'preparing' ? 'Preparing audio' : status === 'playing' ? 'Playing' : status === 'paused' ? 'Paused' : 'Listen';

  return (
    <div className="mt-3 flex items-center gap-3 border-t border-line-subtle pt-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={status === 'playing' ? 'Pause listening' : 'Listen to this score'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-subtle text-ink-primary hover:bg-neutral-hover"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between type-metadata text-ink-secondary">
          <span>{stateLabel}</span>
          <span className="tabular-nums">{fmtClock(pos)} <span className="text-ink-tertiary">/ {fmtClock(totalSec)}</span></span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}