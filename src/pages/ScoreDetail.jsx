import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Pencil, Share2, MoreHorizontal, Star, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Download, Copy, Trash2, FolderInput, History, LogOut, BookmarkMinus } from 'lucide-react';
import { getScore, practiceHistory } from '@/lib/mockData';
import ScorePreview from '@/components/library/ScorePreview';
import SharingDialog from '@/components/sharing/SharingDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function ScoreDetail() {
  const { scoreId } = useParams();
  const score = getScore(scoreId);
  const [shareOpen, setShareOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <h1 className="font-display text-2xl">Score not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This score may have been removed or the link is wrong.</p>
        <Link to="/library" className="mt-4 inline-block text-primary underline">Back to library</Link>
      </div>
    );
  }

  const sessions = practiceHistory.filter((s) => s.scoreId === score.id);

  return (
    <div className="px-4 py-6 md:px-8">
      <Link to="/library" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-medium leading-tight">{score.title}</h1>
            <button className="text-muted-foreground hover:text-foreground" aria-label="Favorite">
              {score.favorite ? <Star className="h-5 w-5 fill-gold text-gold" /> : <Star className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1 text-muted-foreground">{score.composer}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {score.ownership === 'mine' && <span className="rounded bg-accent px-2 py-0.5">Mine</span>}
            {score.ownership === 'shared' && <span className="rounded bg-accent px-2 py-0.5">Shared by {score.sharedBy} · {score.permission}</span>}
            {score.ownership === 'saved' && <span className="rounded bg-accent px-2 py-0.5">Saved</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/score/${score.id}/practice`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" /> {score.lastMeasure > 1 ? 'Continue playing' : 'Practice'}
          </Link>
          {score.ownership === 'mine' && (
            <Link to={`/score/${score.id}/edit`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
          {score.ownership === 'mine' && (
            <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
              <Share2 className="h-4 w-4" /> Share
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md border border-border p-2.5 text-muted-foreground hover:bg-accent" aria-label="More"><MoreHorizontal className="h-4 w-4" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem><Star className="mr-2 h-4 w-4" /> {score.favorite ? 'Remove favorite' : 'Add to favorites'}</DropdownMenuItem>
              <DropdownMenuItem><FolderInput className="mr-2 h-4 w-4" /> Move to folder</DropdownMenuItem>
              {score.ownership === 'mine' && <DropdownMenuItem onClick={() => setVersionsOpen(true)}><History className="mr-2 h-4 w-4" /> Version history</DropdownMenuItem>}
              {score.ownership === 'mine' && <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>}
              {score.ownership === 'mine' && <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Export</DropdownMenuItem>}
              <DropdownMenuSeparator />
              {score.ownership === 'mine' && <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="mr-2 h-4 w-4" /> Move to trash</DropdownMenuItem>}
              {score.ownership === 'shared' && <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Leave shared score</DropdownMenuItem>}
              {score.ownership === 'saved' && <DropdownMenuItem className="text-destructive"><BookmarkMinus className="mr-2 h-4 w-4" /> Remove from library</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Score viewer */}
        <div className="lg:col-span-2 rounded-md border border-border bg-card p-4">
          <div className="flex justify-center overflow-auto bg-background p-2">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="aspect-[16/10] w-full max-w-2xl">
              <ScorePreview id={score.id} className="h-full w-full" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
            <span>Page {page} of {score.pages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <button className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Fit"><Maximize className="h-4 w-4" /></button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage((p) => Math.min(score.pages, p + 1))} className="rounded border border-border p-1.5 hover:bg-accent" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Practice section — human first */}
          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Practice</p>
            <p className="mt-3 text-sm text-foreground">
              {score.lastPlayed === 'never' || !score.lastPlayed ? 'You haven’t played this one yet.' : `Last played ${score.lastPlayed}.`}
            </p>
            {score.lastMeasure > 1 && <p className="mt-1 text-sm text-primary">Continue from measure {score.lastMeasure}</p>}
            {score.difficultSections.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{score.difficultSections[0].note}</p>
            )}
            <Link to={`/score/${score.id}/practice`} className="mt-4 block rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90">
              Continue playing
            </Link>
          </div>

          {/* Information */}
          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Information</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Composer</dt><dd>{score.composer}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Instrument</dt><dd>{score.instrument}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Tags</dt><dd className="flex flex-wrap justify-end gap-1">{score.tags.map((t) => <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-xs">{t}</span>)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Source</dt><dd>{score.source}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Added</dt><dd>{score.created}</dd></div>
            </dl>
          </div>

          {/* Practice history */}
          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent practice</p>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No sessions yet. When you practice, they’ll show up here.</p>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {sessions.map((s) => (
                  <Link key={s.id} to={`/practice/${s.id}/summary`} className="flex items-center justify-between py-2.5 hover:bg-accent/40">
                    <div>
                      <p className="text-sm font-medium">{s.date} · {s.duration}</p>
                      <p className="text-xs text-muted-foreground">{s.range}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SharingDialog score={score} open={shareOpen} onOpenChange={setShareOpen} />

      {/* Versions dialog */}
      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Version history</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border border-primary/40 bg-accent/40 px-3 py-2">
              <div><p className="text-sm font-medium">Current version</p><p className="text-xs text-muted-foreground">Sep 8, 2026</p></div>
              <span className="text-xs font-medium text-primary">Current</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div><p className="text-sm font-medium">After recognition review</p><p className="text-xs text-muted-foreground">Aug 12, 2026</p></div>
              <Button variant="outline" size="sm">Restore</Button>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div><p className="text-sm font-medium">First import</p><p className="text-xs text-muted-foreground">Aug 12, 2026</p></div>
              <Button variant="outline" size="sm">Restore</Button>
            </div>
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
            <Button variant="destructive" onClick={() => setConfirmDelete(false)}>Move to trash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}