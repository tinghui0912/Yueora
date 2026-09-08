import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LayoutGrid, List, Plus, SlidersHorizontal, ArrowUpDown, Play } from 'lucide-react';
import { scores as allScores, folders, practiceHub } from '@/lib/mockData';
import ScoreCard from '@/components/library/ScoreCard';
import ScorePreview from '@/components/library/ScorePreview';
import LibrarySubRail from '@/components/library/LibrarySubRail';

const ownershipFilter = {
  all: () => true,
  mine: (s) => s.ownership === 'mine',
  shared: (s) => s.ownership === 'shared',
  saved: (s) => s.ownership === 'saved',
  favorites: (s) => s.favorite,
  to_practice: (s) => s.practiceState.status === 'to_practice',
  recently_practiced: (s) => s.practiceState.status === 'recently_practiced',
  mastered: (s) => s.practiceState.status === 'mastered',
};

export default function Library() {
  const [params, setParams] = useSearchParams();
  const active = params.get('view') || 'all';
  const folder = params.get('folder');
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'recent';
  const view = params.get('layout') || 'grid';
  const [searchInput, setSearchInput] = useState(search);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = allScores.filter(ownershipFilter[active] || (() => true));
    if (folder) list = list.filter((s) => folders.some((f) => f.name === folder && s.folderIds.includes(f.id)));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.composer.toLowerCase().includes(q));
    }
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'composer') list = [...list].sort((a, b) => a.composer.localeCompare(b.composer));
    return list;
  }, [active, folder, search, sort]);

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex">
      <LibrarySubRail active={active} onSelect={(k) => setParam('view', k)} />

      <div className="min-w-0 flex-1">
        <Link
          to={`/score/${practiceHub.continuePractice.scoreId}/practice`}
          className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-accent px-4 py-3 md:mx-8"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">Continue practicing</p>
            <p className="truncate font-display text-lg font-medium">{practiceHub.continuePractice.title} — {practiceHub.continuePractice.composer}</p>
            <p className="text-sm text-muted-foreground">Measure {practiceHub.continuePractice.measure} · last practiced {practiceHub.continuePractice.lastPracticed}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" /> Resume
          </span>
        </Link>

        <div className="border-b border-border px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-medium">Library</h1>
              <p className="text-sm text-muted-foreground">{allScores.length} scores{folder ? ` · ${folder}` : ''}</p>
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
              <button className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent">
                <SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent">
                <ArrowUpDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort</span>
              </button>
              <div className="flex h-9 items-center rounded-md border border-border p-0.5">
                <button
                  onClick={() => setParam('layout', 'grid')}
                  className={`flex h-8 w-8 items-center justify-center rounded ${view === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setParam('layout', 'list')}
                  className={`flex h-8 w-8 items-center justify-center rounded ${view === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 md:px-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
              <h2 className="font-display text-2xl font-medium">Your library starts here</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Add your first score and turn it into something you can practice.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                <Link to="/add-score" className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add a score
                </Link>
                <span className="text-sm text-muted-foreground">or</span>
                <Link to="/score/moonlight" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">
                  Explore a sample score
                </Link>
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((s) => (
                <ScoreCard key={s.id} score={s} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {filtered.map((s) => (
                <Link key={s.id} to={`/score/${s.id}`} className="flex items-center gap-4 p-3 hover:bg-accent/40">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-border">
                    <ScorePreview id={s.id} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{s.composer} · {s.instrument}</p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {s.practiceState.lastPracticed === 'never' ? 'Not practiced' : `Practiced ${s.practiceState.lastPracticed}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}