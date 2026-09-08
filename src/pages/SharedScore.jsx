import { Link, useParams, useNavigate } from 'react-router-dom';
import { Play, Download, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSharedScore } from '@/lib/mockData';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import ScorePreview from '@/components/library/ScorePreview';
import { Button } from '@/components/ui/button';

export default function SharedScore() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shared = getSharedScore(shareToken);
  const { score, sharedBy, canPractice, canDownload } = shared;

  return (
    <ExternalShell sharedBy={sharedBy}>
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-medium leading-tight">{score.title}</h1>
          <p className="text-muted-foreground">{score.composer} · {score.instrument}</p>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-4">
          <div className="aspect-[16/10]">
            <ScorePreview id={score.id} className="h-full w-full" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <span>Page 1 of {score.pages}</span>
            <div className="flex items-center gap-2">
              <button className="rounded border border-border px-2 py-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
              <button className="rounded border border-border px-2 py-1 hover:bg-accent"><Play className="h-4 w-4" /></button>
              <button className="rounded border border-border px-2 py-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canPractice && (
            <Button onClick={() => navigate(`/score/${score.id}/practice`)} className="bg-primary text-primary-foreground">
              <Play className="mr-1.5 h-4 w-4" /> Practice
            </Button>
          )}
          {canDownload && (
            <Button variant="outline">
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
          )}
          {isAuthenticated ? (
            <Button variant="outline">
              <Bookmark className="mr-1.5 h-4 w-4" /> Save to Library
            </Button>
          ) : (
            <p className="self-center text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link> to save and practice.
            </p>
          )}
        </div>
      </div>
    </ExternalShell>
  );
}