import { useCallback, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { signedUrlFor, slugify } from '@/lib/media';
import PerformanceRow from '@/components/performances/PerformanceRow';
import ShareResourceDialog from '@/components/sharing/ShareResourceDialog';
import StateMessage from '@/components/patterns/StateMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const TABS = [
  { value: 'mine', label: 'My performances' },
  { value: 'shared', label: 'Shared with me' },
];
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

export default function Performances() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const scoreFilter = searchParams.get('score');

  const performances = usePrototypeStore((s) => s.savedPerformances) || [];
  const scores = usePrototypeStore((s) => s.scores);
  const members = usePrototypeStore((s) => s.teamMembers) || [];
  const deletePerformance = usePrototypeStore((s) => s.deletePerformance);
  const updateSharing = usePrototypeStore((s) => s.updatePerformanceSharing);

  const [tab, setTab] = useState('mine');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [player, setPlayer] = useState({ id: null, position: 0, playing: false });
  const [sources, setSources] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [sharing, setSharing] = useState(null);
  const mediaRef = useRef(null);

  const mine = performances.filter((p) => p.ownerId === 'you');
  const sharedWithMe = performances.filter((p) => p.ownerId !== 'you' && (p.sharedWith || []).includes('you'));
  const source = tab === 'mine' ? mine : sharedWithMe;

  // Stored recordings are private; playback uses a short-lived signed link.
  const resolveSource = useCallback(async (p) => {
    if (sources[p.id]) return sources[p.id];
    if (!p.fileUri) throw new Error('No recording file is stored for this performance.');
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
        el.play().catch(() => setItemError(p.id, 'Playback was blocked. Press play again.'));
        setPlayer((cur) => ({ ...cur, playing: true }));
      } else {
        el.pause();
        setPlayer((cur) => ({ ...cur, playing: false }));
      }
      return;
    }
    startPlayback(p);
  };

  const seek = (p, value) => {
    if (player.id !== p.id) {
      startPlayback(p);
      return;
    }
    if (mediaRef.current) mediaRef.current.currentTime = value;
    setPlayer((cur) => ({ ...cur, position: value }));
  };

  const download = async (p) => {
    try {
      const url = await resolveSource(p);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${slugify(p.scoreTitleSnapshot)}-${p.mediaType === 'video' ? 'performance' : 'recording'}.webm`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
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
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-tight text-ink-primary">Performances</h1>
      <p className="mt-1.5 type-body text-ink-secondary">The performances you chose to keep.</p>

      {contextualScore && (
        <div className="mt-4 flex flex-wrap items-center gap-2 type-body-small text-ink-secondary">
          <span>Showing performances of</span>
          <Link to={`/score/${contextualScore.id}`} className="font-medium text-brand hover:underline">{contextualScore.title}</Link>
          <button onClick={clearScoreFilter} className="flex items-center gap-1 rounded-control border border-line-subtle px-2 py-0.5 hover:bg-accent">
            <X className="h-3 w-3" aria-hidden="true" /> Show all
          </button>
        </div>
      )}

      <div role="tablist" aria-label="Performances" className="mt-5 inline-flex rounded-control border border-line-subtle p-0.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`rounded px-3 py-1.5 text-sm ${tab === t.value ? 'bg-accent font-medium text-accent-foreground' : 'text-ink-secondary hover:text-ink-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {source.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by media" className="inline-flex rounded-control border border-line-subtle p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setKind(f.value)}
                aria-pressed={kind === f.value}
                className={`rounded px-3 py-1 text-sm ${kind === f.value ? 'bg-accent font-medium text-accent-foreground' : 'text-ink-secondary hover:text-ink-primary'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by score"
              aria-label="Search performances by score title"
              className="h-8 pl-8"
            />
          </div>
        </div>
      )}

      {source.length === 0 ? (
        <div className="mt-8">
          <StateMessage
            tone="neutral"
            title={tab === 'mine' ? 'No saved performances yet.' : 'Nothing shared with you yet'}
            description={
              tab === 'mine'
                ? 'When a performance feels worth keeping, you can save it from the report.'
                : 'When someone shares a performance with you, it appears here.'
            }
            primaryAction={
              tab === 'mine'
                ? <Button asChild><Link to="/practice">Choose something to play</Link></Button>
                : undefined
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 type-body-small text-ink-secondary">Nothing matches that filter yet.</p>
      ) : (
        <div className="mt-2 divide-y divide-line-subtle">
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
              onShare={() => setSharing(p)}
              onDelete={() => setPendingDelete(p)}
            />
          ))}
        </div>
      )}

      <p className="mt-8 type-metadata text-ink-tertiary">
        Practice reports aren’t stored, so performances open here as recordings — not as old reports.
      </p>

      {/* One real media element drives whichever performance is playing */}
      <video
        ref={mediaRef}
        className="hidden"
        playsInline
        onTimeUpdate={(e) => setPlayer((cur) => (cur.id ? { ...cur, position: e.target.currentTime } : cur))}
        onPlay={() => setPlayer((cur) => ({ ...cur, playing: true }))}
        onPause={() => setPlayer((cur) => ({ ...cur, playing: false }))}
        onEnded={() => setPlayer((cur) => ({ ...cur, playing: false }))}
        onError={() => {
          if (player.id) setItemError(player.id, 'The recording file could not be played.');
        }}
      />

      <ShareResourceDialog
        open={!!sharing}
        onOpenChange={(open) => !open && setSharing(null)}
        title={sharing?.scoreTitleSnapshot || ''}
        members={members}
        value={sharing}
        onSave={(next) => {
          updateSharing(sharing.id, next);
          setSharing(null);
          toast({ title: 'Sharing updated' });
        }}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete this performance?</DialogTitle></DialogHeader>
          <p className="text-sm text-ink-secondary">
            {pendingDelete?.scoreTitleSnapshot} — the recording will be removed from Performances. Your practice activity stays in history.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletePerformance(pendingDelete.id);
                if (player.id === pendingDelete.id) {
                  if (mediaRef.current) {
                    mediaRef.current.pause();
                    mediaRef.current.removeAttribute('src');
                    delete mediaRef.current.dataset.id;
                  }
                  setPlayer({ id: null, position: 0, playing: false });
                }
                setPendingDelete(null);
                toast({ title: 'Performance deleted' });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}