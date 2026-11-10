import { Link } from 'react-router-dom';
import { Play, Star, Check } from 'lucide-react';
import ScorePreview from './ScorePreview';
import MusicPaper from '@/components/patterns/MusicPaper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ownershipLabel = {
  shared: (s) => `Shared by ${s.sharedBy}`,
  saved: () => 'Saved',
  mine: () => null,
};

export default function ScoreCard({ score, selected, onToggleSelect }) {
  if (!score) return null;

  const isPlayed = score.lastPlayed && score.lastPlayed !== 'never';
  const sharedText = ownershipLabel[score.ownership]?.(score);

  return (
    <MusicPaper
      interactive
      className={cn(
        'group relative flex flex-col overflow-hidden transition-[box-shadow,border-color,transform] duration-base',
        selected && 'ring-2 ring-brand border-brand'
      )}
    >
      {/* Miniature score folio header */}
      <Link
        to={`/score/${score.id}`}
        className="block relative aspect-[16/10] overflow-hidden border-b border-surface-paper-edge bg-white/95"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* Subtle folio binding line on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-paper-edge/60 z-10" />
        <ScorePreview id={score.id} className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.02]" />

        {/* Status badges overlay */}
        <div className="absolute top-2.5 left-3 flex flex-wrap gap-1.5 z-10">
          {sharedText && (
            <span className="rounded-control bg-surface-panel/90 backdrop-blur-xs px-2 py-0.5 type-caption font-medium text-ink-secondary">
              {sharedText}
            </span>
          )}
        </div>

        {score.favorite && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="flex h-control-xs w-control-xs items-center justify-center rounded-full bg-surface-panel/90 backdrop-blur-xs">
              <Star className="icon-xs fill-gold text-gold" />
            </span>
          </div>
        )}
      </Link>

      {/* Folio metadata & actions */}
      <div className="flex flex-1 flex-col justify-between p-3.5 gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/score/${score.id}`}
              className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
            >
              <h3 className="truncate font-display text-base sm:text-lg font-medium leading-snug text-ink-primary transition-colors group-hover:text-brand">
                {score.title}
              </h3>
              <p className="truncate type-metadata text-ink-secondary mt-0.5">{score.composer}</p>
            </Link>

            {onToggleSelect && (
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSelect(score.id);
                }}
                className={cn(
                  'flex h-control-xs w-control-xs shrink-0 items-center justify-center rounded-control border transition-[color,background-color,border-color] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface-panel',
                  selected
                    ? 'border-brand bg-brand text-white'
                    : 'border-line-subtle bg-surface-canvas/50 text-transparent hover:border-line-strong'
                )}
                aria-label={`Select ${score.title}`}
              >
                <Check className="icon-xs stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Relationship with this piece */}
          <p className="mt-2 type-caption text-ink-tertiary">
            {isPlayed ? (
              <span>
                Played {score.lastPlayed}
                {score.lastMeasure > 1 ? ` · bar ${score.lastMeasure}` : ''}
              </span>
            ) : (
              <span>Awaiting first practice</span>
            )}
          </p>
        </div>

        {/* Primary practice action & View score link */}
        <div className="mt-1 flex items-center justify-between border-t border-surface-paper-edge/70 pt-2.5">
          <Button
            asChild
            intent="subtle"
            size="xs"
            className="font-semibold text-brand hover:text-brand"
          >
            <Link
              to={`/score/${score.id}/setup`}
              aria-label={`Practice ${score.title}`}
            >
              <Play className="fill-current" />
              <span>Practice</span>
            </Link>
          </Button>

          <Button
            asChild
            intent="quiet"
            size="xs"
            className="type-caption text-ink-secondary hover:text-ink-primary"
          >
            <Link to={`/score/${score.id}`}>
              View score →
            </Link>
          </Button>
        </div>
      </div>
    </MusicPaper>
  );
}
