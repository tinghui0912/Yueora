import { Minus, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// Tempo and metronome belong together, and tempo is part of the music — not a
// playback-speed setting.
export default function TempoPopover({
  trigger,
  triggerLabel,
  scoreTempo,
  hasTempoChanges,
  tempoMode,
  customBpm,
  bpm,
  locked,
  metronome,
  onTempoMode,
  onBpm,
  onMetronome,
}) {
  const nudge = (delta) => onBpm(Math.min(200, Math.max(40, bpm + delta)));

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="center" className="w-80 max-w-[calc(100vw-2rem)] p-4">
        <p className="type-caption text-ink-tertiary">Tempo &amp; metronome</p>

        <div className="mt-3">
          <p className="type-body-small font-medium text-ink-primary">Score tempo</p>
          <p className="mt-0.5 type-body-small text-ink-secondary">
            {hasTempoChanges
              ? 'Score tempo varies through the piece.'
              : scoreTempo
                ? `Score starts at \u2669 = ${scoreTempo} BPM`
                : 'No tempo in score · using 80 BPM'}
          </p>
          <button
            type="button"
            onClick={() => onTempoMode('score')}
            disabled={locked}
            aria-pressed={tempoMode === 'score'}
            className={`mt-2 w-full rounded-control border px-3 py-1.5 text-sm disabled:opacity-50 ${tempoMode === 'score' ? 'border-brand text-brand' : 'border-line-subtle text-ink-secondary hover:bg-accent/50'}`}
          >
            {tempoMode === 'score' ? 'Using score tempo' : 'Use score tempo'}
          </button>
        </div>

        <div className="mt-4 border-t border-line-subtle pt-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => nudge(-5)}
              disabled={locked}
              aria-label="Decrease tempo by 5 BPM"
              className="rounded-control border border-line-subtle p-1.5 text-ink-secondary disabled:opacity-40 hover:bg-accent"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="type-metric text-lg text-ink-primary" aria-live="polite">{bpm} BPM</span>
            <button
              type="button"
              onClick={() => nudge(5)}
              disabled={locked}
              aria-label="Increase tempo by 5 BPM"
              className="rounded-control border border-line-subtle p-1.5 text-ink-secondary disabled:opacity-40 hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Slider
            className="mt-3"
            value={[bpm]}
            min={40}
            max={200}
            step={1}
            disabled={locked}
            onValueChange={([v]) => onBpm(v)}
            aria-label="Tempo in beats per minute"
          />
          <div className="mt-1 flex justify-between type-metadata text-ink-tertiary"><span>40</span><span>200</span></div>
          {tempoMode === 'fixed' && (
            <button
              type="button"
              onClick={() => onTempoMode('score')}
              disabled={locked}
              className="mt-2 text-sm text-brand hover:underline disabled:opacity-50"
            >
              Restore score tempo
            </button>
          )}
          {locked && <p className="mt-2 type-metadata text-ink-tertiary">Tempo is locked while playing.</p>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3">
          <span className="type-body-small text-ink-primary">Metronome</span>
          <Switch checked={metronome} onCheckedChange={onMetronome} aria-label="Metronome" />
        </div>
        <p className="sr-only">{triggerLabel}</p>
      </PopoverContent>
    </Popover>
  );
}