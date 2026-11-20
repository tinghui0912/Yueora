import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutGrid, List, Plus, SlidersHorizontal, ArrowUpDown, Play, Star,
  FolderInput, Trash2, Heart, X, Check, LogOut, BookmarkMinus, Settings,
  Folder, Pencil, Sparkles,
} from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { getScoreQuota, getEffectiveScoreUsage } from '@/lib/commercialEntitlements';
import ScoreCard from '@/components/library/ScoreCard';
import ScorePreview from '@/components/library/ScorePreview';
import LibrarySubRail from '@/components/library/LibrarySubRail';
import RepertoireGrid from '@/components/library/RepertoireGrid';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
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
  const imports = usePrototypeStore((s) => s.imports);
  const subscription = usePrototypeStore((s) => s.subscription);
  const scoreQuota = getScoreQuota(subscription?.plan);
  const { effectiveCount } = getEffectiveScoreUsage(scores, imports);
  const isAtScoreLimit = !scoreQuota.isUnlimited && effectiveCount >= scoreQuota.limit;
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
        <div className="flex gap-1.5 overflow-x-auto border-b border-line-subrail bg-surface-subrail px-4 py-2.5 lg:hidden no-scrollbar">
          {librarySections.map((item) => (
            <button
              key={item.key}
              onClick={() => { setParam('view', item.key); clearSelect(); }}
              className={`whitespace-nowrap rounded-control px-3 py-1.5 type-body-small transition-colors ${
                active === item.key
                  ? 'bg-neutral-muted font-semibold text-ink-primary'
                  : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => { setParam('view', `folder:${f.id}`); clearSelect(); }}
              className={`whitespace-nowrap rounded-control px-3 py-1.5 type-body-small transition-colors ${
                active === `folder:${f.id}`
                  ? 'bg-neutral-muted font-semibold text-ink-primary'
                  : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
              }`}
            >
              {f.name}
            </button>
          ))}
          <button
            onClick={() => setManageFoldersOpen(true)}
            className="flex items-center gap-1 whitespace-nowrap rounded-control px-3 py-1.5 type-body-small text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary"
          >
            <Settings className="icon-xs" /> Manage
          </button>
          <button
            onClick={() => { setParam('view', 'trash'); clearSelect(); }}
            className={`flex items-center gap-1 whitespace-nowrap rounded-control px-3 py-1.5 type-body-small transition-colors ${
              active === 'trash'
                ? 'bg-neutral-muted font-semibold text-ink-primary'
                : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
            }`}
          >
            <Trash2 className="icon-xs" /> Trash
          </button>
        </div>

        {/* Hero: "Pick up where you left off" - Resume Playing Card */}
        {!isTrash && !search && active === 'all' && continueScore && (
          <div className="mx-4 mt-6 md:mx-8">
            <div className="flex flex-col gap-4 rounded-container border border-line-subtle bg-surface-panel p-5 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded border border-line-subtle bg-white/90 sm:block">
                  <ScorePreview id={continueScore.id} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 type-caption text-brand">
                    <Sparkles className="icon-xs" />
                    <span>Pick up where you left off</span>
                  </span>
                  <h2 className="truncate type-section-title text-ink-primary mt-0.5">
                    {continueScore.title}
                  </h2>
                  <p className="truncate type-metadata text-ink-secondary mt-0.5">
                    {continueScore.composer} · Continue from bar {continueScore.lastMeasure} · Played {continueScore.lastPlayed}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button intent="primary" size="md" asChild>
                  <Link to={`/score/${continueScore.id}/setup`}>
                    <Play className="icon-sm fill-current" />
                    <span>Resume playing</span>
                  </Link>
                </Button>
                <Button intent="secondary" size="md" asChild>
                  <Link to={`/score/${continueScore.id}`}>
                    Score details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Repertoire Header & Toolbars */}
        <div className="border-b border-line-subtle px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="type-experience-title text-ink-primary">
                {isTrash ? 'Trash' : activeFolderId ? folders.find((f) => f.id === activeFolderId)?.name : 'Repertoire'}
              </h1>
              <p className="mt-0.5 type-body-small text-ink-secondary">
                {isTrash
                  ? `${filtered.length} in trash`
                  : `${liveCount} of ${scoreQuota.isUnlimited ? 'Unlimited' : `${scoreQuota.limit} scores`} in your personal collection`}
                {!isTrash && !scoreQuota.isUnlimited && liveCount >= scoreQuota.limit && (
                  <Link to="/pricing" className="ml-2 font-medium text-brand hover:underline">
                    Upgrade to expand
                  </Link>
                )}
              </p>
            </div>

            {/* Filter, sort, view toggles */}
            <div className="flex items-center gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setParam('search', searchInput.trim())}
                placeholder="Filter by title, composer…"
                className="w-44 md:w-56"
              />

              {/* Filter dropdown */}
              <div className="relative">
                <Button
                  intent={filterFav || filterInstrument !== 'all' || filterPlayed !== 'any' ? 'subtle' : 'secondary'}
                  size="md"
                  onClick={() => { setShowFilters((s) => !s); setShowSort(false); }}
                  aria-label="Filter repertoire"
                >
                  <SlidersHorizontal className="icon-sm" />
                  <span className="hidden sm:inline">Filter</span>
                  {(filterFav || filterInstrument !== 'all' || filterPlayed !== 'any') && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </Button>
                {showFilters && (
                  <div className="absolute right-0 z-20 mt-1 w-56 rounded-container border border-line-subtle bg-surface-panel p-3 shadow-overlay">
                    <p className="type-caption text-ink-tertiary">Instrument</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {instruments.map((ins) => (
                        <button
                          key={ins}
                          onClick={() => setFilterInstrument(ins)}
                          className={`rounded px-2 py-1 type-body-small ${
                            filterInstrument === ins ? 'bg-brand-soft font-semibold text-brand-soft-foreground' : 'text-ink-secondary hover:bg-neutral-hover'
                          }`}
                        >
                          {ins === 'all' ? 'All' : ins}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 type-caption text-ink-tertiary">Practice history</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {[['any', 'Any'], ['recent', 'Played recently'], ['notplayed', 'Not played yet']].map(([k, l]) => (
                        <button
                          key={k}
                          onClick={() => setFilterPlayed(k)}
                          className={`rounded px-2 py-1 type-body-small ${
                            filterPlayed === k ? 'bg-brand-soft font-semibold text-brand-soft-foreground' : 'text-ink-secondary hover:bg-neutral-hover'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <label className="mt-3 flex items-center gap-2 type-label text-ink-primary cursor-pointer select-none">
                      <Checkbox
                        checked={filterFav}
                        onCheckedChange={(checked) => setFilterFav(Boolean(checked))}
                        aria-label="Favorites only"
                      />
                      <span>Favorites only</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <Button
                  intent="secondary"
                  size="md"
                  onClick={() => { setShowSort((s) => !s); setShowFilters(false); }}
                  aria-label="Sort repertoire"
                >
                  <ArrowUpDown className="icon-sm" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
                {showSort && (
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-container border border-line-subtle bg-surface-panel p-1 shadow-overlay">
                    {sortOptions.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => { setParam('sort', o.key); setShowSort(false); }}
                        className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left type-body-small ${
                          sort === o.key ? 'bg-brand-soft font-semibold text-brand-soft-foreground' : 'text-ink-secondary hover:bg-neutral-hover'
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
              <div className="flex h-control-md items-center rounded-control border border-line-subtle bg-neutral-muted p-0.5">
                <IconButton
                  icon={LayoutGrid}
                  size="xs"
                  tone={view === 'grid' ? 'outline' : 'quiet'}
                  label="Grid view"
                  onClick={() => setParam('layout', 'grid')}
                  className={view === 'grid' ? 'text-brand' : 'text-ink-tertiary hover:text-ink-primary'}
                />
                <IconButton
                  icon={List}
                  size="xs"
                  tone={view === 'list' ? 'outline' : 'quiet'}
                  label="List view"
                  onClick={() => setParam('layout', 'list')}
                  className={view === 'list' ? 'text-brand' : 'text-ink-tertiary hover:text-ink-primary'}
                />
              </div>
            </div>
          </div>

          {/* Multi-select bar */}
          {selected.length > 0 && !isTrash && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-line-subtle bg-neutral-muted px-3 py-2">
              <span className="type-body-small font-semibold text-ink-primary">
                <span className="text-brand font-bold mr-1.5">●</span>
                {selected.length} piece{selected.length > 1 ? 's' : ''} selected
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={favSelected}
                  className="gap-1.5"
                >
                  <Heart className="h-3.5 w-3.5" /> Favorite
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => setMoveOpen(true)}
                  className="gap-1.5"
                >
                  <FolderInput className="h-3.5 w-3.5" /> Move to folder
                </Button>
                <Button
                  intent="danger"
                  size="sm"
                  onClick={() => setTrashConfirm({ selected: [...selected] })}
                  className="gap-1.5"
                >
                  <RemoveIcon className="h-3.5 w-3.5" /> {removeLabel}
                </Button>
                <IconButton
                  icon={X}
                  size="xs"
                  tone="quiet"
                  label="Clear selection"
                  onClick={clearSelect}
                />
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
              {isAtScoreLimit && (
                <p className="type-metadata text-ink-secondary bg-neutral-muted px-4 py-2.5 rounded-control border border-line-subtle">
                  Your repertoire is full ({effectiveCount} of {scoreQuota.limit} scores). Delete a score permanently or upgrade to restore music from Trash.
                </p>
              )}
              <div className="flex justify-end">
                <Button intent="secondary" size="sm" onClick={emptyTrash}>
                  <Trash2 className="mr-1.5" /> Empty trash
                </Button>
              </div>
              <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
                {filtered.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3.5">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-line-subtle bg-white">
                      <ScorePreview id={s.id} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate type-subsection text-ink-primary">{s.title}</p>
                      <p className="truncate type-metadata text-ink-secondary">{s.composer} · deleted {s.deletedAt}</p>
                    </div>
                    <Button
                      intent="secondary"
                      size="xs"
                      disabled={isAtScoreLimit}
                      title={isAtScoreLimit ? `Repertoire limit reached (${effectiveCount}/${scoreQuota.limit}). Upgrade or delete another score first.` : 'Restore score'}
                      onClick={() => restoreScore(s.id)}
                    >
                      Restore
                    </Button>
                    <Button
                      intent="quiet"
                      size="xs"
                      onClick={() => deleteScoreForever(s.id)}
                      className="text-danger hover:text-danger hover:bg-danger/10"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : view === 'grid' ? (
            <RepertoireGrid>
              {filtered.map((s) => (
                <ScoreCard
                  key={s.id}
                  score={s}
                  selected={selected.includes(s.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </RepertoireGrid>
          ) : (
            <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 p-3.5 transition-colors hover:bg-neutral-hover ${
                    selected.includes(s.id) ? 'bg-neutral-muted/70' : ''
                  }`}
                >
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onCheckedChange={() => toggleSelect(s.id)}
                    aria-label={`Select ${s.title}`}
                    className="shrink-0"
                  />

                  <Link to={`/score/${s.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-11 w-14 shrink-0 overflow-hidden rounded border border-line-subtle bg-white">
                      <ScorePreview id={s.id} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate type-subsection text-ink-primary">{s.title}</p>
                      <p className="truncate type-metadata text-ink-secondary">{s.composer} · {s.instrument}</p>
                    </div>
                    {s.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold shrink-0" />}
                    <span className="hidden type-metadata text-ink-tertiary sm:block">
                      {s.lastPlayed === 'never' || !s.lastPlayed ? 'Awaiting practice' : `Played ${s.lastPlayed}`}
                    </span>
                  </Link>

                  <Button
                    intent="subtle"
                    size="xs"
                    asChild
                    className="shrink-0"
                  >
                    <Link to={`/score/${s.id}/setup`}>
                      <Play className="icon-xs fill-current" />
                      <span>Practice</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Move to folder dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Move to folder</DialogTitle></DialogHeader>
          <div className="space-y-1 mt-2">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => moveSelected(f.id)}
                className="flex w-full items-center gap-2 rounded-control border border-line-subtle px-3 py-2 text-left type-body-small hover:bg-neutral-hover"
              >
                <FolderInput className="h-3.5 w-3.5 text-ink-secondary" />
                <span className="font-medium text-ink-primary">{f.name}</span>
              </button>
            ))}
            {folders.length === 0 && <p className="py-4 text-center type-metadata text-ink-tertiary">No folders yet.</p>}
          </div>
          <DialogFooter>
            <Button intent="secondary" size="sm" onClick={() => setMoveOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder delete confirmation */}
      <Dialog open={!!folderDelete} onOpenChange={(o) => !o && setFolderDelete(null)}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Delete folder?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary mt-1">Scores in this folder will stay in your library — only the folder is removed.</p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setFolderDelete(null)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={confirmDeleteFolder}>Delete folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk remove confirmation */}
      <Dialog open={!!trashConfirm} onOpenChange={(o) => !o && setTrashConfirm(null)}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>{removeLabel}?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary mt-1">
            {allMine && 'These pieces will move to Trash for 30 days.'}
            {allShared && 'You will lose access to these shared scores.'}
            {allSaved && 'These scores will be removed from your repertoire.'}
            {!allMine && !allShared && !allSaved && 'Selected pieces will be removed according to their ownership.'}
          </p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setTrashConfirm(null)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={() => { removeSelected(); setTrashConfirm(null); }}>{removeLabel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage folders dialog (mobile) */}
      <Dialog open={manageFoldersOpen} onOpenChange={setManageFoldersOpen}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Manage folders</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {folders.length === 0 && <p className="py-4 text-center type-metadata text-ink-tertiary">No folders created yet.</p>}
            {folders.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-control border border-line-subtle px-3 py-2">
                {editingFolderId === f.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { renameFolder(f.id, editFolderName.trim()); setEditingFolderId(null); } }}
                      className="flex-1"
                    />
                    <IconButton
                      icon={Check}
                      size="xs"
                      tone="primary"
                      label="Confirm"
                      onClick={() => { renameFolder(f.id, editFolderName.trim()); setEditingFolderId(null); }}
                    />
                    <IconButton
                      icon={X}
                      size="xs"
                      tone="quiet"
                      label="Cancel"
                      onClick={() => setEditingFolderId(null)}
                    />
                  </>
                ) : (
                  <>
                    <Folder className="h-3.5 w-3.5 text-ink-tertiary" />
                    <span className="flex-1 type-body-small font-medium text-ink-primary">{f.name}</span>
                    <IconButton
                      icon={Pencil}
                      size="xs"
                      tone="quiet"
                      label="Rename"
                      onClick={() => { setEditingFolderId(f.id); setEditFolderName(f.name); }}
                    />
                    <IconButton
                      icon={Trash2}
                      size="xs"
                      tone="danger"
                      label="Delete"
                      onClick={() => setFolderToDelete(f.id)}
                    />
                  </>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newFolderName.trim()) { createFolder(newFolderName.trim()); setNewFolderName(''); } }}
                placeholder="New folder name"
                className="flex-1"
              />
              <Button intent="primary" size="sm" onClick={() => { if (newFolderName.trim()) { createFolder(newFolderName.trim()); setNewFolderName(''); } }}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <DialogFooter>
            <Button intent="secondary" size="sm" onClick={() => setManageFoldersOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder delete confirmation (mobile) */}
      <Dialog open={!!folderToDelete} onOpenChange={(o) => !o && setFolderToDelete(null)}>
        <DialogContent className="max-w-sm border-line-subtle bg-surface-panel shadow-overlay">
          <DialogHeader><DialogTitle>Delete folder?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary mt-1">Scores in this folder will remain in your library.</p>
          <DialogFooter className="mt-4">
            <Button intent="secondary" size="sm" onClick={() => setFolderToDelete(null)}>Cancel</Button>
            <Button intent="danger" size="sm" onClick={() => { deleteFolder(folderToDelete); if (activeFolderId === folderToDelete) setParam('view', 'all'); setFolderToDelete(null); }}>Delete folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ active, isTrash }) {
  if (isTrash) {
    return (
      <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-line-subtle bg-surface-panel py-20 text-center">
        <Trash2 className="h-8 w-8 text-ink-tertiary" />
        <h2 className="mt-3 type-section-title text-ink-primary">Trash is empty</h2>
        <p className="mt-1.5 max-w-sm type-body-small text-ink-secondary">Scores you remove go here first. You can restore them anytime within 30 days.</p>
      </div>
    );
  }
  if (active === 'all') {
    return (
      <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-line-subtle bg-surface-panel py-20 text-center">
        <h2 className="type-section-title text-ink-primary">Start with something you love.</h2>
        <p className="mt-2 max-w-sm type-body-small text-ink-secondary">
          Add sheet music you have always wanted to play — whether scan, photo, or MusicXML.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Button intent="primary" size="md" asChild>
            <Link to="/add-score">
              <Plus className="icon-sm" />
              <span>Add sheet music</span>
            </Link>
          </Button>
          <span className="type-caption text-ink-tertiary">or</span>
          <Button intent="secondary" size="md" asChild>
            <Link to="/score/moonlight">
              Explore Moonlight Sonata
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  const labels = { mine: 'your own scores', shared: 'scores shared with you', saved: 'saved scores', favorites: 'favorites' };
  return (
    <div className="flex flex-col items-center justify-center rounded-container border border-dashed border-line-subtle bg-surface-panel py-20 text-center">
      <h2 className="type-section-title text-ink-primary">Nothing here yet</h2>
      <p className="mt-1.5 max-w-sm type-body-small text-ink-secondary">This is where {labels[active] || 'these scores'} will appear.</p>
      <Button intent="primary" size="md" className="mt-5" asChild>
        <Link to="/add-score">
          <Plus className="icon-sm" />
          <span>Add a score</span>
        </Link>
      </Button>
    </div>
  );
}
