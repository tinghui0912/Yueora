import { Link } from 'react-router-dom';
import { Play, AlertTriangle, ChevronRight } from 'lucide-react';
import { practiceHub, getScore } from '@/lib/mockData';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PracticeHub() {
  const { continuePractice, queue, weekly, needsAttention } = practiceHub;

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-2xl font-medium">Practice</h1>
      <p className="mt-1 text-sm text-muted-foreground">Today</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Continue practicing</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-medium">{continuePractice.title}</h2>
              <p className="text-sm text-muted-foreground">{continuePractice.composer} · Last practiced {continuePractice.lastPracticed}</p>
              <p className="mt-1 text-sm text-primary">Continue from measure {continuePractice.measure}</p>
            </div>
            <Link
              to={`/score/${continuePractice.scoreId}/practice`}
              className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Continue
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This week</p>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <p className="font-display text-3xl font-medium">{weekly.minutes}<span className="text-base text-muted-foreground"> min</span></p>
              <p className="text-xs text-muted-foreground">{weekly.daysPracticed} days · {weekly.scores} scores</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            {days.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className={`h-2.5 w-2.5 rounded-full ${weekly.marks[i] ? 'bg-primary' : 'bg-muted'}`} />
                <span className="text-xs text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your practice queue</p>
          <div className="mt-3 divide-y divide-border">
            {queue.map((item) => (
              <Link key={item.scoreId} to={`/score/${item.scoreId}/practice`} className="flex items-center justify-between py-3 group">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.composer} · {item.reason}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Needs attention</p>
          <div className="mt-3 space-y-3">
            {needsAttention.map((n) => (
              <div key={n.scoreId} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-gold" />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.section} · {n.accuracy}% accuracy</p>
                  </div>
                </div>
                <Link to={`/score/${n.scoreId}/practice`} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  Practice section
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}