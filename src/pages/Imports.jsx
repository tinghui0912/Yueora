import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { imports as seed } from '@/lib/mockData';
import ImportDropzone from '@/components/imports/ImportDropzone';

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

export default function Imports() {
  const [items, setItems] = useState(seed);
  const [tab, setTab] = useState('all');
  const timer = useRef(null);

  // Simulate live progress for processing imports
  useEffect(() => {
    timer.current = setInterval(() => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.status !== 'processing') return i;
          const next = Math.min(100, i.progress + Math.floor(5 + Math.random() * 9));
          if (next >= 100) return { ...i, progress: 100, status: 'needs_review' };
          return { ...i, progress: next };
        })
      );
    }, 1200);
    return () => clearInterval(timer.current);
  }, []);

  const addImport = ({ title }) => {
    const id = `imp-${Date.now()}`;
    setItems((prev) => [
      { id, title, status: 'processing', progress: 4, started: 'just now' },
      ...prev,
    ]);
    setTab('all');
  };

  const retry = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 5, failure: undefined } : i)));

  const dismiss = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const list = tab === 'all' ? items : items.filter((i) => i.status === tab);

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-2xl font-medium">Imports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Add sheet music and track recognition as it runs.</p>

      <div className="mt-5">
        <ImportDropzone onImport={addImport} />
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nothing here.</p>}
        {list.map((imp) => (
          <div key={imp.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{imp.title}</p>
                <p className="text-sm text-muted-foreground">Started {imp.started}</p>
              </div>
              <span className={`shrink-0 text-sm font-medium ${statusStyle[imp.status]}`}>{statusLabel[imp.status]}</span>
            </div>

            {imp.status === 'processing' && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Recognizing notation…</span>
                  <span>{imp.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${imp.progress}%` }} />
                </div>
              </div>
            )}

            {imp.status === 'failed' && <p className="mt-2 text-sm text-muted-foreground">{imp.failure}</p>}

            <div className="mt-3 flex gap-2">
              {imp.status === 'needs_review' && (
                <Link to={`/score/${imp.id.replace('imp-', '')}/edit`} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  Review & edit
                </Link>
              )}
              {imp.status === 'failed' && (
                <button onClick={() => retry(imp.id)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                  Try again
                </button>
              )}
              {imp.status === 'completed' && (
                <Link to="/library" className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                  View in library
                </Link>
              )}
              <button onClick={() => dismiss(imp.id)} className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}