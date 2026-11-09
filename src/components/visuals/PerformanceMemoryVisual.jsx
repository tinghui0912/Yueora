/**
 * PerformanceMemoryVisual — Landing performance section visual.
 * Displays a kept personal take of Debussy's Clair de Lune,
 * complete with audio reflection notes and paper warmth.
 */
import { Play, Lock, Music2, Calendar, Clock, Heart } from 'lucide-react';
import ScorePreview from '@/components/library/ScorePreview';

export default function PerformanceMemoryVisual() {
  return (
    <div aria-hidden="true" className="music-paper rounded-lg p-5 shadow-paper sm:p-6">
      {/* Folio Header */}
      <div className="flex items-center justify-between border-b border-line-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
            <Music2 className="h-3 w-3" />
          </span>
          <p className="type-caption font-medium uppercase tracking-wider text-ink-tertiary">
            Kept Performance · Repertoire Archive
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-canvas/80 px-2.5 py-0.5 type-metadata text-ink-secondary">
          <Lock className="h-3 w-3 text-brand" /> Private to you
        </span>
      </div>

      {/* Main Memory Content: Score Beside the Recording */}
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h4 className="font-display text-xl font-medium text-ink-primary">Clair de Lune</h4>
            <span className="type-metadata text-ink-tertiary">Take 3</span>
          </div>
          <p className="mt-0.5 type-metadata text-ink-secondary">Claude Debussy · mm. 1–36 (Full Exposition)</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 type-metadata text-ink-tertiary">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> September 8, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 3:42 audio
            </span>
          </div>
        </div>

        {/* Tactile Play Trigger */}
        <div className="flex flex-col items-center justify-center rounded-control border border-line-subtle bg-surface-canvas/60 px-4 py-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:scale-105">
            <Play className="h-5 w-5 fill-white pl-0.5" />
          </span>
          <span className="mt-2 type-metadata font-medium text-ink-secondary">3:42 take</span>
        </div>
      </div>

      {/* Synchronized Score Slice */}
      <div className="mt-4 overflow-hidden rounded border border-line-subtle bg-surface-canvas/40">
        <div className="aspect-[21/9] w-full">
          <ScorePreview id="clair-de-lune-memory" className="h-full w-full" />
        </div>
      </div>

      {/* Personal Reflection Note */}
      <div className="mt-4 rounded-control border border-line-subtle bg-surface-canvas/40 p-3.5">
        <div className="flex items-center justify-between text-xs text-ink-tertiary mb-1">
          <span className="font-medium text-ink-secondary">Personal Note</span>
          <span className="flex items-center gap-1 text-brand">
            <Heart className="h-3 w-3 fill-brand/20" /> Favorited moment
          </span>
        </div>
        <p className="font-serif italic text-sm leading-relaxed text-ink-primary">
          &ldquo;Felt calmer today. Left hand relaxed into the gentle arpeggios at bar 27 without rushing. Keep this one.&rdquo;
        </p>
      </div>

      {/* Footer metadata */}
      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-xs text-ink-tertiary">
        <span>Recorded directly on Living Room Piano</span>
        <span className="text-ink-secondary font-medium">Original take preserved in high fidelity</span>
      </div>
    </div>
  );
}
