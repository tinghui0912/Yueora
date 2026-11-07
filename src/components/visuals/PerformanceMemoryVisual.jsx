/**
 * PerformanceMemoryVisual — Landing performance section visual.
 * A saved recording sitting beside the score it came from. Decorative only.
 */
import { MessageSquare, Play, Users } from 'lucide-react';
import ScorePreview from '@/components/library/ScorePreview';

export default function PerformanceMemoryVisual() {
  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="type-caption text-ink-tertiary">Saved performance</p>
        <span className="rounded-control bg-accent px-2 py-0.5 type-metadata text-accent-foreground">Private</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <div className="overflow-hidden rounded-control border border-line-subtle bg-white">
          <div className="aspect-[16/10]">
            <ScorePreview id="moonlight" className="h-full w-full" />
          </div>
        </div>
        <div className="flex w-24 flex-col items-center justify-center gap-2 rounded-control border border-line-subtle bg-surface-canvas">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/12 text-brand">
            <Play className="h-4 w-4" />
          </span>
          <span className="type-metadata text-ink-tertiary">3:42</span>
        </div>
      </div>

      <p className="mt-3 font-display text-base font-medium text-ink-primary">Moonlight Sonata</p>
      <p className="type-metadata text-ink-tertiary">Beethoven · Measures 1–48 · Audio</p>

      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 type-metadata text-ink-secondary">
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand" /> Shared with Alice</span>
        <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-ink-tertiary" /> Comments on</span>
      </div>
    </div>
  );
}