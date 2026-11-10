import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pencil, Share2, MoreHorizontal, Star, ChevronLeft,
  ChevronRight, ZoomIn, ZoomOut, Trash2, FolderInput, History,
  LogOut, BookmarkMinus, Lock, Headphones,
} from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import ScorePreview from '@/components/library/ScorePreview';
import ListenControl from '@/components/score/ListenControl';
import SharingDialog from '@/components/sharing/SharingDialog';
import { Surface } from '@/components/patterns/Surface';
import JourneyTimeline from '@/components/patterns/JourneyTimeline';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { dayLabel, minutesLabel } from '@/lib/practiceUtils';
import StateMessage from '@/components/patterns/StateMessage';
import AppPage from '@/components/patterns/AppPage';
import BackLink from '@/components/patterns/BackLink';

export default function ScoreDetail() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const practiceActivities = usePrototypeStore((s) => s.practiceActivities) || [];
  const savedPerformances = usePrototypeStore((s) => s.savedPerformances) || [];
  const toggleFavorite = usePrototypeStore((s) => s.toggleScoreFavorite);
  const moveToTrash = usePrototypeStore((s) => s.moveOwnedScoreToTrash);
  const leaveShared = usePrototypeStore((s) => s.leaveSharedScore);
  const removeSaved = usePrototypeStore((s) => s.removeSavedScore);
  const moveToFolder = usePrototypeStore((s) => s.moveScoreToFolder);
  const folders = usePrototypeStore((s) => s.folders);
  const restoreVersion = usePrototypeStore((s) => s.restoreVersion);

  const [shareOpen, setShareOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [moveFolderOpen, setMoveFolderOpen] = useState(false);

  if (!score) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <StateMessage
          tone="neutral"
          title="Score not found"
          description="This score may have been removed or the link is incorrect."
          primaryAction={<Button onClick={() => navigate('/library')}>Back to Repertoire</Button>}
        />
      </div>
    );
  }

  const perms = getPermissions(score);
  const sessions = practiceActivities.filter((a) => a.scoreId === score.id && a.ownerId === 'you');
  const scorePerformances = savedPerformances.filter((p) => p.scoreId === score.id && p.ownerId === 'you');

  const handleFavorite = () => {
    toggleFavorite(score.id);
  };

  const confirmTrash = () => { moveToTrash(score.id); setConfirmDelete(false); navigate('/library'); };
  const confirmLeaveFn = () => { leaveShared(score.id); setConfirmLeave(false); navigate('/library'); };
  const confirmRemoveFn = () => { removeSaved(score.id); setConfirmRemove(false); navigate('/library'); };

  return (
    <AppPage size="wide" className="py-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <BackLink to="/library" label="Back to Repertoire" />

        {score.favorite && (
          <span className="flex items-center gap-1 text-sm font-medium text-gold">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span>Favorited piece</span>
          </span>
        )}
      </div>

      {/* Piece Header / Hero */}
      <div className="mt-5 flex flex-col gap-5 border-b border-line-subtle pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="type-page-title text-ink-primary leading-tight">
              {score.title}
            </h1>
            <button
              onClick={handleFavorite}
              className="text-ink-tertiary hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded p-0.5"
              aria-label={score.favorite ? 'Remove favorite' : 'Add to favorites'}
            >
              {score.favorite ? (
                <Star className="h-5 w-5 fill-gold text-gold" />
              ) : (
                <Star className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-sm text-ink-secondary font-medium">{score.composer} · {score.instrument}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 type-metadata text-ink-secondary/80">
            <span className="rounded-control bg-neutral-muted px-2 py-0.5 border border-line-subtle font-medium">
              {score.source}
            </span>
            <span>·</span>
            <span>Key of {score.key || 'C'}</span>
            <span>·</span>
            <span>♩ = {score.tempo || 80}</span>
            <span>·</span>
            {score.ownership === 'mine' && <span className="text-brand font-medium">Mine</span>}
            {score.ownership === 'shared' && <span>Shared by {score.sharedBy}</span>}
            {score.ownership === 'saved' && <span>Saved piece</span>}
          </div>
        </div>

        {/* Action transport */}
        <div className="flex flex-wrap items-center gap-2">
          {perms.canPractice ? (
            <Button intent="primary" size="md" asChild>
              <Link to={`/score/${score.id}/setup`}>
                <Play className="icon-sm fill-current" />
                <span>{score.lastMeasure > 1 ? `Continue from bar ${score.lastMeasure}` : 'Start Practice'}</span>
              </Link>
            </Button>
          ) : (
            <span className="flex h-control-md items-center gap-2 rounded-control bg-neutral-muted border border-line-subtle px-4 type-body-small font-semibold text-ink-secondary/70">
              <Lock className="icon-sm" /> Practice unavailable
            </span>
          )}

          {score.source !== 'Photo' && (
            <Button intent="secondary" size="md" asChild>
              <a href="#listen">
                <Headphones className="icon-sm text-ink-secondary" />
                <span>Listen</span>
              </a>
            </Button>
          )}

          {perms.canEdit && (
            <Button intent="secondary" size="md" asChild>
              <Link to={`/score/${score.id}/edit`}>
                <Pencil className="icon-sm text-ink-secondary" />
                <span>Studio Edit</span>
              </Link>
            </Button>
          )}

          {perms.canShare && (
            <Button
              intent="secondary"
              size="md"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="icon-sm text-ink-secondary" />
              <span>Share</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={MoreHorizontal}
                size="md"
                tone="outline"
                label="More score options"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-line-subtle bg-surface-panel shadow-overlay">
              <DropdownMenuItem onClick={handleFavorite} className="text-xs">
                <Star className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> {score.favorite ? 'Remove favorite' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMoveFolderOpen(true)} className="text-xs">
                <FolderInput className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Move to folder
              </DropdownMenuItem>
              {score.ownership === 'mine' && (
                <DropdownMenuItem onClick={() => setVersionsOpen(true)} className="text-xs">
                  <History className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Version history
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-line-subtle" />
              {score.ownership === 'mine' && (
                <DropdownMenuItem className="text-destructive text-xs" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to trash
                </DropdownMenuItem>
              )}
              {score.ownership === 'shared' && (
                <DropdownMenuItem className="text-destructive text-xs" onClick={() => setConfirmLeave(true)}>
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Leave shared score
                </DropdownMenuItem>
              )}
              {score.ownership === 'saved' && (
                <DropdownMenuItem className="text-destructive text-xs" onClick={() => setConfirmRemove(true)}>
                  <BookmarkMinus className="mr-2 h-3.5 w-3.5" /> Remove from library
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main layout: Score Folio Surface + Journey Hub */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Archival Score Reader Surface */}
        <div className="lg:col-span-8 space-y-6">
          <Surface tone="panel" className="p-4 sm:p-6">
            {/* Score folio viewer */}
            <div className="flex justify-center overflow-auto rounded bg-surface-canvas/60 p-4">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                className="aspect-[16/10] w-full max-w-2xl transition-transform duration-fast"
              >
                <ScorePreview id={score.id} className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Pagination & Zoom Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3 text-xs text-ink-secondary">
              <span>Page {page} of {score.pages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
                  className="rounded-control border border-line-subtle p-1.5 hover:bg-neutral-hover"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
                  className="rounded-control border border-line-subtle p-1.5 hover:bg-neutral-hover"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="mx-1 h-4 w-px bg-line-subtle" />
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-control border border-line-subtle p-1.5 hover:bg-neutral-hover disabled:opacity-40"
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(score.pages, p + 1))}
                  className="rounded-control border border-line-subtle p-1.5 hover:bg-neutral-hover disabled:opacity-40"
                  disabled={page >= score.pages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded audio playback */}
            <div id="listen" className="mt-4 border-t border-line-subtle pt-4">
              <ListenControl score={score} />
            </div>
          </Surface>
        </div>

        {/* Right Column: Journey Hub & Musical Relationship */}
        <div className="lg:col-span-4 space-y-6">
          {/* Journey of this Piece */}
          <div className="rounded-container border border-line-subtle bg-surface-panel p-5">
            <h2 className="type-subsection text-ink-primary">
              The Journey of this Piece
            </h2>
            <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
              Every piece of music has an organic life in Yueora.
            </p>

            <div className="mt-5">
              <JourneyTimeline
                score={score}
                sessions={sessions}
                performances={scorePerformances}
              />
            </div>
          </div>

          {/* Recent practice & preserved moments */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">
              Recent Playing & Takes
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-ink-secondary/70">
                No practice recorded yet. When you play, your sessions will quietly appear here.
              </p>
            ) : (
              <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
                {sessions.slice(0, 4).map((a) => {
                  const saved = scorePerformances.find((p) => p.activityId === a.id);
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-primary">
                          {dayLabel(a.completedAt)} · {minutesLabel(a.durationSeconds)}
                        </p>
                        <p className="text-xs text-ink-secondary/70 mt-0.5">
                          {a.rangeSummary}
                          {saved ? ` · ${saved.mediaType === 'video' ? 'Video preserved' : 'Audio preserved'}` : ''}
                        </p>
                      </div>
                      {saved && (
                        <Link
                          to={`/performances/${saved.id}`}
                          className="flex shrink-0 items-center gap-1 rounded-control border border-line-subtle bg-surface-panel px-2.5 py-1 text-xs font-medium text-brand hover:bg-neutral-hover"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Play take</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <SharingDialog score={score} open={shareOpen} onOpenChange={setShareOpen} />

      {/* Move to folder dialog */}
      <Dialog open={moveFolderOpen} onOpenChange={setMoveFolderOpen}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Move to folder</DialogTitle></DialogHeader>
          <div className="space-y-1 mt-2">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => { moveToFolder(score.id, f.id); setMoveFolderOpen(false); toast({ title: 'Moved', description: `${score.title} moved to ${f.name}.` }); }}
                className="flex w-full items-center gap-2 rounded-control border border-line-subtle px-3 py-2 text-left text-sm hover:bg-neutral-hover"
              >
                <FolderInput className="h-4 w-4 text-ink-secondary" />
                <span className="font-medium text-ink-primary">{f.name}</span>
              </button>
            ))}
            {folders.length === 0 && <p className="py-4 text-center text-xs text-ink-tertiary">No folders yet.</p>}
          </div>
          <DialogFooter><Button intent="secondary" size="sm" onClick={() => setMoveFolderOpen(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions dialog */}
      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent className="max-w-md border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Version history</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {(() => {
              const versions = [
                { label: 'Current version', date: 'Sep 8, 2026', isCurrent: true },
                { label: 'After recognition review', date: 'Aug 12, 2026' },
                { label: 'First import', date: 'Aug 12, 2026' },
              ];
              const restoredLabel = score.versionRestoredAt ? score.currentVersion : null;
              return versions.map((v) => {
                const isCurrent = v.isCurrent && !restoredLabel;
                const isRestored = restoredLabel === v.label;
                return (
                  <div key={v.label} className={`flex items-center justify-between rounded-control border px-3 py-2 text-xs transition-colors ${isCurrent || isRestored ? 'border-brand bg-neutral-hover' : 'border-line-subtle'}`}>
                    <div>
                      <p className="font-medium text-ink-primary">{v.label}{isRestored ? ' · Restored' : ''}</p>
                      <p className="text-xs text-ink-secondary/70">{isRestored ? `Restored ${score.versionRestoredAt}` : v.date}</p>
                    </div>
                    {isCurrent || isRestored ? (
                      <span className="text-xs font-semibold text-brand">{isRestored ? 'Restored' : 'Current'}</span>
                    ) : (
                      <Button intent="secondary" size="sm" onClick={() => { restoreVersion(score.id, v.label); toast({ title: 'Version restored', description: `Restored to ${v.label}.` }); setVersionsOpen(false); }}>Restore</Button>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          <DialogFooter><Button intent="secondary" size="sm" onClick={() => setVersionsOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Move to trash?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">{score.title} will move to Trash for 30 days before permanent deletion.</p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={confirmTrash}>Move to trash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirm */}
      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Leave shared score?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">You will lose access to {score.title}.</p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setConfirmLeave(false)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={confirmLeaveFn}>Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove saved confirm */}
      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Remove from library?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">{score.title} will be removed from your repertoire.</p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={confirmRemoveFn}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
