import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Music } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { signedUrlFor, slugify } from '@/lib/media';
import { dayLabel } from '@/lib/practiceUtils';
import PerformanceRow from '@/components/performances/PerformanceRow';
import EmptyState from '@/components/patterns/EmptyState';
import AppPage from '@/components/patterns/AppPage';
import { FilterTabs, FilterTab } from '@/components/patterns/FilterTabs';
import { SegmentedControl, SegmentedControlItem } from '@/components/patterns/SegmentedControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const TABS = [
  { value: 'mine', label: 'My preserved takes' },
  { value: 'shared', label: 'Shared with me' },
];
const FILTERS = [
  { value: 'all', label: 'All takes' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

export default function Performances() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const scoreFilter = searchParams.get('score');

  const performances = usePrototypeStore((s) => s.savedPerformances) || [];
  const scores = usePrototypeStore((s) => s.scores);
  const members = usePrototypeStore((s) => s.teamMembers) || [];
  const deletePerformance = usePrototypeStore((s) => s.deletePerformance);

  const [tab, setTab] = useState('mine');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [player, setPlayer] = useState({ id: null, position: 0, playing: false });
  const [sources, setSources] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const mediaRef = useRef(null);

  const mine = performances.filter((p) => p.ownerId === 'you');
  const sharedWithMe = performances.filter((p) => p.ownerId !== 'you' && (p.sharedWith || []).includes('you'));
  const source = tab === 'mine' ? mine : sharedWithMe;

  const resolveSource = useCallback(async (p) => {
    if (sources[p.id]) return sources[p.id];
    if (!p.fileUri) throw new Error('No recording file stored for this performance.');
    const url = await signedUrlFor(p.fileUri);
    if (!url) throw new Error('The recording could not be opened right now.');
    setSources((cur) => ({ ...cur, [p.id]: url }));
    return url;
  }, [sources]);

  const setItemError = (id, message) =>
    setErrors((cur) => ({ ...cur, [id]: message }));

  const startPlayback = async (p) => {
    setItemError(p.id, null);
    try {
      setLoadingId(p.id);
      const url = await resolveSource(p);
      setPlayer({ id: p.id, position: 0, playing: true });
      const el = mediaRef.current;
      if (el) {
        if (el.dataset.id !== p.id) {
          el.dataset.id = p.id;
          el.src = url;
          el.currentTime = 0;
        }
        await el.play();
      }
    } catch (err) {
      setPlayer((cur) => ({ ...cur, playing: false }));
      setItemError(p.id, err?.message || 'This recording could not be played.');
    } finally {
      setLoadingId(null);
    }
  };

  const togglePlay = (p) => {
    const el = mediaRef.current;
    if (player.id === p.id && el && el.dataset.id === p.id && el.src) {
      if (el.paused) {
        el.play().catch(() => setItemError(p.id, 'Playback blocked. Tap play again.'));
        setPlayer((cur) => ({ ...cur, playing: true }));
      } else {
        el.pause();
        setPlayer((cur) => ({ ...cur, playing: false }));
      }
      return;
    }
    startPlayback(p);
  };

  const seek = (p, sec) => {
    const el = mediaRef.current;
    if (el && player.id === p.id) {
      el.currentTime = sec;
      setPlayer((cur) => ({ ...cur, position: sec }));
      return;
    }
    setPlayer({ id: p.id, position: sec, playing: false });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deletePerformance(pendingDelete.id);
    toast({ title: 'Performance removed', description: `${pendingDelete.scoreTitleSnapshot} removed.` });
    setPendingDelete(null);
  };

  const download = async (p) => {
    try {
      const url = await resolveSource(p);
      const ext = p.mediaType === 'video' ? 'mp4' : 'webm';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(p.scoreTitleSnapshot)}-${dayLabel(p.createdAt)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      toast({ title: 'Download unavailable', description: err?.message || 'The recording could not be downloaded.' });
    }
  };

  const contextualScore = scoreFilter ? scores.find((s) => s.id === scoreFilter) : null;
  const visible = source.filter((p) => {
    if (scoreFilter && p.scoreId !== scoreFilter) return false;
    if (kind !== 'all' && p.mediaType !== kind) return false;
    if (query && !p.scoreTitleSnapshot.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const clearScoreFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('score');
    setSearchParams(next, { replace: true });
  };

  return (
    <AppPage size="standard">
      {/* Page Title */}
      <div>
        <h1 className="type-workspace-title text-ink-primary">
          Preserved Moments
        </h1>
        <p className="mt-1 type-page-subtitle text-ink-tertiary">
          The musical takes you chose to keep.
        </p>
      </div>

      {contextualScore && (
        <div className="mt-4 flex flex-wrap items-center gap-2 type-metadata text-ink-secondary">
          <span>Filtered by piece:</span>
          <Link to={`/score/${contextualScore.id}`} className="font-semibold text-brand hover:underline">
            {contextualScore.title}
          </Link>
          <button
            onClick={clearScoreFilter}
            className="flex items-center gap-1 rounded-control border border-line-subtle bg-surface-panel px-2 py-0.5 hover:bg-neutral-hover"
          >
            <X className="h-3 w-3" /> Show all
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl value={tab} onValueChange={setTab} aria-label="Preserved takes view">
          {TABS.map((t) => (
            <SegmentedControlItem key={t.value} value={t.value}>
              {t.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>

        {source.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs aria-label="Filter media type">
              {FILTERS.map((f) => (
                <FilterTab
                  key={f.value}
                  active={kind === f.value}
                  onClick={() => setKind(f.value)}
                >
                  {f.label}
                </FilterTab>
              ))}
            </FilterTabs>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search score title…"
                className="w-56 pl-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* List of Preserved Moments */}
      {source.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Music}
            title={tab === 'mine' ? 'No preserved takes yet' : 'Nothing shared yet'}
            description={
              tab === 'mine'
                ? 'When a practice take feels worth keeping, you can preserve it to revisit anytime.'
                : 'When another musician shares a performance with you, it will appear here.'
            }
            action={
              tab === 'mine' ? (
                <Button intent="primary" size="md" asChild>
                  <Link to="/library">Choose a piece to play</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 type-body-small text-ink-tertiary">No takes match that filter.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((p) => (
            <PerformanceRow
              key={p.id}
              performance={p}
              scoreExists={scores.some((s) => s.id === p.scoreId && s.ownership !== 'trash')}
              isOwner={p.ownerId === 'you'}
              ownerName={p.ownerId !== 'you' ? (members.find((m) => m.id === p.ownerId) || {}).name : null}
              playing={player.id === p.id && player.playing}
              position={player.id === p.id ? player.position : 0}
              loading={loadingId === p.id}
              error={errors[p.id]}
              canPlay={!!p.fileUri}
              onToggle={() => togglePlay(p)}
              onSeek={(v) => seek(p, v)}
              onDownload={() => download(p)}
              onOpen={() => navigate(`/performances/${p.id}`)}
              onDelete={() => setPendingDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Hidden media element for playback */}
      <audio
        ref={mediaRef}
        className="hidden"
        onTimeUpdate={(e) => setPlayer((cur) => ({ ...cur, position: Math.round(e.currentTarget.currentTime) }))}
        onEnded={() => setPlayer((cur) => ({ ...cur, playing: false, position: 0 }))}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete preserved moment?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary mt-1">
            This will permanently remove the preserved recording of {pendingDelete?.scoreTitleSnapshot}.
          </p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
