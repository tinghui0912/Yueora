import { ScoreSheetGlyph } from '@/components/brand/MusicalGlyphs';

/**
 * RouteLoading: A calm, serene loading state on tactile paper surface.
 * Avoids jarring spinner flickers and respects the Yueora visual language.
 */
export default function RouteLoading({ message = 'Opening score…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 select-none">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-container border border-surface-paper-edge bg-surface-paper shadow-paper">
        <ScoreSheetGlyph className="h-6 w-6 text-brand animate-pulse" />
      </div>
      <p className="mt-4 font-display text-sm italic text-ink-secondary">
        {message}
      </p>
    </div>
  );
}
