import { Link } from 'react-router-dom';
import { Play, ChevronRight, Clock } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { practiceWeek } from '@/lib/practiceStats';
import ScorePreview from '@/components/library/ScorePreview';
import MusicPaper from '@/components/patterns/MusicPaper';
import { PracticeGlyph } from '@/components/brand/MusicalGlyphs';

export default function PracticeHub() {
  const scores = usePrototypeStore((s) => s.scores);
  const activities = usePrototypeStore((s) => s.practiceActivities) || [];

  // Pick up where you left off — most recently played score
  const playedScores = scores.filter((s) => s.ownership !== 'trash' && s.lastPlayed && s.lastPlayed !== 'never');
  const continueScore = playedScores.length > 0
    ? [...playedScores].sort((a, b) => {
        const order = { today: -1, yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5 };
        return (order[a.lastPlayed] ?? 50) - (order[b.lastPlayed] ?? 50);
      })[0]
    : null;

  // Recently loved — favorites
  const recentlyLoved = scores.filter((s) => s.ownership !== 'trash' && s.favorite).slice(0, 3).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, reason: 'Favorited score',
  }));

  // Haven't played in a while
  const havenPlayed = scores.filter((s) => s.ownership !== 'trash' && (!s.lastPlayed || s.lastPlayed === 'never' || s.lastPlayed === 'last week')).slice(0, 2).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, lastPlayed: s.lastPlayed || 'never',
  }));

  // This week — reflective calendar reflection without streak judgment
  const week = practiceWeek(activities);
  const thisWeekMinutes = week.totalMinutes;
  const thisWeekSessions = week.sessions;
  const thisWeekPieces = week.pieces;
  const thisWeekMarks = week.days.map((d) => d.sessions > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink-primary sm:text-4xl">
          What do you feel like playing?
        </h1>
        <p className="mt-1 text-sm text-ink-secondary leading-relaxed">
          A quiet space to play. No streaks, no assignments, no pressure.
        </p>
      </div>

      {/* Pick up where you left off */}
      {continueScore && (
        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">
            Pick up where you left off
          </p>
          <div className="mt-3">
            <MusicPaper
              interactive
              tone="warm"
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-surface-paper-edge bg-white/95">
                  <ScorePreview id={continueScore.id} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-medium text-ink-primary truncate">
                    {continueScore.title}
                  </h2>
                  <p className="type-metadata text-ink-secondary mt-0.5">
                    {continueScore.composer} · played {continueScore.lastPlayed}
                  </p>
                  <p className="mt-1 type-metadata font-medium text-brand">
                    Continue from bar {continueScore.lastMeasure}
                  </p>
                </div>
              </div>
              <Link
                to={`/score/${continueScore.id}/setup`}
                className="flex shrink-0 items-center gap-2 self-start rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover active:scale-[0.98] sm:self-center"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Continue playing</span>
              </Link>
            </MusicPaper>
          </div>
        </section>
      )}

      {/* Recently loved */}
      {recentlyLoved.length > 0 && (
        <section className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">
            Recently loved
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyLoved.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="block">
                <MusicPaper interactive tone="natural" className="flex items-center gap-3.5 p-3.5">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded border border-surface-paper-edge bg-white">
                    <ScorePreview id={r.scoreId} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display font-medium text-ink-primary">{r.title}</p>
                    <p className="truncate type-metadata text-ink-secondary mt-0.5">{r.composer}</p>
                    <span className="inline-block mt-1 text-xs font-medium text-brand">Revisit piece →</span>
                  </div>
                </MusicPaper>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Haven't played in a while */}
      {havenPlayed.length > 0 && (
        <section className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">
            Haven't played in a while
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {havenPlayed.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="block">
                <MusicPaper interactive tone="natural" className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-display font-medium text-ink-primary">{r.title}</p>
                    <p className="type-metadata text-ink-secondary mt-0.5">{r.composer} · last played {r.lastPlayed}</p>
                    <p className="mt-1 text-sm text-brand font-medium">Feel like revisiting this one?</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-tertiary" />
                </MusicPaper>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!continueScore && recentlyLoved.length === 0 && havenPlayed.length === 0 && (
        <section className="mt-8">
          <MusicPaper tone="natural" className="flex flex-col items-center gap-3 p-12 text-center">
            <PracticeGlyph className="h-8 w-8 text-brand" />
            <h2 className="font-display text-xl font-medium text-ink-primary">Welcome to Practice</h2>
            <p className="max-w-sm text-xs leading-relaxed text-ink-secondary">
              When you practice, you will find your music here — where you left off, pieces you love, and musical moments to revisit.
            </p>
            <Link
              to="/library"
              className="mt-3 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
            >
              Browse your Repertoire
            </Link>
          </MusicPaper>
        </section>
      )}

      {/* Reflective Time Spent Playing */}
      <section className="mt-12 pt-8 border-t border-line-subtle">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">
          This Week in Music
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <MusicPaper tone="natural" className="p-4">
            <p className="font-display text-2xl font-medium text-ink-primary">
              {thisWeekMinutes} <span className="text-sm font-normal text-ink-secondary">min</span>
            </p>
            <p className="type-metadata text-ink-secondary mt-1">across {thisWeekSessions} calm sessions</p>
          </MusicPaper>

          <MusicPaper tone="natural" className="p-4">
            <p className="font-display text-2xl font-medium text-ink-primary">
              {thisWeekPieces}
            </p>
            <p className="type-metadata text-ink-secondary mt-1">pieces brought to life</p>
          </MusicPaper>

          <MusicPaper tone="natural" className="p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center pt-1">
              {week.days.map((d, i) => (
                <div key={d.key} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${thisWeekMarks[i] ? 'bg-brand' : 'bg-surface-paper-edge'}`}
                  />
                  <span className="text-xs font-medium text-ink-secondary">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="type-metadata text-ink-secondary mt-2">
              {thisWeekMarks.filter(Boolean).length} days of music
            </p>
          </MusicPaper>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/practice/history"
            className="inline-flex items-center gap-2 rounded-control border border-surface-paper-edge bg-surface-paper px-3.5 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-paper-warm transition-colors"
          >
            <Clock className="h-4 w-4" />
            <span>Practice history</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
