import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Music2, Bell, Settings, Folder, Inbox, Clock, ArrowRight } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const commands = [
  { label: 'Add score', path: '/add-score', icon: Plus },
  { label: 'Go to Practice', path: '/practice', icon: Music2 },
  { label: 'Open notifications', path: '/notifications', icon: Bell },
  { label: 'Open settings', path: '/settings/account', icon: Settings },
  { label: 'View imports', path: '/imports', icon: Inbox },
  { label: 'Practice history', path: '/practice/history', icon: Clock },
];

export default function SearchPalette({ open, onOpenChange }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const scores = usePrototypeStore((s) => s.scores);
  const folders = usePrototypeStore((s) => s.folders);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { scores: [], folders: [], commands: [] };
    return {
      scores: scores.filter((s) => s.ownership !== 'trash' && (s.title.toLowerCase().includes(query) || s.composer.toLowerCase().includes(query))),
      folders: folders.filter((f) => f.name.toLowerCase().includes(query)),
      commands: commands.filter((c) => c.label.toLowerCase().includes(query)),
    };
  }, [q]);

  const go = (path) => { onOpenChange(false); setQ(''); navigate(path); };

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
     
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only"><DialogTitle>Search</DialogTitle></DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scores, folders, or commands…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {!q.trim() && (
            <div>
              <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</p>
              {commands.map((c) => (
                <button key={c.label} onClick={() => go(c.path)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent">
                  <c.icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{c.label}</span>
                </button>
              ))}
              <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent scores</p>
              {scores.filter((s) => s.ownership !== 'trash').slice(0, 3).map((s) => (
                <button key={s.id} onClick={() => go(`/score/${s.id}`)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-accent">
                  <span className="text-sm font-medium">{s.title}</span><span className="text-xs text-muted-foreground">{s.composer}</span>
                </button>
              ))}
            </div>
          )}
          {q.trim() && results.scores.length === 0 && results.folders.length === 0 && results.commands.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</div>
          )}
          {results.commands.length > 0 && <div className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commands</div>}
          {results.commands.map((c) => (
            <button key={c.label} onClick={() => go(c.path)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent">
              <c.icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{c.label}</span><ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
          {results.scores.length > 0 && <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scores</div>}
          {results.scores.map((s) => (
            <button key={s.id} onClick={() => go(`/score/${s.id}`)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-accent">
              <span className="text-sm font-medium">{s.title}</span><span className="text-xs text-muted-foreground">{s.composer}</span>
            </button>
          ))}
          {results.folders.length > 0 && <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folders</div>}
          {results.folders.map((f) => (
            <button key={f.id} onClick={() => go(`/library?view=folder:${f.id}`)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-accent">
              <Folder className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{f.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}