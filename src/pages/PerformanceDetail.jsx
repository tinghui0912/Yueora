import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, MoreHorizontal, Trash2, Wand2 } from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import { signedUrlFor, slugify, downloadBlob } from '@/lib/media';
import { fmtClock, visibilityLabel } from '@/lib/practiceUtils';
import SyncPlayback from '@/components/performances/SyncPlayback';
import PerformanceComments from '@/components/performances/PerformanceComments';
import PerformanceSharing from '@/components/performances/PerformanceSharing';
import ShareVideoDialog from '@/components/performances/ShareVideoDialog';
import SectionHeader from '@/components/patterns/SectionHeader';
import StateMessage from '@/components/patterns/StateMessage';
import AppPage from '@/components/patterns/AppPage';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const fullDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? 'Unknown date'
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function PerformanceDetail() {
  const { performanceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const performance = usePrototypeStore((s) => s.savedPerformances.find((p) => p.id === performanceId));
  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === performance?.scoreId));
  const members = usePrototypeStore((s) => s.teamMembers) || [];
  const updateSharing = usePrototypeStore((s) => s.updatePerformanceSharing);
  const deletePerformance = usePrototypeStore((s) => s.deletePerformance);

  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canView = !!performance
    && (performance.ownerId === 'you' || (performance.sharedWith || []).includes('you'));
  const isOwner = performance?.ownerId === 'you';

  const resolve = useCallback(async () => {
    if (!performance?.fileUri) {
      setLoading(false);
      setError('No recording file is stored for this performance.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = await signedUrlFor(performance.fileUri);
      if (!url) throw new Error('The recording could not be opened right now.');
      setSrc(url);
    } catch (err) {
      setError(err?.message || 'The recording could not be opened.');
    } finally {
      setLoading(false);
    }
  }, [performance?.fileUri]);

  useEffect(() => { resolve(); }, [resolve]);

  if (!performance) {
    return (
      <AppPage size="form">
        <div className="py-12">
          <StateMessage
            tone="neutral"
            title="This performance is not here"
            description="It may have been deleted, or the link belongs to something else."
            primaryAction={<Button asChild><Link to="/performances">Back to Performances</Link></Button>}
          />
        </div>
      </AppPage>
    );
  }

  if (!canView) {
    return (
      <AppPage size="form">
        <div className="py-12">
          <StateMessage
            tone="neutral"
            title="You do not have access to this performance"
            description="The owner has not shared this recording with you, or access was revoked."
            primaryAction={<Button asChild><Link to="/performances">Back to Performances</Link></Button>}
          />
        </div>
      </AppPage>
    );
  }

  const ownerName = isOwner ? 'You' : (members.find((m) => m.id === performance.ownerId) || {}).name || 'Someone';
  const scoreVisible = !!score && score.ownership !== 'trash' && getPermissions(score).canView !== false;

  const download = async () => {
    try {
      const url = src || await signedUrlFor(performance.fileUri);
      if (!url) throw new Error('The recording could not be downloaded.');
      const response = await fetch(url);
      if (!response.ok) throw new Error('The recording could not be downloaded.');
      downloadBlob(await response.blob(), `${slugify(performance.scoreTitleSnapshot)}-${performance.mediaType === 'video' ? 'performance' : 'recording'}.webm`);
    } catch (err) {
      toast({ title: 'Download unavailable', description: err?.message || 'The recording could not be downloaded.' });
    }
  };

  return (
    <AppPage size="wide">
      <Link to="/performances" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> Performances
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="type-page-title text-ink-primary">{performance.scoreTitleSnapshot}</h1>
          <p className="mt-1 type-body-small text-ink-secondary">
            {performance.composer || 'Composer unknown'} · {fullDate(performance.createdAt)} · {fmtClock(performance.durationSeconds)}
          </p>
          <p className="mt-1 type-metadata text-ink-tertiary">
            {performance.mediaType === 'video' ? 'Video recording' : 'Audio recording'} · {ownerName} · {visibilityLabel(performance)}
          </p>
          {scoreVisible && (
            <Link to={`/score/${score.id}`} className="mt-2 inline-flex type-body-small font-medium text-brand hover:underline">
              Open the score
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setVideoOpen(true)}>
            <Wand2 className="mr-1.5 h-4 w-4" /> Make share video
          </Button>
          <Button variant="outline" onClick={download}>
            <Download className="mr-1.5 h-4 w-4" /> Download recording
          </Button>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-control border border-line-subtle p-2.5 text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary transition-colors" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete performance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Deleting keeps your practice history</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Recording, with the score on the same timeline */}
      <section className="mt-6">
        <SyncPlayback
          src={src}
          mediaType={performance.mediaType}
          scoreId={performance.scoreId}
          scoreTitle={performance.scoreTitleSnapshot}
          loading={loading}
          error={error}
          onRetry={resolve}
          startMeasure={performance.startMeasure || 1}
          endMeasure={performance.endMeasure}
          durationSeconds={performance.durationSeconds}
          timeline={performance.positionTimeline}
        />
      </section>

      {/* What was recorded */}
      <section className="mt-8">
        <SectionHeader title="About this recording" />
        <dl className="mt-3 grid grid-cols-2 gap-y-2 type-body-small sm:grid-cols-3 sm:gap-x-6">
          <div><dt className="text-ink-tertiary">Recorded</dt><dd className="text-ink-primary">{fullDate(performance.createdAt)}</dd></div>
          <div><dt className="text-ink-tertiary">Length</dt><dd className="text-ink-primary">{fmtClock(performance.durationSeconds)}</dd></div>
          <div><dt className="text-ink-tertiary">Section</dt><dd className="text-ink-primary">{performance.rangeSummary || 'Full score'}</dd></div>
          <div><dt className="text-ink-tertiary">Tempo</dt><dd className="text-ink-primary">{performance.tempoBpm ? `${performance.tempoBpm} BPM` : 'Not set'}</dd></div>
          <div><dt className="text-ink-tertiary">Format</dt><dd className="text-ink-primary">{performance.mediaType === 'video' ? 'Video' : 'Audio'}</dd></div>
          <div><dt className="text-ink-tertiary">Comments</dt><dd className="text-ink-primary">{performance.allowComments === false ? 'Off' : 'On'}</dd></div>
        </dl>
      </section>

      {isOwner ? (
        <div className="mt-8 border-t border-line-subtle pt-6">
          <PerformanceSharing
            performance={performance}
            members={members}
            onSave={(patch) => {
              updateSharing(performance.id, patch);
              toast({ title: 'Access updated' });
            }}
          />
        </div>
      ) : (
        <div className="mt-8 border-t border-line-subtle pt-6">
          <SectionHeader title="Access" />
          <p className="mt-2 type-body-small text-ink-secondary">
            This performance was shared with you by {ownerName}. Your access to the score is separate and unchanged.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-line-subtle pt-6">
        <PerformanceComments performance={performance} />
      </div>

      <ShareVideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        title={performance.scoreTitleSnapshot}
        composer={performance.composer}
        rangeSummary={performance.rangeSummary}
        scoreId={performance.scoreId}
        startMeasure={performance.startMeasure || 1}
        endMeasure={performance.endMeasure}
        timeline={performance.positionTimeline}
        durationSeconds={performance.durationSeconds}
        mediaType={performance.mediaType}
        mediaUrl={src}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete this performance?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary">
            {performance.scoreTitleSnapshot} — the recording is removed from Performances. Your practice history stays.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { deletePerformance(performance.id); setConfirmDelete(false); navigate('/performances'); }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}