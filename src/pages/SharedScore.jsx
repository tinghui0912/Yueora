import { Link, useParams, useNavigate } from 'react-router-dom';
import { Play, Download, Bookmark, ChevronLeft, ChevronRight, Flag, Clock, Ban, FileX, ShieldOff } from 'lucide-react';
import { getSharedScore } from '@/lib/mockData';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import ScorePreview from '@/components/library/ScorePreview';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function SharedScore() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shared = getSharedScore(shareToken);
  const { score, sharedBy, canPractice, canDownload, status } = shared;
  const [reportOpen, setReportOpen] = useState(false);

  if (status !== 'valid') {
    const states = {
      expired: { icon: Clock, title: 'This link has expired', body: 'The owner set an expiration on this link. Ask them to share it again.' },
      revoked: { icon: Ban, title: 'This link was revoked', body: 'The owner turned off sharing for this score.' },
      invalid: { icon: FileX, title: 'This link isn’t valid', body: 'Check that you have the right link, or ask the owner to send it again.' },
      removed: { icon: ShieldOff, title: 'This score is no longer available', body: 'The owner removed this score from Yueora.' },
    };
    const s = states[status] || states.invalid;
    return (
      <ExternalShell>
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
          <s.icon className="h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-medium">{s.title}</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{s.body}</p>
        </div>
      </ExternalShell>
    );
  }

  return (
    <ExternalShell sharedBy={sharedBy}>
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium leading-tight">{score.title}</h1>
            <p className="text-muted-foreground">{score.composer} · {score.instrument}</p>
          </div>
          <button onClick={() => setReportOpen(true)} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent"><Flag className="h-4 w-4" /> Report</button>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-4">
          <div className="aspect-[16/10]"><ScorePreview id={score.id} className="h-full w-full" /></div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <span>Page 1 of {score.pages}</span>
            <div className="flex items-center gap-2">
              <button className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
              <button className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Play"><Play className="h-4 w-4" /></button>
              <button className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canPractice && (
            isAuthenticated ? (
              <Button onClick={() => navigate(`/score/${score.id}/practice`)} className="bg-primary text-primary-foreground"><Play className="mr-1.5 h-4 w-4" /> Practice</Button>
            ) : (
              <Button onClick={() => navigate(`/login?returnTo=/s/${shareToken}`)} className="bg-primary text-primary-foreground"><Play className="mr-1.5 h-4 w-4" /> Sign in to practice</Button>
            )
          )}
          {canDownload && <Button variant="outline"><Download className="mr-1.5 h-4 w-4" /> Download</Button>}
          {isAuthenticated ? (
            <Button variant="outline"><Bookmark className="mr-1.5 h-4 w-4" /> Save to library</Button>
          ) : (
            <p className="self-center text-sm text-muted-foreground"><Link to={`/login?returnTo=/s/${shareToken}`} className="font-medium text-primary hover:underline">Log in</Link> to save this to your library.</p>
          )}
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Report this score</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {['Copyright infringement', 'Inappropriate content', 'Privacy concern', 'Other'].map((r) => (
              <button key={r} className="flex w-full items-center rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent">{r}</button>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </ExternalShell>
  );
}