import { Link } from 'react-router-dom';
import { Play, ChevronRight, Clock, BarChart3 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import ScorePreview from '@/components/library/ScorePreview';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PracticeHub() {
  const scores = usePrototypeStore((s) => s.scores);
  const sessions = usePrototypeStore((s) => s.practiceSessions);

  // Pick up where you left off — most recently played score
  const playedScores = scores.filter((s) => s.ownership !== 'trash' && s.lastPlayed && s.lastPlayed !== 'never');
  const continueScore = playedScores.length > 0
    ? playedScores.sort((a, b) => {
        const order = { today: -1, yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5 };
        return (order[a.lastPlayed] ?? 50) - (order[b.lastPlayed] ?? 50);
      })[0]
    : null;

  // Recently loved — favorites
  const recentlyLoved = scores.filter((s) => s.ownership !== 'trash' && s.favorite).slice(0, 3).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, reason: 'Favorited',
  }));

  // Haven't played in a while
  const havenPlayed = scores.filter((s) => s.ownership !== 'trash' && (!s.lastPlayed || s.lastPlayed === 'never' || s.lastPlayed === 'last week')).slice(0, 2).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, lastPlayed: s.lastPlayed || 'never',
  }));

  // Tricky section — from most recent session
  const recentTricky = sessions.find((s) => s.trickyFrom && s.trickyTo);
  const trickyScore = recentTricky ? scores.find((s) => s.id === recentTricky.scoreId) : null;
  const trickySection = recentTricky && trickyScore
    ? { scoreId: trickyScore.id, title: trickyScore.title, from: recentTricky.trickyFrom, to: recentTricky.trickyTo, label: `Measures ${recentTricky.trickyFrom}–${recentTricky.trickyTo}`, note: 'This section felt trickier last time.' }
    : null;

  // This week stats
  const thisWeekMinutes = sessions.slice(0, 7).reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
  const thisWeekSessions = Math.min(sessions.length, 7);
  const thisWeekPieces = new Set(sessions.slice(0, 7).map((s) => s.scoreId)).size;
  const thisWeekMarks = days.map((_, i) => i < Math.min(sessions.length, 7));

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-tight">What do you feel like playing?</h1>

      {/* Section 1 — pick up where you left off */}
      {continueScore && (
        <section className="mt-8">
          <h2 className="type-caption text-ink-tertiary">Pick up where you left off</h2>
          <Link to={`/score/${continueScore.id}/practice`} className="mt-3 flex flex-col gap-4 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-border"><ScorePreview id={continueScore.id} className="h-full w-full" /></div>
              <div>
                <p className="font-display text-xl font-medium">{continueScore.title}</p>
                <p className="text-sm text-muted-foreground">{continueScore.composer} · last played {continueScore.lastPlayed}</p>
                <p className="mt-0.5 text-sm text-primary">Continue from measure {continueScore.lastMeasure}</p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 self-start rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:self-center">
              <Play className="h-4 w-4" /> Continue
            </span>
          </Link>
        </section>
      )}

      {/* Section 2 — recently loved */}
      {recentlyLoved.length > 0 && (
        <section className="mt-10">
          <h2 className="type-caption text-ink-tertiary">Recently loved</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyLoved.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="group flex items-center gap-3 rounded-md border border-border bg-card p-3 hover:bg-accent/40">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded border border-border"><ScorePreview id={r.scoreId} className="h-full w-full" /></div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{r.composer}</p>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 3 — haven't played in a while */}
      {havenPlayed.length > 0 && (
        <section className="mt-10">
          <h2 className="type-caption text-ink-tertiary">Haven't played in a while</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {havenPlayed.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="group flex items-center justify-between rounded-md border border-border bg-card p-4 hover:bg-accent/40">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.composer} · last played {r.lastPlayed}</p>
                  <p className="mt-1 text-sm text-primary">Feel like revisiting this one?</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 4 — tricky section */}
      {trickySection && (
        <section className="mt-10">
          <h2 className="type-caption text-ink-tertiary">Want to try this part again?</h2>
          <div className="mt-3 rounded-md border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-medium">{trickySection.title}</p>
                <p className="text-sm text-muted-foreground">{trickySection.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{trickySection.note}</p>
              </div>
              <Link to={`/score/${trickySection.scoreId}/practice`} state={{ range: 'selected', rangeFrom: trickySection.from, rangeTo: trickySection.to }} className="flex shrink-0 items-center gap-1.5 self-start rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Try this section
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!continueScore && recentlyLoved.length === 0 && havenPlayed.length === 0 && !trickySection && (
        <section className="mt-8">
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
            <p className="font-display text-xl font-medium">Welcome to Practice</p>
            <p className="max-w-sm text-sm text-muted-foreground">When you start practicing, you'll find your music here — where you left off, pieces you love, and sections to revisit.</p>
            <Link to="/library" className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Browse your library</Link>
          </div>
        </section>
      )}

      {/* Section 5 — this week */}
      <section className="mt-10">
        <h2 className="type-caption text-ink-tertiary">This week</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="font-display text-2xl font-medium">{thisWeekMinutes}<span className="text-base text-muted-foreground"> min</span></p>
            <p className="text-xs text-muted-foreground">across {thisWeekSessions} sessions</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="font-display text-2xl font-medium">{thisWeekPieces}</p>
            <p className="text-xs text-muted-foreground">pieces played</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex justify-between">
              {days.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${thisWeekMarks[i] ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-[10px] text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{thisWeekMarks.filter(Boolean).length} days</p>
          </div>
        </div>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        <Link to="/practice/history" className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"><Clock className="h-4 w-4" /> Practice history</Link>
        <Link to="/practice/progress" className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"><BarChart3 className="h-4 w-4" /> Progress</Link>
      </section>
    </div>
  );
}