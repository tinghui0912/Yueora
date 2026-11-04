import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { generateNotes } from '@/lib/mockData';
import { fmtClock, measureWindowStart } from '@/lib/practiceUtils';
import ScoreCanvas from '@/components/editor/ScoreCanvas';

const BARS = [18, 34, 26, 48, 40, 62, 30, 54, 44, 28, 58, 36, 46, 24, 52, 32];

/**
 * Replay: one timeline drives the media position, the score cursor and the
 * active measure together.
 */
export default function PerformanceReplay({ scoreId, mediaKind, durationSec, totalMeasures, startMeasure }) {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notes] = useState(() => generateNotes(scoreId));

  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= durationSec) {
          setPlaying(false);
          return durationSec;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, durationSec]);

  const progress = durationSec ? pos / durationSec : 0;
  const activeMeasure = Math.min(
    totalMeasures,
    Math.max(1, (startMeasure || 1) + Math.floor(progress * totalMeasures))
  );

  const toggle = () => {
    if (pos >= durationSec) setPos(0);
    setPlaying((p) => !p);
  };

  return (
    <div>
      <div className={mediaKind === 'video' ? 'grid gap-2 sm:grid-cols-2' : ''}>
        <div className="overflow-hidden rounded-container border border-line-subtle bg-surface-panel p-2">
          <ScoreCanvas
            notes={notes}
            selectedIds={null}
            onSelect={() => {}}
            zoom={1}
            activeMeasure={activeMeasure}
            activeMeasureVariant="practice"
            measureStart={measureWindowStart(activeMeasure)}
          />
        </div>

        {mediaKind === 'video' ? (
          <div
            role="img"
            aria-label="Recorded video replay"
            className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-container border border-line-subtle bg-gradient-to-br from-ink-primary/85 to-ink-primary/55 text-surface-panel"
          >
            <span className="type-metadata opacity-80">Video</span>
            <span className="type-metric text-lg tabular-nums">{fmtClock(pos)}</span>
          </div>
        ) : (
          <div className="mt-2 flex h-12 items-end gap-[3px] rounded-container border border-line-subtle bg-surface-panel px-3 py-2" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className={`flex-1 rounded-sm ${i / BARS.length <= progress ? 'bg-brand' : 'bg-line-strong'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause replay' : 'Play replay'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={durationSec}
            step={1}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Seek performance replay"
            className="w-full accent-primary"
          />
          <div className="flex justify-between type-metadata text-ink-tertiary">
            <span className="tabular-nums">{fmtClock(pos)}</span>
            <span>Measure {activeMeasure}</span>
            <span className="tabular-nums">{fmtClock(durationSec)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}