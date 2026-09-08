import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Music2, Smile } from 'lucide-react';
import { practiceProgress, getScore } from '@/lib/mockData';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PracticeProgress() {
  const { weeklyMinutes, piecesPlayed, sessions, tempoTrend, recurringTricky, smoother } = practiceProgress;
  const max = Math.max(...weeklyMinutes);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground">← Practice</Link>
      <h1 className="mt-3 font-display text-2xl font-medium">Progress</h1>
      <p className="mt-1 text-sm text-muted-foreground">A calm look at how things are going — no grades, no rankings.</p>

      {/* Overview */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <Clock className="h-4 w-4 text-primary" />
          <p className="mt-2 font-display text-2xl font-medium">{weeklyMinutes.reduce((a, b) => a + b, 0)}<span className="text-base text-muted-foreground"> min</span></p>
          <p className="text-xs text-muted-foreground">this week</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <Music2 className="h-4 w-4 text-primary" />
          <p className="mt-2 font-display text-2xl font-medium">{piecesPlayed}</p>
          <p className="text-xs text-muted-foreground">pieces played</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="mt-2 font-display text-2xl font-medium">{sessions}</p>
          <p className="text-xs text-muted-foreground">sessions</p>
        </div>
      </div>

      {/* Time played trend */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time played</h2>
        <div className="mt-3 rounded-md border border-border bg-card p-5">
          <div className="flex h-40 items-end justify-between gap-2">
            {weeklyMinutes.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${(m / max) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tempo progression */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo progression</h2>
        <div className="mt-3 space-y-3">
          {tempoTrend.map((t) => (
            <div key={t.scoreId} className="rounded-md border border-border bg-card p-4">
              <Link to={`/score/${t.scoreId}`} className="font-medium hover:underline">{t.label}</Link>
              <div className="mt-2 flex items-center gap-1">
                {t.values.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div className="w-full rounded-t bg-accent" style={{ height: `${(v / 80) * 60}px` }} />
                    <span className="mt-1 text-[10px] text-muted-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-primary">+{t.values[t.values.length - 1] - t.values[0]} BPM over recent sessions</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recurring tricky sections */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recurring tricky sections</h2>
        <div className="mt-3 space-y-2">
          {recurringTricky.map((t) => (
            <Link key={t.scoreId} to={`/score/${t.scoreId}`} className="block rounded-md border border-border bg-card p-4 hover:bg-accent/40">
              <p className="font-medium">{getScore(t.scoreId)?.title} · {t.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{t.note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Becoming smoother */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Becoming smoother</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {smoother.map((s) => (
            <div key={s.scoreId} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
              <Smile className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}