import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { imports as seed } from '@/lib/mockData';
import { ChevronRight } from 'lucide-react';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'needs_review', label: 'Needs review' },
  { key: 'failed', label: 'Failed' },
  { key: 'completed', label: 'Completed' },
];

const statusStyle = {
  processing: 'text-primary',
  needs_review: 'text-gold',
  failed: 'text-destructive',
  completed: 'text-muted-foreground',
};
const statusLabel = {
  processing: 'Processing',
  needs_review: 'Needs review',
  failed: 'Recognition failed',
  completed: 'Completed',
};
const nextAction = {
  processing: 'Processing your score…',
  needs_review: 'Review recognition',
  failed: 'See what happened',
  completed: 'Open score',
};

export default function Imports() {
  const [items, setItems] = useState(seed);
  const [tab, setTab] = useState('all');
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setItems((prev) => prev.map((i) => {
        if (i.status !== 'processing') return i;
        const next = Math.min(100, i.progress + Math.floor(5 + Math.random() * 9));
        if (next >= 100) return { ...i, progress: 100, status: 'needs_review' };
        return { ...i, progress: next };
      }));
    }, 1200);
    return () => clearInterval(timer.current);
  }, []);

  const list = tab === 'all' ? items : items.filter((i) => i.status === tab);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="font-display text-2xl font-medium">Imports</h1>
      <p className="mt-1 text-sm text-muted-foreground">How are your recently added scores doing? Add new scores from the Add score button.</p>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {list.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
            <p className="font-medium">No imports here</p>
            <p className="max-w-sm text-sm text-muted-foreground">Scores you add will show their recognition progress here. To add music, use the Add score button.</p>
            <Link to="/add-score" className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Add a score</Link>
          </div>
        )}
        {list.map((imp) => (
          <Link key={imp.id} to={`/imports/${imp.id}`} className="block rounded-md border border-border bg-card p-4 hover:bg-accent/40">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{imp.title}</p>
                <p className="text-sm text-muted-foreground">Started {imp.started} · {imp.pages} pages · {imp.source}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`text-sm font-medium ${statusStyle[imp.status]}`}>{statusLabel[imp.status]}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {imp.status === 'processing' && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Recognizing notation…</span><span>{imp.progress}%</span></div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${imp.progress}%` }} /></div>
              </div>
            )}
            {imp.status === 'failed' && <p className="mt-2 text-sm text-destructive">{imp.failure}</p>}
            <p className="mt-2 text-sm text-primary">{nextAction[imp.status]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}