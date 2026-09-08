import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { practiceHistory, getScore } from '@/lib/mockData';

export default function PracticeHistory() {
  const groups = {};
  practiceHistory.forEach((s) => { (groups[s.date] = groups[s.date] || []).push(s); });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground">← Practice</Link>
      <h1 className="mt-3 font-display text-2xl font-medium">Practice history</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every session you’ve played, most recent first.</p>

      <div className="mt-6 space-y-6">
        {Object.entries(groups).map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{date}</h2>
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {items.map((s) => {
                const score = getScore(s.scoreId);
                return (
                  <Link key={s.id} to={`/practice/${s.id}/summary`} className="flex items-center gap-4 p-4 hover:bg-accent/40">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{score?.title || s.scoreId}</p>
                      <p className="text-sm text-muted-foreground">{score?.composer} · {s.range}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.insight}</p>
                    </div>
                    <div className="shrink-0 text-right text-sm text-muted-foreground">
                      <p>{s.duration}</p>
                      <p className="text-xs">{s.mode} · {s.input}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}