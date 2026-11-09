import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Inbox } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import StateMessage from '@/components/patterns/StateMessage';
import StatusIndicator from '@/components/patterns/StatusIndicator';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'needs_review', label: 'Needs review' },
  { key: 'failed', label: 'Failed' },
  { key: 'completed', label: 'Completed' },
];

const statusTone = {
  processing: 'brand',
  needs_review: 'warning',
  failed: 'danger',
  completed: 'success',
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
  const items = usePrototypeStore((s) => s.imports);
  const advanceImportProgress = usePrototypeStore((s) => s.advanceImportProgress);
  const [tab, setTab] = useState('all');
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => advanceImportProgress(), 1200);
    return () => clearInterval(timer.current);
  }, [advanceImportProgress]);

  const list = tab === 'all' ? items : items.filter((i) => i.status === tab);

  return (
    <AppPage size="standard">
      <PageHeader
        title="Imports"
        description="How are your recently added scores doing? Add new scores from the Add score button."
      />

      <div className="mt-5 flex flex-wrap gap-1 border-b border-line-subtle">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 type-body-small transition-colors ${tab === t.key ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-secondary hover:text-ink-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <StateMessage
            tone="neutral"
            icon={Inbox}
            title="No imports yet"
            description="Scores you add will show recognition progress here."
            primaryAction={
              <Link to="/add-score" className="rounded-control bg-brand px-4 py-2 type-body-small font-semibold text-white hover:bg-brand-hover">
                Add a score
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel shadow-xs overflow-hidden">
          {list.map((imp) => (
            <Link key={imp.id} to={`/imports/${imp.id}`} className="block p-4 transition-colors hover:bg-neutral-hover">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-primary">{imp.title}</p>
                  <p className="type-body-small text-ink-tertiary">Started {imp.started} · {imp.pages} pages · {imp.source}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusIndicator tone={statusTone[imp.status]} label={statusLabel[imp.status]} pulse={imp.status === 'processing'} />
                  <ChevronRight className="h-4 w-4 text-ink-tertiary" />
                </div>
              </div>
              {imp.status === 'processing' && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between type-metadata text-ink-tertiary"><span>Recognizing notation…</span><span>{imp.progress}%</span></div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-muted"><div className="h-full rounded-full bg-brand transition-all duration-1000" style={{ width: `${imp.progress}%` }} /></div>
                </div>
              )}
              {imp.status === 'failed' && <p className="mt-2 type-body-small text-danger">{imp.failure}</p>}
              <p className="mt-2 type-body-small text-brand">{nextAction[imp.status]}</p>
            </Link>
          ))}
        </div>
      )}
    </AppPage>
  );
}