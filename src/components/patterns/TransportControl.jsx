import { Play, Pause, RotateCcw, Repeat } from 'lucide-react';

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
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-[color,background-color,box-shadow,transform] duration-base hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Start</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={phase === 'countin'}
            className="flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-[color,background-color,box-shadow,transform] duration-base hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>
        )}

        {onReset && !isReady && (
          <button
            type="button"
            onClick={onReset}
            title="Return to beginning"
            className="flex h-9 w-9 items-center justify-center rounded-control border border-surface-paper-edge bg-surface-paper text-ink-secondary transition-colors hover:bg-surface-paper-warm hover:text-ink-primary active:scale-95"
            aria-label="Return to beginning"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
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
                ? 'border-brand/40 bg-brand-soft font-semibold text-brand-soft-foreground'
                : 'border-surface-paper-edge bg-surface-paper text-ink-secondary hover:text-ink-primary'
            }`}
            title="Loop selected section"
          >
            <Repeat className="h-3.5 w-3.5" />
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
