import { Play, Pause, RotateCcw, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * TransportControl: Dedicated musical transport bar.
 * Designed for poise, low-friction muscle memory, and quiet elegance.
 */
export default function TransportControl({
  phase, // 'ready' | 'countin' | 'running' | 'paused'
  mode: _mode, // 'follow' | 'performance'
  onTogglePlay,
  onReset,
  tempoTrigger,
  sectionTrigger,
  loop,
  onToggleLoop,
  loopAllowed,
  settingsTrigger,
  className = '',
}) {
  const isPlaying = phase === 'running';
  const isReady = phase === 'ready';

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {/* Left: Playback transport */}
      <div className="flex items-center gap-2">
        {isReady ? (
          <Button
            type="button"
            intent="primary"
            size="md"
            onClick={onTogglePlay}
          >
            <Play className="fill-current" />
            <span>Start</span>
          </Button>
        ) : (
          <Button
            type="button"
            intent="primary"
            size="md"
            onClick={onTogglePlay}
            disabled={phase === 'countin'}
          >
            {isPlaying ? (
              <>
                <Pause className="fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="fill-current" />
                <span>Resume</span>
              </>
            )}
          </Button>
        )}

        {onReset && !isReady && (
          <Button
            type="button"
            intent="secondary"
            size="icon"
            onClick={onReset}
            title="Return to beginning"
            aria-label="Return to beginning"
          >
            <RotateCcw />
          </Button>
        )}
      </div>

      {/* Center: Tempo & Range Controls */}
      <div className="flex items-center gap-2">
        {tempoTrigger}
        {sectionTrigger}

        {loopAllowed && (
          <button
            type="button"
            onClick={onToggleLoop}
            className={`flex items-center gap-1.5 rounded-control border px-2.5 py-2 text-xs font-medium transition-colors ${
              loop
                ? 'border-brand bg-neutral-muted font-semibold text-ink-primary'
                : 'border-line-subtle bg-surface-panel text-ink-secondary hover:text-ink-primary hover:bg-neutral-hover'
            }`}
            title="Loop selected section"
          >
            <Repeat className={`h-3.5 w-3.5 ${loop ? 'text-brand' : ''}`} />
            <span className="hidden sm:inline">Loop</span>
          </button>
        )}
      </div>

      {/* Right: Settings trigger */}
      <div className="flex items-center gap-1">
        {settingsTrigger}
      </div>
    </div>
  );
}
