import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Pencil, Share2, MoreHorizontal, Star } from 'lucide-react';
import { getScore } from '@/lib/mockData';
import ScorePreview from '@/components/library/ScorePreview';
import SharingDialog from '@/components/sharing/SharingDialog';

export default function ScoreDetail() {
  const { scoreId } = useParams();
  const score = getScore(scoreId);
  const [shareOpen, setShareOpen] = useState(false);

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <h1 className="font-display text-2xl">Score not found</h1>
        <Link to="/library" className="mt-4 inline-block text-primary underline">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <Link to="/library" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-medium leading-tight">{score.title}</h1>
            {score.favorite && <Star className="h-5 w-5 fill-gold text-gold" />}
          </div>
          <p className="mt-1 text-muted-foreground">{score.composer}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/score/${score.id}/practice`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" /> Practice
          </Link>
          <Link to={`/score/${score.id}/edit`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="rounded-md border border-border p-2.5 text-muted-foreground hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-md border border-border bg-card p-4">
          <div className="aspect-[16/10]">
            <ScorePreview id={score.id} className="h-full w-full" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <span>Page 1 of {score.pages}</span>
            <div className="flex gap-2">
              <button className="rounded border border-border px-2 py-1 hover:bg-accent">‹</button>
              <button className="rounded border border-border px-2 py-1 hover:bg-accent">›</button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Practice</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Last session</dt><dd>{score.practiceState.lastPracticed === 'never' ? '—' : score.practiceState.lastPracticed}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Accuracy</dt><dd>{score.practiceState.accuracy > 0 ? `${score.practiceState.accuracy}%` : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{score.practiceState.status.replace('_', ' ')}</dd></div>
            </dl>
            <Link to={`/score/${score.id}/practice`} className="mt-4 block rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90">
              {score.practiceState.measure > 1 ? `Continue from measure ${score.practiceState.measure}` : 'Start practice'}
            </Link>
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Composer</dt><dd>{score.composer}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Instrument</dt><dd>{score.instrument}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tags</dt><dd className="flex flex-wrap justify-end gap-1">{score.tags.map((t) => <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">{t}</span>)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{score.created}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <SharingDialog score={score} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}