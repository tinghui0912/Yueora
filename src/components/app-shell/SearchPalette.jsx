import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { scores, folders } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SearchPalette({ open, onOpenChange }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { scores: [], folders: [] };
    return {
      scores: scores.filter(
        (s) => s.title.toLowerCase().includes(query) || s.composer.toLowerCase().includes(query)
      ),
      folders: folders.filter((f) => f.name.toLowerCase().includes(query)),
    };
  }, [q]);

  const go = (path) => {
    onOpenChange(false);
    setQ('');
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search scores, folders…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!q.trim() && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type to search your music.
            </div>
          )}
          {q.trim() && results.scores.length === 0 && results.folders.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</div>
          )}
          {results.scores.length > 0 && (
            <div className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scores</div>
          )}
          {results.scores.map((s) => (
            <button
              key={s.id}
              onClick={() => go(`/score/${s.id}`)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-accent"
            >
              <span className="text-sm font-medium">{s.title}</span>
              <span className="text-xs text-muted-foreground">{s.composer}</span>
            </button>
          ))}
          {results.folders.length > 0 && (
            <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folders</div>
          )}
          {results.folders.map((f) => (
            <button
              key={f.id}
              onClick={() => go(`/library?folder=${encodeURIComponent(f.name)}`)}
              className="flex w-full items-center rounded-md px-3 py-2 text-left hover:bg-accent"
            >
              <span className="text-sm font-medium">{f.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}