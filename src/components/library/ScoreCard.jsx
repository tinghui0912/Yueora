import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import ScorePreview from './ScorePreview';
import { Checkbox } from '@/components/ui/checkbox';
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
    <div
      data-qa="score-card"
      data-score-id={score.id}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-container border border-line-subtle/50 bg-surface-panel transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 select-none',
        selected && 'border-brand ring-2 ring-brand'
      )}
    >
      {/* Semantic Stretched Navigation Link for accessible mouse & keyboard activation */}
      <Link
        to={`/score/${score.id}`}
        data-qa="score-card-link"
        className="absolute inset-0 z-0 rounded-container focus:outline-none focus:ring-1 focus:ring-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
        aria-label={`Open score: ${score.title} by ${score.composer}`}
      />

      {/* Visual Artifact Preview Zone (~50% height, modeled on NumisCollection ItemCard) */}
      <div
        data-qa="score-card-visual"
        className="relative aspect-[4/3] w-full overflow-hidden border-b border-line-subtle/50 bg-surface-canvas/50 pointer-events-none"
      >
        <ScorePreview
          id={score.id}
          className="h-full w-full object-cover"
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-auto">
          {sharedText && (
            <span className="rounded-control bg-surface-panel/90 backdrop-blur-xs px-2 py-0.5 type-metadata text-ink-secondary border border-line-subtle/60">
              {sharedText}
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 pointer-events-auto">
          {score.favorite && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-panel/90 backdrop-blur-xs border border-line-subtle/60">
              <Star className="icon-xs fill-gold text-gold" />
            </span>
          )}
          {onToggleSelect && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center"
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect(score.id)}
                aria-label={`Select ${score.title}`}
                data-qa="score-card-checkbox"
                className="bg-surface-panel/90 backdrop-blur-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Musical Metadata */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3 pointer-events-none">
        <div>
          <h3
            data-qa="score-card-title"
            className="truncate type-card-title text-ink-primary transition-colors group-hover:text-brand"
          >
            {score.title}
          </h3>
          <p
            data-qa="score-card-composer"
            className="truncate type-card-metadata text-ink-secondary mt-0.5"
          >
            {score.composer}
          </p>
        </div>

        {/* Divider & Prominent Value / State Row */}
        <div
          data-qa="score-card-status"
          className="pt-2.5 border-t border-line-subtle/50 flex items-center justify-between"
        >
          <div className="min-w-0 flex-1">
            <p className="type-card-value-label text-ink-tertiary">
              {isPlayed ? 'Last session' : 'Status'}
            </p>
            <p className="type-card-value text-brand truncate mt-0.5">
              {isPlayed
                ? `Played ${score.lastPlayed}${score.lastMeasure > 1 ? ` · Bar ${score.lastMeasure}` : ''}`
                : 'Ready on stand'}
            </p>
          </div>

          {/* Quick status cue matching NumisCollection's indicator */}
          <div className="flex items-center gap-1 type-metadata font-medium text-ink-tertiary group-hover:text-brand transition-colors">
            <Play className="icon-xs fill-current" />
            <span>Stand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
