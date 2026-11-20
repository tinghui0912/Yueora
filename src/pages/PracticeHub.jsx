import { Link } from 'react-router-dom';
import { Play, ChevronRight, Clock, BarChart2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { practiceWeek } from '@/lib/practiceStats';
import ScorePreview from '@/components/library/ScorePreview';
import AppPage from '@/components/patterns/AppPage';
import { Surface } from '@/components/patterns/Surface';
import { Button } from '@/components/ui/button';
import { PracticeGlyph } from '@/components/brand/MusicalGlyphs';

export default function PracticeHub() {
  const scores = usePrototypeStore((s) => s.scores);
  const activities = usePrototypeStore((s) => s.practiceActivities) || [];
  const activeScores = scores.filter((s) => s.ownership !== 'trash');

  // Pick up where you left off — most recently played score
  const playedScores = activeScores.filter((s) => s.lastPlayed && s.lastPlayed !== 'never');
  const continueScore = playedScores.length > 0
    ? [...playedScores].sort((a, b) => {
        const order = { today: -1, yesterday: 0, '2 days ago': 1, '3 days ago': 2, '4 days ago': 3, '5 days ago': 4, 'last week': 5 };
        return (order[a.lastPlayed] ?? 50) - (order[b.lastPlayed] ?? 50);
      })[0]
    : null;

  // Recently loved — favorites
  const recentlyLoved = activeScores.filter((s) => s.favorite).slice(0, 3).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, reason: 'Favorited score',
  }));

  // Haven't played in a while
  const havenPlayed = activeScores.filter((s) => (!s.lastPlayed || s.lastPlayed === 'never' || s.lastPlayed === 'last week')).slice(0, 2).map((s) => ({
    scoreId: s.id, title: s.title, composer: s.composer, lastPlayed: s.lastPlayed || 'never',
  }));

  // This week — reflective calendar reflection without streak judgment
  const week = practiceWeek(activities);
  const thisWeekMinutes = week.totalMinutes;
  const thisWeekSessions = week.sessions;
  const thisWeekPieces = week.pieces;
  const thisWeekMarks = week.days.map((d) => d.sessions > 0);

  return (
    <AppPage size="standard" className="py-7 sm:py-8">
      {/* Title */}
      <div>
        <p className="type-caption text-ink-tertiary">
          Practice Space
        </p>
        <h1 className="mt-1 type-page-title text-ink-primary tracking-tight">
          What do you feel like playing?
        </h1>
        <p className="mt-1 type-metadata text-ink-secondary">
          A quiet space to play. No streaks, no assignments, no pressure.
        </p>
      </div>

      {/* Pick up where you left off */}
      {continueScore && (
        <section className="mt-7">
          <p className="type-caption text-ink-tertiary">
            Pick up where you left off
          </p>
          <div className="mt-2.5">
            <Surface
              tone="panel"
              interactive
              className="flex flex-col gap-3.5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-control border border-line-subtle bg-surface-canvas">
                  <ScorePreview id={continueScore.id} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate type-section-title text-ink-primary">
                    {continueScore.title}
                  </h2>
                  <p className="type-metadata text-ink-secondary mt-0.5">
                    {continueScore.composer} · played {continueScore.lastPlayed}
                  </p>
                  <p className="mt-1 type-metadata font-medium text-accent">
                    Continue from bar {continueScore.lastMeasure}
                  </p>
                </div>
              </div>
              <Button intent="primary" size="sm" className="shrink-0 self-start sm:self-center" asChild>
                <Link to={`/score/${continueScore.id}/setup`}>
                  <Play className="icon-xs fill-current mr-1.5" />
                  <span>Continue playing</span>
                </Link>
              </Button>
            </Surface>
          </div>
        </section>
      )}

      {/* Recently loved */}
      {recentlyLoved.length > 0 && (
        <section className="mt-8">
          <p className="type-caption text-ink-tertiary">
            Recently loved
          </p>
          <div className="mt-2.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyLoved.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="block">
                <Surface tone="panel" interactive className="flex items-center gap-3 p-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-control border border-line-subtle bg-surface-canvas">
                    <ScorePreview id={r.scoreId} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate type-subsection text-ink-primary">{r.title}</p>
                    <p className="truncate type-metadata text-ink-secondary mt-0.5">{r.composer}</p>
                    <span className="inline-block mt-1 type-metadata font-medium text-brand">Revisit piece →</span>
                  </div>
                </Surface>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Haven't played in a while */}
      {havenPlayed.length > 0 && (
        <section className="mt-8">
          <p className="type-caption text-ink-tertiary">
            Haven't played in a while
          </p>
          <div className="mt-2.5 grid gap-3.5 sm:grid-cols-2">
            {havenPlayed.map((r) => (
              <Link key={r.scoreId} to={`/score/${r.scoreId}`} className="block">
                <Surface tone="panel" interactive className="flex items-center justify-between p-3.5">
                  <div className="min-w-0">
                    <p className="type-subsection text-ink-primary">{r.title}</p>
                    <p className="type-metadata text-ink-secondary mt-0.5">{r.composer} · last played {r.lastPlayed}</p>
                    <p className="mt-1 type-metadata font-medium text-brand">Feel like revisiting this one?</p>
                  </div>
                  <ChevronRight className="icon-sm text-ink-tertiary shrink-0 ml-2" />
                </Surface>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* If scores exist but no continuation score, surface available pieces to play */}
      {!continueScore && activeScores.length > 0 && (
        <section className="mt-7">
          <p className="type-caption text-ink-tertiary">
            Available from your Repertoire
          </p>
          <div className="mt-2.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeScores.slice(0, 3).map((s) => (
              <Surface
                key={s.id}
                tone="panel"
                className="flex flex-col justify-between p-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-control border border-line-subtle bg-surface-canvas">
                    <ScorePreview id={s.id} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate type-subsection text-ink-primary">{s.title}</p>
                    <p className="truncate type-metadata text-ink-secondary mt-0.5">{s.composer}</p>
                  </div>
                </div>
                <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-line-subtle">
                  <span className="type-metadata text-ink-tertiary">Ready on stand</span>
                  <Button intent="primary" size="xs" asChild>
                    <Link to={`/score/${s.id}/setup`}>
                      <Play className="icon-xs fill-current mr-1" />
                      <span>Start playing</span>
                    </Link>
                  </Button>
                </div>
              </Surface>
            ))}
          </div>
        </section>
      )}

      {/* 0-Score Empty State */}
      {activeScores.length === 0 && (
        <section className="mt-7">
          <Surface tone="panel" className="flex flex-col items-center gap-3 p-10 text-center">
            <PracticeGlyph className="h-8 w-8 text-brand" />
            <h2 className="type-section-title text-ink-primary">Welcome to Practice</h2>
            <p className="max-w-sm type-body-small text-ink-secondary">
              Bring the sheet music you already care about. Add your first piece to begin playing without pressure.
            </p>
            <Button intent="primary" size="md" className="mt-2" asChild>
              <Link to="/add-score">
                Add your first score
              </Link>
            </Button>
          </Surface>
        </section>
      )}

      {/* Reflective Time Spent Playing */}
      <section className="mt-10 pt-7 border-t border-line-subtle">
        <p className="type-caption text-ink-tertiary">
          This Week in Music
        </p>
        <div className="mt-2.5 grid gap-3.5 sm:grid-cols-3">
          <Surface tone="panel" padding="md">
            <p className="type-metric text-ink-primary">
              {thisWeekMinutes} <span className="type-body-small font-normal text-ink-secondary">min</span>
            </p>
            <p className="type-metadata text-ink-secondary mt-1">across {thisWeekSessions} calm sessions</p>
          </Surface>

          <Surface tone="panel" padding="md">
            <p className="type-metric text-ink-primary">
              {thisWeekPieces}
            </p>
            <p className="type-metadata text-ink-secondary mt-1">pieces brought to life</p>
          </Surface>

          <Surface tone="panel" padding="md" className="flex flex-col justify-between">
            <div className="flex justify-between items-center pt-1">
              {week.days.map((d, i) => (
                <div key={d.key} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${thisWeekMarks[i] ? 'bg-brand' : 'bg-neutral-muted'}`}
                  />
                  <span className="type-metadata font-medium text-ink-secondary">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="type-metadata text-ink-secondary mt-2">
              {thisWeekMarks.filter(Boolean).length} days of music
            </p>
          </Surface>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button intent="secondary" size="sm" asChild>
            <Link to="/practice/history">
              <Clock className="icon-xs" />
              <span>Practice history</span>
            </Link>
          </Button>
          <Button intent="secondary" size="sm" asChild>
            <Link to="/practice/progress">
              <BarChart2 className="icon-xs" />
              <span>Progress &amp; insights</span>
            </Link>
          </Button>
          {activeScores.length > 0 && (
            <Button intent="quiet" size="sm" asChild>
              <Link to="/library">
                <span>Browse Repertoire</span>
              </Link>
            </Button>
          )}
        </div>
      </section>
    </AppPage>
  );
}
