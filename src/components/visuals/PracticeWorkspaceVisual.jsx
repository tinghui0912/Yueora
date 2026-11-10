/**
 * PracticeWorkspaceVisual — Landing practice section visual.
 * Displays Debussy's Clair de Lune on a tactile paper stand,
 * showcasing calm, non-judgmental phrasing following without pressure.
 */
import { Play, RotateCcw, Volume2, Music } from 'lucide-react';
import ScorePreview from '@/components/library/ScorePreview';

export default function PracticeWorkspaceVisual() {
  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-4 sm:p-6">
      {/* Stand Header: Piece & Non-judgmental Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
            <Music className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="font-display text-sm font-medium text-ink-primary">Clair de Lune</p>
            <p className="type-metadata text-ink-tertiary">Claude Debussy · Suite bergamasque</p>
          </div>
        </div>

        {/* Calm following state pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-practice-following/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-practice-following animate-pulse" />
          <span className="type-metadata font-medium text-ink-secondary">
            Following your phrasing · mm. 14–22
          </span>
        </div>
      </div>

      {/* Interactive Sheet Music Stand */}
      <div className="relative mt-4 overflow-hidden rounded border border-line-subtle bg-surface-canvas/50">
        <div className="aspect-[16/9] w-full">
          <ScorePreview id="practice-visual" className="h-full w-full" />
        </div>

        {/* Tactile phrasing highlight overlay - soft gold, non-intrusive */}
        <div 
          className="absolute left-[42%] top-[18%] h-[64%] w-[26%] rounded border border-practice-current/40 bg-practice-current/15 transition-all"
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface-panel px-2 py-0.5 text-xs font-medium text-ink-secondary shadow-sm border border-line-subtle">
            Bar 14 · Andante très expressif
          </div>
        </div>
      </div>

      {/* Musical Feedback (calm note & tempo, no error red/green) */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line-subtle pt-3 text-center">
        <div>
          <p className="type-caption text-ink-tertiary">Pacing</p>
          <p className="mt-0.5 font-display text-base font-medium text-ink-primary">♩ = 66</p>
          <p className="type-metadata text-ink-tertiary">unforced pace</p>
        </div>
        <div className="border-x border-line-subtle px-2">
          <p className="type-caption text-ink-tertiary">Current Note</p>
          <p className="mt-0.5 font-display text-2xl font-semibold text-brand">E♭</p>
          <p className="type-metadata text-ink-tertiary">sustained</p>
        </div>
        <div>
          <p className="type-caption text-ink-tertiary">Mode</p>
          <p className="mt-0.5 font-display text-base font-medium text-ink-primary">Free Play</p>
          <p className="type-metadata text-ink-tertiary">no score judging</p>
        </div>
      </div>

      {/* Minimal Tactile Transport */}
      <div className="mt-4 flex flex-wrap items-center justify-between rounded-control border border-line-subtle bg-surface-canvas/60 px-3 sm:px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand text-white shadow-sm hover:opacity-95 shrink-0">
            <Play className="h-4 w-4 fill-white" />
          </span>
          <span className="type-metadata font-medium text-ink-secondary">
            Space to Pause
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-ink-tertiary">
          <span className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-xs border border-line-subtle bg-surface-panel">
            <RotateCcw className="h-3 w-3 shrink-0" /> Loop mm. 14–22
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-xs border border-line-subtle bg-surface-panel">
            <Volume2 className="h-3 w-3 shrink-0" /> Metronome off
          </span>
        </div>
      </div>
    </div>
  );
}
