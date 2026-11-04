/**
 * PracticeWorkspaceVisual — Landing practice section visual.
 * Compact mock of the practice workspace: score with active measure, current note, minimal controls.
 */
import ScorePreview from '@/components/library/ScorePreview';
import { Play, Timer } from 'lucide-react';

export default function PracticeWorkspaceVisual() {
  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-4 shadow-sm">
      {/* Mock topbar */}
      <div className="flex items-center justify-between border-b border-line-subtle pb-2">
        <span className="text-sm text-ink-secondary">Clair de Lune</span>
        <span className="rounded-control bg-practice-current/15 px-2 py-0.5 text-xs font-medium text-practice-current">Measure 14</span>
      </div>

      {/* Score preview with active measure highlight */}
      <div className="relative mt-3">
        <div className="aspect-[16/9]">
          <ScorePreview id="practice-visual" className="h-full w-full" />
        </div>
        {/* Active measure highlight overlay */}
        <div className="absolute left-[55%] top-[15%] h-[70%] w-[12%] rounded-sm bg-practice-current/20" />
      </div>

      {/* Current note feedback */}
      <div className="mt-3 border-t border-line-subtle pt-3 text-center">
        <p className="type-caption text-ink-tertiary">Current note</p>
        <p className="mt-0.5 font-display text-2xl text-ink-primary">E♭</p>
      </div>

      {/* Minimal controls */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 rounded-control border border-line-subtle px-3 py-1.5 text-xs text-ink-secondary">
          <Timer className="h-3.5 w-3.5" /> Metronome
        </span>
        <span className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
          <Play className="h-3.5 w-3.5" /> Play
        </span>
      </div>
    </div>
  );
}