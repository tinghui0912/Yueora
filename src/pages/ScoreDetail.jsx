import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pencil, Share2, MoreHorizontal, Star, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Copy, Trash2, FolderInput, History, LogOut, BookmarkMinus, Check } from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import ScorePreview from '@/components/library/ScorePreview';
import SharingDialog from '@/components/sharing/SharingDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import SectionHeader from '@/components/patterns/SectionHeader';
import StateMessage from '@/components/patterns/StateMessage';

export default function ScoreDetail() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const practiceSessions = usePrototypeStore((s) => s.practiceSessions);
  const toggleFavorite = usePrototypeStore((s) => s.toggleScoreFavorite);
  const moveToTrash = usePrototypeStore((s) => s.moveOwnedScoreToTrash);
  const leaveShared = usePrototypeStore((s) => s.leaveSharedScore);
  const removeSaved = usePrototypeStore((s) => s.removeSavedScore);
  const duplicate = usePrototypeStore((s) => s.duplicateScore);
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
  const [exporting, setExporting] = useState(false);

  if (!score) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <StateMessage
          tone="neutral"
          title="Score not found"
          description="This score may have been removed or the link is wrong."
          primaryAction={<Button onClick={() => navigate('/library')}>Back to library</Button>}
        />
      </div>
    );
  }

  const perms = getPermissions(score);
  const sessions = practiceSessions.filter((s) => s.scoreId === score.id);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast({ title: 'Export ready', description: `${score.title} has been exported as PDF.` });
    }, 1500);
  };

  const handleDuplicate = () => {
    duplicate(score.id);
    toast({ title: 'Score duplicated', description: `${score.title} (copy) added to your library.` });
  };

  const handleFavorite = () => {
    toggleFavorite(score.id);
  };

  const confirmTrash = () => { moveToTrash(score.id); setConfirmDelete(false); navigate('/library'); };
  const confirmLeaveFn = () => { leaveShared(score.id); setConfirmLeave(false); navigate('/library'); };
  const confirmRemoveFn = () => { removeSaved(score.id); setConfirmRemove(false); navigate('/library'); };

  return (
    <div className="px-4 py-6 md:px-8">
      <Link to="/library" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-medium leading-tight">{score.title}</h1>
            <button onClick={handleFavorite} className="text-muted-foreground hover:text-foreground" aria-label="Favorite">
              {score.favorite ? <Star className="h-5 w-5 fill-gold text-gold" /> : <Star className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1 text-muted-foreground">{score.composer}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {score.ownership === 'mine' && <Badge variant="neutral">Mine</Badge>}
            {score.ownership === 'shared' && <Badge variant="neutral">Shared by {score.sharedBy} · {score.permission}</Badge>}
            {score.ownership === 'saved' && <Badge variant="neutral">Saved</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/score/${score.id}/practice`} className="flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" /> {score.lastMeasure > 1 ? 'Continue playing' : 'Practice'}
          </Link>
          {perms.canEdit && (
            <Link to={`/score/${score.id}/edit`} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
          {perms.canShare && (
            <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
              <Share2 className="h-4 w-4" /> Share
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-control border border-line-subtle p-2.5 text-ink-secondary hover:bg-accent" aria-label="More"><MoreHorizontal className="h-4 w-4" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleFavorite}><Star className="mr-2 h-4 w-4" /> {score.favorite ? 'Remove favorite' : 'Add to favorites'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMoveFolderOpen(true)}><FolderInput className="mr-2 h-4 w-4" /> Move to folder</DropdownMenuItem>
              {score.ownership === 'mine' && <DropdownMenuItem onClick={() => setVersionsOpen(true)}><History className="mr-2 h-4 w-4" /> Version history</DropdownMenuItem>}
              {score.ownership === 'mine' && <DropdownMenuItem onClick={handleDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>}
              {perms.canDownload && <DropdownMenuItem onClick={handleExport}><Download className="mr-2 h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}</DropdownMenuItem>}
              <DropdownMenuSeparator />
              {score.ownership === 'mine' && <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="mr-2 h-4 w-4" /> Move to trash</DropdownMenuItem>}
              {score.ownership === 'shared' && <DropdownMenuItem className="text-destructive" onClick={() => setConfirmLeave(true)}><LogOut className="mr-2 h-4 w-4" /> Leave shared score</DropdownMenuItem>}
              {score.ownership === 'saved' && <DropdownMenuItem className="text-destructive" onClick={() => setConfirmRemove(true)}><BookmarkMinus className="mr-2 h-4 w-4" /> Remove from library</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Score viewer */}
        <div className="lg:col-span-2 rounded-container border border-line-subtle bg-surface-panel p-4">
          <div className="flex justify-center overflow-auto bg-background p-2">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="aspect-[16/10] w-full max-w-2xl">
              <ScorePreview id={score.id} className="h-full w-full" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3 type-body-small text-ink-secondary">
            <span>Page {page} of {score.pages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="rounded-control border border-line-subtle p-1.5 hover:bg-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="rounded-control border border-line-subtle p-1.5 hover:bg-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-control border border-line-subtle p-1.5 hover:bg-accent" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage((p) => Math.min(score.pages, p + 1))} className="rounded-control border border-line-subtle p-1.5 hover:bg-accent" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Practice — primary surface */}
          <div className="rounded-container border border-line-subtle bg-surface-panel p-5">
            <p className="type-caption text-ink-tertiary">Practice</p>
            <p className="mt-3 type-body-small text-ink-primary">
              {score.lastPlayed === 'never' || !score.lastPlayed ? 'You haven’t played this one yet.' : `Last played ${score.lastPlayed}.`}
            </p>
            {score.lastMeasure > 1 && <p className="mt-1 type-body-small text-brand">Continue from measure {score.lastMeasure}</p>}
            {score.difficultSections.length > 0 && (
              <p className="mt-1 type-body-small text-ink-secondary">{score.difficultSections[0].note}</p>
            )}
            <Link to={`/score/${score.id}/practice`} className="mt-4 block rounded-control bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90">
              Continue playing
            </Link>
          </div>

          {/* Information — flat section */}
          <div className="border-t border-line-subtle pt-5">
            <SectionHeader title="Information" />
            <dl className="mt-3 space-y-2 type-body-small">
              <div className="flex justify-between"><dt className="text-ink-secondary">Composer</dt><dd className="text-ink-primary">{score.composer}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Instrument</dt><dd className="text-ink-primary">{score.instrument}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-secondary">Tags</dt><dd className="flex flex-wrap justify-end gap-1">{score.tags.map((t) => <span key={t} className="rounded-control bg-muted px-1.5 py-0.5 type-metadata text-ink-secondary">{t}</span>)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Source</dt><dd className="text-ink-primary">{score.source}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Added</dt><dd className="text-ink-primary">{score.created}</dd></div>
            </dl>
          </div>

          {/* Recent practice — flat section */}
          <div className="border-t border-line-subtle pt-5">
            <SectionHeader title="Recent practice" />
            {sessions.length === 0 ? (
              <p className="mt-3 type-body-small text-ink-tertiary">No sessions yet. When you practice, they’ll show up here.</p>
            ) : (
              <div className="mt-3 divide-y divide-line-subtle">
                {sessions.slice(0, 5).map((s) => (
                  <Link key={s.id} to={`/practice/${s.id}/summary`} className="flex items-center justify-between py-2.5 hover:bg-accent/40">
                    <div>
                      <p className="type-body-small font-medium text-ink-primary">{s.date} · {s.duration}</p>
                      <p className="type-metadata text-ink-tertiary">{s.range}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-tertiary" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SharingDialog score={score} open={shareOpen} onOpenChange={setShareOpen} />

      {/* Move to folder dialog */}
      <Dialog open={moveFolderOpen} onOpenChange={setMoveFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Move to folder</DialogTitle></DialogHeader>
          <div className="space-y-1">
            {folders.map((f) => (
              <button key={f.id} onClick={() => { moveToFolder(score.id, f.id); setMoveFolderOpen(false); toast({ title: 'Moved', description: `${score.title} moved to ${f.name}.` }); }} className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent">
                <FolderInput className="h-4 w-4 text-muted-foreground" /> {f.name}
              </button>
            ))}
            {folders.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No folders yet.</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMoveFolderOpen(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions dialog */}
      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Version history</DialogTitle></DialogHeader>
          <div className="space-y-2">
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
                  <div key={v.label} className={`flex items-center justify-between rounded-md border px-3 py-2 ${isCurrent || isRestored ? 'border-primary/40 bg-accent/40' : 'border-border'}`}>
                    <div>
                      <p className="text-sm font-medium">{v.label}{isRestored ? ' · Restored' : ''}</p>
                      <p className="text-xs text-muted-foreground">{isRestored ? `Restored ${score.versionRestoredAt}` : v.date}</p>
                    </div>
                    {isCurrent || isRestored ? (
                      <span className="text-xs font-medium text-primary">{isRestored ? 'Restored' : 'Current'}</span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { restoreVersion(score.id, v.label); toast({ title: 'Version restored', description: `Restored to ${v.label}.` }); setVersionsOpen(false); }}>Restore</Button>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setVersionsOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Move to trash?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{score.title} will move to Trash. You can restore it for 30 days, then it’s deleted for good.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmTrash}>Move to trash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirm */}
      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Leave shared score?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">You’ll lose access to {score.title}. You can ask {score.sharedBy} to share it again if you change your mind.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmLeaveFn}>Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove saved confirm */}
      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove from library?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{score.title} will be removed from your library. The original shared link will still work.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemoveFn}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}