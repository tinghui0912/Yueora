import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import PerformanceRow from '@/components/performances/PerformanceRow';
import ShareVideoDialog from '@/components/performances/ShareVideoDialog';
import StateMessage from '@/components/patterns/StateMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

export default function Performances() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const scoreFilter = searchParams.get('score');
  const performances = usePrototypeStore((s) => s.practicePerformances);
  const scores = usePrototypeStore((s) => s.scores);
  const deletePerformance = usePrototypeStore((s) => s.deletePerformance);

  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [position, setPosition] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [shareFor, setShareFor] = useState(null);

  // One performance at a time: starting another stops the previous one.
  useEffect(() => {
    if (!playingId) return undefined;
    const current = performances.find((p) => p.id === playingId);
    if (!current) return undefined;
    const t = setInterval(() => {
      setPosition((pos) => {
        if (pos + 1 >= current.durationSec) {
          setPlayingId(null);
          return 0;
        }
        return pos + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playingId, performances]);

  const togglePlay = (performance) => {
    if (playingId === performance.id) {
      setPlayingId(null);
      return;
    }
    setPlayingId(performance.id);
    setPosition(0);
  };

  const contextualScore = scoreFilter ? scores.find((s) => s.id === scoreFilter) : null;

  const visible = performances.filter((p) => {
    if (scoreFilter && p.scoreId !== scoreFilter) return false;
    if (kind !== 'all' && p.mediaKind !== kind) return false;
    if (query && !p.scoreTitle.toLowerCase().includes(query.toLowerCase())) return false;
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

      {performances.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
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

      {performances.length === 0 ? (
        <div className="mt-8">
          <StateMessage
            tone="neutral"
            title="No saved performances yet."
            description="When a performance feels worth keeping, you can save it from the report."
            primaryAction={<Button asChild><Link to="/practice">Choose something to play</Link></Button>}
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
              playing={playingId === p.id}
              position={playingId === p.id ? position : 0}
              onToggle={() => togglePlay(p)}
              onSeek={(v) => { setPlayingId(p.id); setPosition(v); }}
              onDownload={() => toast({ title: 'Recording downloaded', description: `${p.scoreTitle} — ${p.mediaKind} recording (mock file).` })}
              onShareVideo={() => setShareFor(p)}
              onDelete={() => setPendingDelete(p)}
            />
          ))}
        </div>
      )}

      <ShareVideoDialog
        open={!!shareFor}
        onOpenChange={(open) => !open && setShareFor(null)}
        title={shareFor?.scoreTitle || ''}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete this performance?</DialogTitle></DialogHeader>
          <p className="text-sm text-ink-secondary">
            {pendingDelete?.scoreTitle} — the recording will be removed from Performances. The practice session stays in your history.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletePerformance(pendingDelete.id);
                if (playingId === pendingDelete.id) setPlayingId(null);
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