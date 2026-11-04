/**
 * HeroProductVisual — Landing hero visual.
 * Shows the "paper → recognized score" narrative in a single focused composition.
 * Left: mock scan page (slightly rotated, shadowed).
 * Right: clean interactive score preview with "Interactive score" badge.
 */
import MockScanPage from './MockScanPage';
import ScorePreview from '@/components/library/ScorePreview';

export default function HeroProductVisual() {
  return (
    <div aria-hidden="true" className="relative">
      {/* Scan page — slightly behind, rotated */}
      <div className="absolute left-0 top-4 w-[42%] rotate-[-3deg] rounded-md border border-line-subtle bg-surface-panel p-2 shadow-md">
        <MockScanPage seed="hero-scan" className="aspect-[3/4] w-full" />
        <p className="mt-1.5 text-center text-xs text-ink-tertiary">Scanned page</p>
      </div>

      {/* Recognized score — front, larger */}
      <div className="ml-[34%] rounded-container border border-line-subtle bg-surface-panel p-4 shadow-sm">
        <div className="aspect-[16/10]">
          <ScorePreview id="moonlight-hero" className="h-full w-full" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3">
          <div>
            <p className="font-display text-base font-medium text-ink-primary">Moonlight Sonata</p>
            <p className="text-sm text-ink-secondary">Beethoven</p>
          </div>
          <span className="rounded-control bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">Interactive score</span>
        </div>
      </div>

      {/* Arrow connecting scan to score */}
      <svg className="absolute left-[37%] top-[40%] h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}