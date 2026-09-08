import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LayoutGrid, List, Plus, SlidersHorizontal, ArrowUpDown, Play, Star, FolderInput, Trash2, Heart, X, Check } from 'lucide-react';
import { scores as seedScores, folders as seedFolders, practiceHome } from '@/lib/mockData';
import ScoreCard from '@/components/library/ScoreCard';
import ScorePreview from '@/components/library/ScorePreview';
import LibrarySubRail from '@/components/library/LibrarySubRail';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const ownershipFilter = {
  all: () => true,
  mine: (s) => s.ownership === 'mine',
  shared: (s) => s.ownership === 'shared',
  saved: (s) => s.ownership === 'saved',
  favorites: (s) => s.favorite,
  trash: (s) => s.ownership === 'trash',
};

const sortOptions = [
  { key: 'recent', label: 'Recently added' },
  { key: 'played', label: 'Recently played' },
  { key: 'title', label: 'Title' },
  { key: 'composer', label: 'Composer' },
];

const playedOrder = { yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5, never: 99, null: 99 };

export default function Library() {
  const [params, setParams] = useSearchParams();
  const active = params.get('view') || 'all';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'recent';
  const view = params.get('layout') || 'grid';
  const [searchInput, setSearchInput] = useState(search);

  const [scores, setScores] = useState(seedScores);
  const [folders, setFolders] = useState(seedFolders);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterInstrument, setFilterInstrument] = useState('all');
  const [filterFav, setFilterFav] = useState(false);
  const [filterPlayed, setFilterPlayed] = useState('any');
  const [moveOpen, setMoveOpen] = useState(false);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const activeFolderId = active.startsWith('folder:') ? active.split(':')[1] : null;
  const isTrash = active === 'trash';

  const instruments = useMemo(() => ['all', ...Array.from(new Set(scores.map((s) => s.instrument)))], [scores]);

  const filtered = useMemo(() => {
    let list = scores.filter(ownershipFilter[active] || (() => true));
    if (activeFolderId) list = list.filter((s) => s.folderIds.includes(activeFolderId));
    if (filterInstrument !== 'all') list = list.filter((s) => s.instrument === filterInstrument);
    if (filterFav) list = list.filter((s) => s.favorite);
    if (filterPlayed === 'recent') list = list.filter((s) => s.lastPlayed && s.lastPlayed !== 'never');
    if (filterPlayed === 'notplayed') list = list.filter((s) => !s.lastPlayed || s.lastPlayed === 'never');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.composer.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)));
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'composer') sorted.sort((a, b) => a.composer.localeCompare(b.composer));
    else if (sort === 'played') sorted.sort((a, b) => (playedOrder[a.lastPlayed] ?? 50) - (playedOrder[b.lastPlayed] ?? 50));
    else sorted.sort((a, b) => b.created.localeCompare(a.created));
    return sorted;
  }, [scores, active, activeFolderId, filterInstrument, filterFav, filterPlayed, search, sort]);

  const liveCount = scores.filter((s) => s.ownership !== 'trash').length;

  // Folder ops
  const createFolder = (name) => setFolders((f) => [...f, { id: name.toLowerCase().replace(/\s+/g, '-'), name }]);
  const renameFolder = (id, name) => setFolders((f) => f.map((x) => (x.id === id ? { ...x, name } : x)));
  const deleteFolder = (id) => { setFolders((f) => f.filter((x) => x.id !== id)); if (activeFolderId === id) setParam('view', 'all'); };

  // Selection ops
  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSelect = () => setSelected([]);
  const favSelected = () => { setScores((p) => p.map((s) => selected.includes(s.id) ? { ...s, favorite: true } : s)); clearSelect(); };
  const trashSelected = () => { setScores((p) => p.map((s) => selected.includes(s.id) ? { ...s, ownership: 'trash', deletedAt: new Date().toISOString().slice(0, 10) } : s)); clearSelect(); };
  const moveSelected = (folderId) => { setScores((p) => p.map((s) => selected.includes(s.id) ? { ...s, folderIds: [...new Set([...s.folderIds, folderId])] } : s)); clearSelect(); setMoveOpen(false); };

  const restoreScore = (id) => setScores((p) => p.map((s) => s.id === id ? { ...s, ownership: 'mine', deletedAt: undefined } : s));
  const deleteForever = (id) => setScores((p) => p.filter((s) => s.id !== id));
  const emptyTrash = () => setScores((p) => p.filter((s) => s.ownership !== 'trash'));

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex">
      <LibrarySubRail
        active={active}
        onSelect={(k) => { setParam('view', k); clearSelect(); }}
        folders={folders}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
      />

      <div className="min-w-0 flex-1">
        {/* Continue practicing shortcut (hidden in trash) */}
        {!isTrash && (
          <Link
            to={`/score/${practiceHome.continuePractice.scoreId}/practice`}
            className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-accent px-4 py-3 md:mx-8"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">Pick up where you left off</p>
              <p className="truncate font-display text-lg font-medium">{practiceHome.continuePractice.title} — {practiceHome.continuePractice.composer}</p>
              <p className="text-sm text-muted-foreground">Continue from measure {practiceHome.continuePractice.measure} · last played {practiceHome.continuePractice.lastPlayed}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Play className="h-4 w-4" /> Continue
            </span>
          </Link>
        )}

        {/* Header */}
        <div className="border-b border-border px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-medium">{isTrash ? 'Trash' : activeFolderId ? folders.find((f) => f.id === activeFolderId)?.name : 'Library'}</h1>
              <p className="text-sm text-muted-foreground">{isTrash ? filtered.length : liveCount} {isTrash ? 'in trash' : 'scores'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setParam('search', searchInput.trim())}
                  placeholder="Search your music…"
                  className="h-9 w-44 rounded-md border border-border bg-card pl-3 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary md:w-64"
                />
              </div>
              <div className="relative">
                <button onClick={() => { setShowFilters((s) => !s); setShowSort(false); }} className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent">
                  <SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Filter</span>
                </button>
                {showFilters && (
                  <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-border bg-card p-3 shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instrument</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {instruments.map((ins) => (
                        <button key={ins} onClick={() => setFilterInstrument(ins)} className={`rounded px-2 py-1 text-xs ${filterInstrument === ins ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/60'}`}>{ins === 'all' ? 'All' : ins}</button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Played</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {[['any', 'Any'], ['recent', 'Played recently'], ['notplayed', 'Not played']].map(([k, l]) => (
                        <button key={k} onClick={() => setFilterPlayed(k)} className={`rounded px-2 py-1 text-xs ${filterPlayed === k ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/60'}`}>{l}</button>
                      ))}
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={filterFav} onChange={(e) => setFilterFav(e.target.checked)} className="accent-primary" /> Favorites only
                    </label>
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setShowSort((s) => !s); setShowFilters(false); }} className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent">
                  <ArrowUpDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort</span>
                </button>
                {showSort && (
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-border bg-card p-1 shadow-md">
                    {sortOptions.map((o) => (
                      <button key={o.key} onClick={() => { setParam('sort', o.key); setShowSort(false); }} className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-sm ${sort === o.key ? 'bg-accent font-medium' : 'hover:bg-accent/60'}`}>
                        {o.label} {sort === o.key && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex h-9 items-center rounded-md border border-border p-0.5">
                <button onClick={() => setParam('layout', 'grid')} className={`flex h-8 w-8 items-center justify-center rounded ${view === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setParam('layout', 'list')} className={`flex h-8 w-8 items-center justify-center rounded ${view === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`} aria-label="List view"><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Multi-select bar */}
          {selected.length > 0 && !isTrash && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-accent/40 px-3 py-2">
              <span className="text-sm font-medium">{selected.length} selected</span>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <button onClick={favSelected} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><Heart className="h-3.5 w-3.5" /> Favorite</button>
                <button onClick={() => setMoveOpen(true)} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><FolderInput className="h-3.5 w-3.5" /> Move to folder</button>
                <button onClick={trashSelected} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /> Move to trash</button>
                <button onClick={clearSelect} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-5 md:px-8" onClick={() => { setShowFilters(false); setShowSort(false); }}>
          {isEmpty ? (
            <EmptyState active={active} isTrash={isTrash} />
          ) : isTrash ? (
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={emptyTrash}><Trash2 className="mr-1.5 h-4 w-4" /> Empty trash</Button>
              </div>
              {filtered.map((s) => (
                <div key={s.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-border"><ScorePreview id={s.id} className="h-full w-full" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{s.composer} · deleted {s.deletedAt}</p>
                  </div>
                  <button onClick={() => restoreScore(s.id)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">Restore</button>
                  <button onClick={() => deleteForever(s.id)} className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Delete forever</button>
                </div>
              ))}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((s) => (
                <ScoreCard key={s.id} score={s} selected={selected.includes(s.id)} onToggleSelect={toggleSelect} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {filtered.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-3 hover:bg-accent/40">
                  {selected.includes(s.id) && <Check className="h-4 w-4 text-primary" />}
                  <Link to={`/score/${s.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-border"><ScorePreview id={s.id} className="h-full w-full" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{s.composer} · {s.instrument}</p>
                    </div>
                    {s.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {s.lastPlayed === 'never' || !s.lastPlayed ? 'Not played' : `Played ${s.lastPlayed}`}
                    </span>
                  </Link>
                  <button onClick={() => toggleSelect(s.id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Select"><Check className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Move to folder dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Move to folder</DialogTitle></DialogHeader>
          <div className="space-y-1">
            {folders.map((f) => (
              <button key={f.id} onClick={() => moveSelected(f.id)} className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent">
                <FolderInput className="h-4 w-4 text-muted-foreground" /> {f.name}
              </button>
            ))}
            {folders.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No folders yet. Create one from the sidebar.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ active, isTrash }) {
  if (isTrash) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
        <Trash2 className="h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 font-display text-2xl font-medium">Trash is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">Scores you remove go here first. You can restore them or delete them for good.</p>
      </div>
    );
  }
  if (active === 'all') {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
        <h2 className="font-display text-2xl font-medium">Start with something you love.</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">Add a piece you’ve been wanting to play.</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/add-score" className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add a score</Link>
          <span className="text-sm text-muted-foreground">or</span>
          <Link to="/score/moonlight" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Explore a sample score</Link>
        </div>
      </div>
    );
  }
  const labels = { mine: 'your own scores', shared: 'scores shared with you', saved: 'saved scores', favorites: 'favorites' };
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
      <h2 className="font-display text-xl font-medium">Nothing here yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">This is where {labels[active] || 'these scores'} will appear. {active === 'favorites' ? 'Mark scores with a star to see them here.' : ''}</p>
      <Link to="/add-score" className="mt-5 flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add a score</Link>
    </div>
  );
}