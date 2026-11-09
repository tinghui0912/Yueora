/**
 * HeroProductVisual — Demonstrates "From paper into your personal musical life".
 * Shows the same piece (Clair de Lune) moving from a physical scan into an interactive folio with personal history.
 */
import MockScanPage from './MockScanPage';
import ScorePreview from '@/components/library/ScorePreview';
import MusicPaper from '@/components/patterns/MusicPaper';
import { ScoreSheetGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';

export default function HeroProductVisual() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* 1. Scanned paper page — tilted archival sheet */}
      <div className="absolute -left-2 top-6 w-[45%] rotate-[-4deg] rounded-md border border-surface-paper-edge bg-surface-paper p-2.5 shadow-paper transition-transform duration-slow hover:rotate-[-2deg] z-10 sm:left-2">
        <div className="flex items-center justify-between pb-1.5 px-0.5 border-b border-surface-paper-edge text-xs text-ink-secondary/70">
          <span>Physical scan</span>
          <span>PDF / Photo</span>
        </div>
        <div className="mt-1.5 overflow-hidden rounded">
          <MockScanPage seed="clair-de-lune-scan" className="aspect-[3/4] w-full" />
        </div>
        <p className="mt-1.5 text-center font-display italic text-xs text-ink-secondary">
          Clair de Lune · Debussy
        </p>
      </div>

      {/* 2. Recognized interactive score in personal repertoire */}
      <MusicPaper
        elevation="paper"
        className="ml-[30%] sm:ml-[28%] p-4 sm:p-5 relative z-20 transition-transform duration-slow hover:translate-y-[-2px]"
      >
        <div className="flex items-center justify-between border-b border-surface-paper-edge pb-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
              <ScoreSheetGlyph className="h-3 w-3" />
            </span>
            <span className="font-medium text-ink-primary">In your Repertoire</span>
          </div>
          <span className="rounded-control border border-line-subtle bg-surface-panel px-2 py-0.5 type-caption font-semibold text-brand">
            Interactive Score
          </span>
        </div>

        {/* Score preview */}
        <div className="aspect-[16/10] mt-3 overflow-hidden rounded border border-surface-paper-edge bg-white">
          <ScorePreview id="clair-de-lune" className="h-full w-full object-cover" />
        </div>

        {/* Piece info & living personal history */}
        <div className="mt-3.5 flex items-start justify-between gap-2 border-t border-surface-paper-edge pt-3">
          <div>
            <p className="font-display text-base font-medium text-ink-primary leading-tight">
              Clair de Lune
            </p>
            <p className="text-xs text-ink-secondary mt-0.5">Claude Debussy · 3/4 Time · Key of D♭</p>
          </div>
        </div>

        {/* Organic relationship metadata */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-control bg-surface-canvas/60 px-2.5 py-1.5 text-xs text-ink-secondary">
          <span className="flex items-center gap-1 text-brand font-medium">
            <PracticeGlyph className="h-3 w-3" /> Continue from bar 14
          </span>
          <span className="text-ink-tertiary">·</span>
          <span className="flex items-center gap-1 text-ink-secondary/70">
            <MemoryGlyph className="h-3 w-3" /> 1 take kept
          </span>
        </div>
      </MusicPaper>

      {/* Musical resonance connector */}
      <svg
        className="absolute left-[33%] top-[45%] h-8 w-8 text-brand/60 z-30 pointer-events-none drop-shadow-xs"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}
