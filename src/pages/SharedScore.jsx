import { Link, useParams, useNavigate } from 'react-router-dom';
import { Play, Download, Bookmark, ChevronLeft, ChevronRight, Flag, Clock, Ban, FileX, ShieldOff, Check } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import ScorePreview from '@/components/library/ScorePreview';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function SharedScore() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const scores = usePrototypeStore((s) => s.scores);
  const saveSharedScoreToLibrary = usePrototypeStore((s) => s.saveSharedScoreToLibrary);

  // Determine status from token
  let status = 'valid';
  if (shareToken?.includes('expired')) status = 'expired';
  else if (shareToken?.includes('revoked')) status = 'revoked';
  else if (shareToken?.includes('invalid')) status = 'invalid';
  else if (shareToken?.includes('removed')) status = 'removed';

  const score = scores.find((s) => s.id === shareToken) || scores.find((s) => s.ownership === 'mine') || scores[0];
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    saveSharedScoreToLibrary(score.id);
    setSaved(true);
    toast({ title: 'Saved to library', description: `${score.title} is now in your library under Saved.` });
  };

  const submitReport = () => {
    setReportSubmitted(true);
    setTimeout(() => { setReportOpen(false); setReportSubmitted(false); setReportReason(''); setReportDetails(''); }, 2000);
  };

  return (
    <ExternalShell sharedBy="Alice">
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
            <span>Page {page} of {score.pages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPlaying((p) => !p)} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Play">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
              <button onClick={() => setPage((p) => Math.min(score.pages, p + 1))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {isAuthenticated ? (
            <Button onClick={() => navigate(`/score/${score.id}/practice`)} className="bg-primary text-primary-foreground"><Play className="mr-1.5 h-4 w-4" /> Practice</Button>
          ) : (
            <Button onClick={() => navigate(`/login?returnTo=/s/${shareToken}`)} className="bg-primary text-primary-foreground"><Play className="mr-1.5 h-4 w-4" /> Sign in to practice</Button>
          )}
          <Button variant="outline" onClick={() => toast({ title: 'Download started', description: `${score.title}.pdf` })}><Download className="mr-1.5 h-4 w-4" /> Download</Button>
          {isAuthenticated ? (
            saved ? (
              <Button variant="outline" disabled><Check className="mr-1.5 h-4 w-4" /> Saved to library</Button>
            ) : (
              <Button variant="outline" onClick={handleSave}><Bookmark className="mr-1.5 h-4 w-4" /> Save to library</Button>
            )
          ) : (
            <p className="self-center text-sm text-muted-foreground"><Link to={`/login?returnTo=/s/${shareToken}`} className="font-medium text-primary hover:underline">Log in</Link> to save this to your library.</p>
          )}
        </div>
      </div>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Report this score</DialogTitle></DialogHeader>
          {reportSubmitted ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Check className="h-8 w-8 text-primary" />
              <p className="font-medium">Report received</p>
              <p className="text-sm text-muted-foreground">Thank you. We’ll review this and take action if needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Reason</p>
                <div className="mt-2 space-y-1">
                  {['Copyright infringement', 'Inappropriate content', 'Privacy concern', 'Other'].map((r) => (
                    <button key={r} onClick={() => setReportReason(r)} className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-sm hover:bg-accent ${reportReason === r ? 'border-primary bg-accent/40 font-medium' : 'border-border'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Details (optional)</p>
                <Textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Add any additional context…" className="mt-1.5 min-h-[80px]" />
              </div>
            </div>
          )}
          {!reportSubmitted && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button onClick={submitReport} disabled={!reportReason}>Submit report</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </ExternalShell>
  );
}

function Pause({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );
}