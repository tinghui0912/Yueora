import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  if (!score) return null;

  const isPlayed = score.lastPlayed && score.lastPlayed !== 'never';
  const sharedText = ownershipLabel[score.ownership]?.(score);

  return (
    <div
      onClick={() => navigate(`/score/${score.id}`)}
      data-qa="score-card"
      data-score-id={score.id}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-container border border-line-subtle bg-surface-panel transition-all duration-300 hover:border-brand/40 hover:shadow-raised hover:-translate-y-1 cursor-pointer select-none',
        selected && 'border-brand ring-2 ring-brand'
      )}
    >
      {/* Visual Artifact Preview Zone (Modeled on NumisCollection ItemCard) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-line-subtle bg-surface-canvas/50">
        <ScorePreview
          id={score.id}
          className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.03]"
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {sharedText && (
            <span className="rounded-control bg-surface-panel/90 backdrop-blur-xs px-2 py-0.5 type-caption text-ink-secondary border border-line-subtle/60">
              {sharedText}
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
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
                className="bg-surface-panel/90 backdrop-blur-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Musical Metadata */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div>
          <h3 className="truncate font-display text-base font-semibold leading-snug text-ink-primary transition-colors group-hover:text-brand">
            {score.title}
          </h3>
          <p className="truncate type-metadata text-ink-secondary mt-0.5">
            {score.composer}
          </p>
        </div>

        {/* Divider & Prominent Value / State Row */}
        <div className="pt-2.5 border-t border-line-subtle flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="type-caption text-ink-tertiary">
              {isPlayed ? 'Last session' : 'Status'}
            </p>
            <p className="type-body-small font-semibold text-brand truncate mt-0.5">
              {isPlayed
                ? `Played ${score.lastPlayed}${score.lastMeasure > 1 ? ` · Bar ${score.lastMeasure}` : ''}`
                : 'Ready on stand'}
            </p>
          </div>

          {/* Quick status cue matching NumisCollection's indicator */}
          <div className="flex items-center gap-1 type-caption font-medium text-ink-tertiary group-hover:text-brand transition-colors">
            <Play className="icon-xs fill-current" />
            <span>Stand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
