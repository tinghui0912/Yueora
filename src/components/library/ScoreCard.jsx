import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import ScorePreview from './ScorePreview';

const ownershipLabel = {
  shared: (s) => `Shared by ${s.sharedBy}`,
  saved: () => 'Saved',
  mine: () => 'Mine',
};

export default function ScoreCard({ score, selected, onToggleSelect }) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-sm ${selected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
      <Link to={`/score/${score.id}`} className="block">
        <div className="aspect-[16/10] border-b border-border bg-card">
          <ScorePreview id={score.id} className="h-full w-full" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/score/${score.id}`} className="min-w-0">
            <h3 className="truncate font-display text-base font-medium leading-tight text-foreground">{score.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{score.composer}</p>
          </Link>
          {onToggleSelect && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleSelect(score.id); }}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent hover:border-foreground/40'}`}
              aria-label="Select score"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8.5l3.5 3.5L13 4" /></svg>
            </button>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {score.lastPlayed === 'never' || !score.lastPlayed ? 'Not played yet' : `Played ${score.lastPlayed}`}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {score.ownership !== 'mine' && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">{ownershipLabel[score.ownership]?.(score)}</span>
          )}
          {score.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
        </div>

        <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            to={`/score/${score.id}/setup`}
            className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Play className="h-3 w-3" /> Practice
          </Link>
        </div>
      </div>
    </div>
  );
}