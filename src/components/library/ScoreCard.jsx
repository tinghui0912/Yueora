import { Link } from 'react-router-dom';
import { Play, Star, Share2, MoreHorizontal } from 'lucide-react';
import ScorePreview from './ScorePreview';

const statusLabel = {
  to_practice: 'To practice',
  recently_practiced: 'Recently practiced',
  mastered: 'Mastered',
};

const statusColor = {
  to_practice: 'text-gold',
  recently_practiced: 'text-primary',
  mastered: 'text-muted-foreground',
};

export default function ScoreCard({ score }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-sm">
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
          <button className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`text-xs font-medium ${statusColor[score.practiceState.status]}`}>
            {statusLabel[score.practiceState.status]}
          </span>
          {score.practiceState.accuracy > 0 && (
            <span className="text-xs text-muted-foreground">· {score.practiceState.accuracy}% accuracy</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {score.practiceState.lastPracticed === 'never' ? 'Not practiced yet' : `Practiced ${score.practiceState.lastPracticed}`}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {score.ownership === 'shared' && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">Shared by {score.sharedBy}</span>
          )}
          {score.ownership === 'saved' && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">Saved</span>
          )}
          {score.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
        </div>

        <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            to={`/score/${score.id}/practice`}
            className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Play className="h-3 w-3" /> Practice
          </Link>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}