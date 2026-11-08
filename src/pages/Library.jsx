import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutGrid, List, Plus, SlidersHorizontal, ArrowUpDown, Play, Star,
  FolderInput, Trash2, Heart, X, Check, LogOut, BookmarkMinus, Settings,
  Folder, Pencil, Sparkles,
} from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import ScoreCard from '@/components/library/ScoreCard';
import ScorePreview from '@/components/library/ScorePreview';
import LibrarySubRail from '@/components/library/LibrarySubRail';
import MusicPaper from '@/components/patterns/MusicPaper';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const librarySections = [
  { key: 'all', label: 'All music' },
  { key: 'mine', label: 'Mine' },
  { key: 'shared', label: 'Shared with me' },
  { key: 'saved', label: 'Saved' },
  { key: 'favorites', label: 'Favorites' },
];

const ownershipFilter = {
  all: (s) => s.ownership !== 'trash',
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

const playedOrder = { yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5, never: 99, null: 99, today: -1 };

export default function Library() {
  const [params, setParams] = useSearchParams();
  const active = params.get('view') || 'all';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'recent';
  const view = params.get('layout') || 'grid';
  const [searchInput, setSearchInput] = useState(search);

  const scores = usePrototypeStore((s) => s.scores);
  const folders = usePrototypeStore((s) => s.folders);
  const createFolder = usePrototypeStore((s) => s.createFolder);
  const renameFolder = usePrototypeStore((s) => s.renameFolder);
  const deleteFolder = usePrototypeStore((s) => s.deleteFolder);
  const favoriteScores = usePrototypeStore((s) => s.favoriteScores);
  const moveScoresToFolder = usePrototypeStore((s) => s.moveScoresToFolder);
  const bulkTrashOwned = usePrototypeStore((s) => s.bulkTrashOwned);
  const bulkLeaveShared = usePrototypeStore((s) => s.bulkLeaveShared);
  const bulkRemoveSaved = usePrototypeStore((s) => s.bulkRemoveSaved);
  const restoreScore = usePrototypeStore((s) => s.restoreScore);
  const deleteScoreForever = usePrototypeStore((s) => s.deleteScoreForever);
  const emptyTrash = usePrototypeStore((s) => s.emptyTrash);

  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterInstrument, setFilterInstrument] = useState('all');
  const [filterFav, setFilterFav] = useState(false);
  const [filterPlayed, setFilterPlayed] = useState('any');
  const [moveOpen, setMoveOpen] = useState(false);
  const [folderDelete, setFolderDelete] = useState(null);
  const [trashConfirm, setTrashConfirm] = useState(null);
  const [manageFoldersOpen, setManageFoldersOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState(null);

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

  // Derive "continue practicing" from store
  const playedScores = scores.filter((s) => s.ownership !== 'trash' && s.lastPlayed && s.lastPlayed !== 'never');
  const continueScore = playedScores.length > 0
    ? [...playedScores].sort((a, b) => {
        const order = { today: -1, yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5 };
        return (order[a.lastPlayed] ?? 50) - (order[b.lastPlayed] ?? 50);
      })[0]
    : null;

  // Selection ops
  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSelect = () => setSelected([]);
  const favSelected = () => { favoriteScores(selected); clearSelect(); };

  const selectedScores = scores.filter((s) => selected.includes(s.id));
  const allMine = selectedScores.length > 0 && selectedScores.every((s) => s.ownership === 'mine');
  const allShared = selectedScores.length > 0 && selectedScores.every((s) => s.ownership === 'shared');
  const allSaved = selectedScores.length > 0 && selectedScores.every((s) => s.ownership === 'saved');

  const removeSelected = () => {
    if (allMine) { bulkTrashOwned(selected); }
    else if (allShared) { bulkLeaveShared(selected); }
    else if (allSaved) { bulkRemoveSaved(selected); }
    else {
      bulkTrashOwned(selected.filter((id) => scores.find((s) => s.id === id)?.ownership === 'mine'));
      bulkLeaveShared(selected.filter((id) => scores.find((s) => s.id === id)?.ownership === 'shared'));
      bulkRemoveSaved(selected.filter((id) => scores.find((s) => s.id === id)?.ownership === 'saved'));
    }
    clearSelect();
  };

  const moveSelected = (folderId) => { moveScoresToFolder(selected, folderId); clearSelect(); setMoveOpen(false); };

  const handleDeleteFolder = (id) => setFolderDelete(id);
  const confirmDeleteFolder = () => {
    deleteFolder(folderDelete);
    if (activeFolderId === folderDelete) setParam('view', 'all');
    setFolderDelete(null);
  };

  const isEmpty = filtered.length === 0;

  const removeLabel = allMine ? 'Move to trash' : allShared ? 'Leave shared score' : allSaved ? 'Remove from library' : 'Remove from library';
  const RemoveIcon = allMine ? Trash2 : allShared ? LogOut : BookmarkMinus;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <LibrarySubRail
        active={active}
        onSelect={(k) => { setParam('view', k); clearSelect(); }}
        folders={folders}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <div className="min-w-0 flex-1">
        {/* Mobile folio filter rail */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-line-subtle bg-surface-canvas/40 px-4 py-2.5 lg:hidden no-scrollbar">
          {librarySections.map((item) => (
            <button
              key={item.key}
              onClick={() => { setParam('view', item.key); clearSelect(); }}
              className={`whitespace-nowrap rounded-control px-3 py-1.5 text-xs transition-colors ${
                active === item.key
                  ? 'bg-brand/10 font-semibold text-brand'
                  : 'text-ink-secondary hover:bg-surface-paper'
              }`}
            >
              {item.label}
            </button>
          ))}
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => { setParam('view', `folder:${f.id}`); clearSelect(); }}
              className={`whitespace-nowrap rounded-control px-3 py-1.5 text-xs transition-colors ${
                active === `folder:${f.id}`
                  ? 'bg-brand/10 font-semibold text-brand'
                  : 'text-ink-secondary hover:bg-surface-paper'
              }`}
            >
              {f.name}
            </button>
          ))}
          <button
            onClick={() => setManageFoldersOpen(true)}
            className="flex items-center gap-1 whitespace-nowrap rounded-control px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-paper"
          >
            <Settings className="h-3.5 w-3.5" /> Manage
          </button>
          <button
            onClick={() => { setParam('view', 'trash'); clearSelect(); }}
            className={`flex items-center gap-1 whitespace-nowrap rounded-control px-3 py-1.5 text-xs transition-colors ${
              active === 'trash'
                ? 'bg-brand/10 font-semibold text-brand'
                : 'text-ink-secondary hover:bg-surface-paper'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </button>
        </div>

        {/* Hero: "Pick up where you left off" - Tactical Musical Folio */}
        {!isTrash && !search && active === 'all' && continueScore && (
          <div className="mx-4 mt-6 md:mx-8">
            <MusicPaper
              interactive
              tone="warm"
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded border border-surface-paper-edge bg-white/90 sm:block">
                  <ScorePreview id={continueScore.id} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
                    <Sparkles className="h-3 w-3" />
                    <span>Pick up where you left off</span>
                  </span>
                  <h2 className="truncate font-display text-lg font-medium text-ink-primary mt-0.5 sm:text-xl">
                    {continueScore.title}
                  </h2>
                  <p className="truncate text-xs text-ink-secondary mt-0.5">
                    {continueScore.composer} · Continue from bar {continueScore.lastMeasure} · Played {continueScore.lastPlayed}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/score/${continueScore.id}/setup`}
                  className="flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-hover active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume playing</span>
                </Link>
                <Link
                  to={`/score/${continueScore.id}`}
                  className="rounded-control border border-surface-paper-edge bg-surface-paper px-3 py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-paper-warm"
                >
                  Score folio
                </Link>
              </div>
            </MusicPaper>
          </div>
        )}

        {/* Repertoire Header & Toolbars */}
        <div className="border-b border-line-subtle px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-ink-primary sm:text-3xl">
                {isTrash ? 'Trash Folios' : activeFolderId ? folders.find((f) => f.id === activeFolderId)?.name : 'Repertoire'}
              </h1>
              <p className="mt-0.5 text-xs text-ink-secondary">
                {isTrash ? `${filtered.length} in trash` : `${liveCount} pieces in your personal collection`}
              </p>
            </div>

            {/* Filter, sort, view toggles */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setParam('search', searchInput.trim())}
                  placeholder="Filter by title, composer…"
                  className="h-8 w-40 rounded-control border border-surface-paper-edge bg-surface-paper/70 px-2.5 text-xs text-ink-primary outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-surface-paper md:w-56"
                />
              </div>

              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowFilters((s) => !s); setShowSort(false); }}
                  className={`flex h-8 items-center gap-1.5 rounded-control border px-2.5 text-xs transition-colors ${
                    filterFav || filterInstrument !== 'all' || filterPlayed !== 'any'
                      ? 'border-brand/40 bg-brand/10 font-semibold text-brand'
                      : 'border-surface-paper-edge bg-surface-paper text-ink-secondary hover:text-ink-primary'
                  }`}
                  aria-label="Filter repertoire"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                {showFilters && (
                  <div className="absolute right-0 z-20 mt-1 w-56 rounded-container border border-surface-paper-edge bg-surface-panel p-3 shadow-overlay">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">Instrument</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {instruments.map((ins) => (
                        <button
                          key={ins}
                          onClick={() => setFilterInstrument(ins)}
                          className={`rounded px-2 py-0.5 text-xs ${
                            filterInstrument === ins ? 'bg-brand/10 font-semibold text-brand' : 'text-ink-secondary hover:bg-surface-paper'
                          }`}
                        >
                          {ins === 'all' ? 'All' : ins}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">Practice history</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {[['any', 'Any'], ['recent', 'Played recently'], ['notplayed', 'Not played yet']].map(([k, l]) => (
                        <button
                          key={k}
                          onClick={() => setFilterPlayed(k)}
                          className={`rounded px-2 py-0.5 text-xs ${
                            filterPlayed === k ? 'bg-brand/10 font-semibold text-brand' : 'text-ink-secondary hover:bg-surface-paper'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-xs text-ink-primary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filterFav}
                        onChange={(e) => setFilterFav(e.target.checked)}
                        className="rounded accent-brand"
                      />
                      <span>Favorites only</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowSort((s) => !s); setShowFilters(false); }}
                  className="flex h-8 items-center gap-1.5 rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 text-xs text-ink-secondary hover:text-ink-primary"
                  aria-label="Sort repertoire"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort</span>
                </button>
                {showSort && (
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-container border border-surface-paper-edge bg-surface-panel p-1 shadow-overlay">
                    {sortOptions.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => { setParam('sort', o.key); setShowSort(false); }}
                        className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs ${
                          sort === o.key ? 'bg-brand/10 font-medium text-brand' : 'text-ink-secondary hover:bg-surface-paper'
                        }`}
                      >
                        <span>{o.label}</span>
                        {sort === o.key && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid / List switch */}
              <div className="flex h-8 items-center rounded-control border border-surface-paper-edge bg-surface-paper p-0.5">
                <button
                  onClick={() => setParam('layout', 'grid')}
                  className={`flex h-7 w-7 items-center justify-center rounded ${
                    view === 'grid' ? 'bg-surface-panel text-brand shadow-xs' : 'text-ink-tertiary hover:text-ink-primary'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setParam('layout', 'list')}
                  className={`flex h-7 w-7 items-center justify-center rounded ${
                    view === 'list' ? 'bg-surface-panel text-brand shadow-xs' : 'text-ink-tertiary hover:text-ink-primary'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Multi-select bar */}
          {selected.length > 0 && !isTrash && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-brand/30 bg-brand/5 px-3 py-2">
              <span className="text-xs font-semibold text-brand">{selected.length} piece{selected.length > 1 ? 's' : ''} selected</span>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <button
                  onClick={favSelected}
                  className="flex items-center gap-1.5 rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 py-1 text-xs font-medium hover:bg-surface-paper-warm"
                >
                  <Heart className="h-3 w-3" /> Favorite
                </button>
                <button
                  onClick={() => setMoveOpen(true)}
                  className="flex items-center gap-1.5 rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 py-1 text-xs font-medium hover:bg-surface-paper-warm"
                >
                  <FolderInput className="h-3 w-3" /> Move to folder
                </button>
                <button
                  onClick={() => setTrashConfirm({ selected: [...selected] })}
                  className="flex items-center gap-1.5 rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <RemoveIcon className="h-3 w-3" /> {removeLabel}
                </button>
                <button
                  onClick={clearSelect}
                  className="rounded p-1 text-ink-tertiary hover:text-ink-primary"
                  aria-label="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Repertoire Content Grid / List */}
        <div
          className="px-4 py-6 md:px-8"
          onClick={() => { setShowFilters(false); setShowSort(false); }}
        >
          {isEmpty ? (
            <EmptyState active={active} isTrash={isTrash} />
          ) : isTrash ? (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={emptyTrash} className="text-xs">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Empty trash
                </Button>
              </div>
              <div className="divide-y divide-surface-paper-edge rounded-container border border-surface-paper-edge bg-surface-paper">
                {filtered.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3.5">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-surface-paper-edge bg-white">
                      <ScorePreview id={s.id} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-medium text-ink-primary">{s.title}</p>
                      <p className="truncate text-xs text-ink-secondary">{s.composer} · deleted {s.deletedAt}</p>
                    </div>
                    <button
                      onClick={() => restoreScore(s.id)}
                      className="rounded-control border border-surface-paper-edge bg-surface-panel px-3 py-1.5 text-xs font-semibold text-ink-primary hover:bg-surface-paper-warm"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteScoreForever(s.id)}
                      className="rounded-control px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s) => (
                <ScoreCard
                  key={s.id}
                  score={s}
                  selected={selected.includes(s.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-surface-paper-edge rounded-container border border-surface-paper-edge bg-surface-paper shadow-paper">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 p-3.5 transition-colors hover:bg-surface-paper-warm ${
                    selected.includes(s.id) ? 'bg-brand/5' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSelect(s.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      selected.includes(s.id)
                        ? 'border-brand bg-brand text-white'
                        : 'border-surface-paper-edge hover:border-line-strong'
                    }`}
                    aria-label={`Select ${s.title}`}
                  >
                    {selected.includes(s.id) && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>

                  <Link to={`/score/${s.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-11 w-14 shrink-0 overflow-hidden rounded border border-surface-paper-edge bg-white">
                      <ScorePreview id={s.id} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-medium text-ink-primary">{s.title}</p>
                      <p className="truncate text-xs text-ink-secondary">{s.composer} · {s.instrument}</p>
                    </div>
                    {s.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold shrink-0" />}
                    <span className="hidden text-xs text-ink-tertiary sm:block">
                      {s.lastPlayed === 'never' || !s.lastPlayed ? 'Awaiting practice' : `Played ${s.lastPlayed}`}
                    </span>
                  </Link>

                  <Link
                    to={`/score/${s.id}/setup`}
                    className="flex shrink-0 items-center gap-1.5 rounded-control bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Practice</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Move to folder dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-sm border-surface-paper-edge bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle className="font-display text-lg">Move to folder</DialogTitle></DialogHeader>
          <div className="space-y-1 mt-2">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => moveSelected(f.id)}
                className="flex w-full items-center gap-2 rounded-control border border-surface-paper-edge px-3 py-2 text-left text-xs hover:bg-surface-paper"
              >
                <FolderInput className="h-3.5 w-3.5 text-ink-secondary" />
                <span className="font-medium text-ink-primary">{f.name}</span>
              </button>
            ))}
            {folders.length === 0 && <p className="py-4 text-center text-xs text-ink-tertiary">No folders yet.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMoveOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder delete confirmation */}
      <Dialog open={!!folderDelete} onOpenChange={(o) => !o && setFolderDelete(null)}>
        <DialogContent className="max-w-sm border-surface-paper-edge bg-surface-panel">
          <DialogHeader><DialogTitle className="font-display text-lg">Delete folder?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">Scores in this folder will stay in your library — only the folder is removed.</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setFolderDelete(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDeleteFolder}>Delete folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk remove confirmation */}
      <Dialog open={!!trashConfirm} onOpenChange={(o) => !o && setTrashConfirm(null)}>
        <DialogContent className="max-w-sm border-surface-paper-edge bg-surface-panel">
          <DialogHeader><DialogTitle className="font-display text-lg">{removeLabel}?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">
            {allMine && 'These pieces will move to Trash for 30 days.'}
            {allShared && 'You will lose access to these shared scores.'}
            {allSaved && 'These scores will be removed from your repertoire.'}
            {!allMine && !allShared && !allSaved && 'Selected pieces will be removed according to their ownership.'}
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setTrashConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => { removeSelected(); setTrashConfirm(null); }}>{removeLabel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage folders dialog (mobile) */}
      <Dialog open={manageFoldersOpen} onOpenChange={setManageFoldersOpen}>
        <DialogContent className="max-w-sm border-surface-paper-edge bg-surface-panel">
          <DialogHeader><DialogTitle className="font-display text-lg">Manage folders</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {folders.length === 0 && <p className="py-4 text-center text-xs text-ink-tertiary">No folders created yet.</p>}
            {folders.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-control border border-surface-paper-edge px-3 py-2">
                {editingFolderId === f.id ? (
                  <>
                    <input
                      autoFocus
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { renameFolder(f.id, editFolderName.trim()); setEditingFolderId(null); } }}
                      className="h-7 flex-1 rounded border border-surface-paper-edge bg-surface-paper px-2 text-xs outline-none focus:border-brand"
                    />
                    <button onClick={() => { renameFolder(f.id, editFolderName.trim()); setEditingFolderId(null); }} className="rounded p-1 text-brand hover:bg-brand/10" aria-label="Confirm"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingFolderId(null)} className="rounded p-1 text-ink-tertiary hover:bg-surface-paper" aria-label="Cancel"><X className="h-3.5 w-3.5" /></button>
                  </>
                ) : (
                  <>
                    <Folder className="h-3.5 w-3.5 text-ink-tertiary" />
                    <span className="flex-1 text-xs font-medium text-ink-primary">{f.name}</span>
                    <button onClick={() => { setEditingFolderId(f.id); setEditFolderName(f.name); }} className="rounded p-1 text-ink-tertiary hover:text-ink-primary" aria-label="Rename"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => setFolderToDelete(f.id)} className="rounded p-1 text-ink-tertiary hover:text-destructive" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                  </>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newFolderName.trim()) { createFolder(newFolderName.trim()); setNewFolderName(''); } }}
                placeholder="New folder name"
                className="h-7 flex-1 rounded border border-surface-paper-edge bg-surface-paper px-2 text-xs outline-none focus:border-brand"
              />
              <Button size="sm" onClick={() => { if (newFolderName.trim()) { createFolder(newFolderName.trim()); setNewFolderName(''); } }}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setManageFoldersOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder delete confirmation (mobile) */}
      <Dialog open={!!folderToDelete} onOpenChange={(o) => !o && setFolderToDelete(null)}>
        <DialogContent className="max-w-sm border-surface-paper-edge bg-surface-panel">
          <DialogHeader><DialogTitle className="font-display text-lg">Delete folder?</DialogTitle></DialogHeader>
          <p className="text-xs text-ink-secondary mt-1">Scores in this folder will remain in your library.</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setFolderToDelete(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => { deleteFolder(folderToDelete); if (activeFolderId === folderToDelete) setParam('view', 'all'); setFolderToDelete(null); }}>Delete folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ active, isTrash }) {
  if (isTrash) {
    return (
      <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-surface-paper-edge py-20 text-center">
        <Trash2 className="h-8 w-8 text-ink-tertiary" />
        <h2 className="mt-3 font-display text-xl font-medium text-ink-primary">Trash is empty</h2>
        <p className="mt-1.5 max-w-sm text-xs text-ink-secondary">Scores you remove go here first. You can restore them anytime within 30 days.</p>
      </div>
    );
  }
  if (active === 'all') {
    return (
      <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-surface-paper-edge bg-surface-paper/40 py-20 text-center">
        <h2 className="font-display text-2xl font-medium text-ink-primary">Start with something you love.</h2>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-ink-secondary">
          Add sheet music you have always wanted to play — whether scan, photo, or MusicXML.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/add-score"
            className="flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add sheet music
          </Link>
          <span className="text-xs text-ink-tertiary">or</span>
          <Link
            to="/score/moonlight"
            className="rounded-control border border-surface-paper-edge bg-surface-paper px-4 py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-paper-warm transition-colors"
          >
            Explore Moonlight Sonata
          </Link>
        </div>
      </div>
    );
  }
  const labels = { mine: 'your own scores', shared: 'scores shared with you', saved: 'saved scores', favorites: 'favorites' };
  return (
    <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-surface-paper-edge py-20 text-center">
      <h2 className="font-display text-xl font-medium text-ink-primary">Nothing here yet</h2>
      <p className="mt-1.5 max-w-sm text-xs text-ink-secondary">This is where {labels[active] || 'these scores'} will appear.</p>
      <Link
        to="/add-score"
        className="mt-5 flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add a score
      </Link>
    </div>
  );
}
