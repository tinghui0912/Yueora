import { Link } from 'react-router-dom';
import { ChevronRight, Music } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import PageHeader from '@/components/patterns/PageHeader';
import StateMessage from '@/components/patterns/StateMessage';

export default function PracticeHistory() {
  const sessions = usePrototypeStore((s) => s.practiceSessions);
  const scores = usePrototypeStore((s) => s.scores);

  const groups = {};
  sessions.forEach((s) => { (groups[s.date] = groups[s.date] || []).push(s); });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
      <div className="mt-3">
        <PageHeader
          title="Practice history"
          description="Every session you've played, most recent first."
        />
      </div>

      {sessions.length === 0 ? (
        <StateMessage
          tone="neutral"
          icon={Music}
          title="No sessions yet"
          description="When you practice, your sessions will show up here."
          primaryAction={
            <Link to="/practice" className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Go to Practice
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 type-caption text-ink-tertiary">{date}</h2>
              <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
                {items.map((s) => {
                  const score = scores.find((sc) => sc.id === s.scoreId);
                  return (
                    <Link key={s.id} to={`/practice/${s.id}/summary`} className="flex items-center gap-4 p-4 hover:bg-accent/40">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink-primary">{score?.title || s.scoreId}</p>
                        <p className="type-body-small text-ink-tertiary">{score?.composer} · {s.range}</p>
                        <p className="mt-1 type-body-small text-ink-secondary">{s.insight}</p>
                      </div>
                      <div className="shrink-0 text-right type-body-small text-ink-tertiary">
                        <p>{s.duration}</p>
                        <p className="type-metadata">{s.mode} · {s.input}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}