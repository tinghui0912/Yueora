import { Link, useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Bookmark, ChevronLeft, ChevronRight, Flag, Clock, Ban, FileX, ShieldOff, Check, Lock, Pencil } from 'lucide-react';
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
import StateMessage from '@/components/patterns/StateMessage';

export default function SharedScore() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const saveSharedScoreToLibrary = usePrototypeStore((s) => s.saveSharedScoreToLibrary);
  const getShareByToken = usePrototypeStore((s) => s.getShareByToken);

  // Resolve sharing by token only — no scoreId fallback
  const shareResult = getShareByToken(shareToken);
  let status = 'valid';
  let score = null;
  let sharing = null;
  if (shareResult) {
    if (shareResult.revoked) {
      status = 'revoked';
    } else {
      score = shareResult.score;
      sharing = shareResult.sharing;
      if (!sharing.link.enabled) status = 'revoked';
      else if (sharing.link.expiresAt && new Date(sharing.link.expiresAt) < new Date()) status = 'expired';
      else if (!score) status = 'removed';
    }
  } else {
    status = 'invalid';
  }

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  if (status !== 'valid') {
    const states = {
      expired: { tone: 'warning', icon: Clock, title: 'This link has expired', body: 'The owner set an expiration on this link. Ask them to share it again.' },
      revoked: { tone: 'warning', icon: Ban, title: 'This link was revoked', body: 'The owner turned off sharing for this score.' },
      invalid: { tone: 'neutral', icon: FileX, title: 'This link is not valid', body: 'Check that you have the right link, or ask the owner to send it again.' },
      removed: { tone: 'neutral', icon: ShieldOff, title: 'This score is no longer available', body: 'The owner removed this score from Yueora.' },
    };
    const s = states[status] || states.invalid;
    return (
      <ExternalShell>
        <StateMessage tone={s.tone} icon={s.icon} title={s.title} description={s.body} />
      </ExternalShell>
    );
  }

  const canPractice = sharing?.link?.practice ?? false;
  const canDownload = sharing?.link?.download ?? false;
  const canEdit = sharing?.link?.access === 'Can edit';

  const handleSave = () => {
    saveSharedScoreToLibrary(score.id, {
      shareToken,
      canPractice,
      canDownload,
    });
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
            <h1 className="type-page-title text-ink-primary leading-tight">{score.title}</h1>
            <p className="type-body-small text-ink-secondary mt-1">{score.composer} · {score.instrument}</p>
          </div>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 rounded-control border border-line-subtle bg-surface-panel px-3 py-1.5 type-body-small text-ink-secondary hover:bg-surface-paper hover:text-ink-primary shadow-xs transition-colors"
          >
            <Flag className="icon-sm" aria-hidden="true" /> Report
          </button>
        </div>

        <div className="mt-6 rounded-container border border-line-subtle bg-surface-panel p-4">
          <div className="aspect-[16/10]"><ScorePreview id={score.id} className="h-full w-full" /></div>
          <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3 type-body-small text-ink-secondary">
            <span>Page {page} of {score.pages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-control-sm w-control-sm items-center justify-center rounded-control border border-line-subtle bg-surface-panel text-ink-secondary hover:bg-surface-paper hover:text-ink-primary transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="icon-sm" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex h-control-sm w-control-sm items-center justify-center rounded-control border border-line-subtle bg-surface-panel text-ink-secondary hover:bg-surface-paper hover:text-ink-primary transition-colors"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="icon-sm" aria-hidden="true" /> : <Play className="icon-sm" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(score.pages, p + 1))}
                className="flex h-control-sm w-control-sm items-center justify-center rounded-control border border-line-subtle bg-surface-panel text-ink-secondary hover:bg-surface-paper hover:text-ink-primary transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="icon-sm" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canPractice ? (
            isAuthenticated ? (
              <Button intent="primary" onClick={() => navigate(`/score/${score.id}/setup`)}>
                <Play className="mr-1.5 icon-sm" aria-hidden="true" /> Practice
              </Button>
            ) : (
              <Button intent="primary" onClick={() => navigate(`/login?returnTo=/s/${shareToken}`)}>
                <Play className="mr-1.5 icon-sm" aria-hidden="true" /> Sign in to practice
              </Button>
            )
          ) : (
            <Button intent="subtle" disabled>
              <Lock className="mr-1.5 icon-sm" aria-hidden="true" /> Practice unavailable
            </Button>
          )}
          {isAuthenticated ? (
            score.ownership === 'mine' ? (
              <Button intent="secondary" disabled>
                <Check className="mr-1.5 icon-sm" aria-hidden="true" /> In your library
              </Button>
            ) : saved || score.ownership === 'saved' ? (
              <Button intent="secondary" disabled>
                <Check className="mr-1.5 icon-sm" aria-hidden="true" /> Saved to library
              </Button>
            ) : (
              <Button intent="secondary" onClick={handleSave}>
                <Bookmark className="mr-1.5 icon-sm" aria-hidden="true" /> Save to library
              </Button>
            )
          ) : (
            <p className="self-center type-body-small text-ink-secondary">
              <Link to={`/login?returnTo=/s/${shareToken}`} className="font-medium text-brand hover:underline">Log in</Link> to save this to your library.
            </p>
          )}
          {canEdit && isAuthenticated && (
            <Button intent="secondary" onClick={() => navigate(`/score/${score.id}/edit`)}>
              <Pencil className="mr-1.5 icon-sm" aria-hidden="true" /> Edit
            </Button>
          )}
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="type-section-title text-ink-primary">Report this score</DialogTitle></DialogHeader>
          {reportSubmitted ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Check className="icon-xl text-brand" aria-hidden="true" />
              <p className="type-subsection text-ink-primary font-medium">Report received</p>
              <p className="type-body-small text-ink-secondary">Thank you. We will review this and take action if needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="type-label text-ink-primary font-medium">Reason</p>
                <div className="mt-2 space-y-1">
                  {['Copyright infringement', 'Inappropriate content', 'Privacy concern', 'Other'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReportReason(r)}
                      className={`flex w-full items-center rounded-control border px-3 py-2 text-left type-body-small transition-colors ${
                        reportReason === r
                          ? 'border-brand bg-brand-soft text-brand-soft-foreground font-semibold'
                          : 'border-surface-paper-edge bg-surface-panel hover:bg-surface-paper text-ink-primary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="type-label text-ink-primary font-medium">Details (optional)</p>
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Add any additional context…"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>
          )}
          {!reportSubmitted && (
            <DialogFooter>
              <Button intent="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button intent="primary" onClick={submitReport} disabled={!reportReason}>Submit report</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </ExternalShell>
  );
}