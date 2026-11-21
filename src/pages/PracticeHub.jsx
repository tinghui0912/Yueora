import { Link } from 'react-router-dom';
import { Play, Clock, Sparkles, Music, BarChart2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { practiceWeek } from '@/lib/practiceStats';
import ScorePreview from '@/components/library/ScorePreview';
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

  // Recent active pieces for quick dashboard access
  const recentPieces = activeScores.slice(0, 4);

  // This week — reflective practice stats
  const week = practiceWeek(activities);
  const thisWeekMinutes = week.totalMinutes;
  const thisWeekSessions = week.sessions;
  const thisWeekPieces = week.pieces;
  const thisWeekMarks = week.days.map((d) => d.sessions > 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8" data-qa="practice-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="type-dashboard-title text-ink-primary">Practice Dashboard</h1>
          <p className="mt-1 type-page-subtitle text-ink-tertiary">
            A calm space to play, reflect, and maintain your repertoire
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button intent="secondary" size="md" asChild>
            <Link to="/library">
              <span>Browse Repertoire</span>
            </Link>
          </Button>
          <Button intent="primary" size="md" asChild>
            <Link to="/add-score">
              <span>Add score</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4-column StatCards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-qa="practice-stat-cards">
        <Surface tone="panel" padding="md" interactive="static-card" className="flex items-start justify-between" data-qa="practice-stat-card">
          <div>
            <p className="type-stat-label text-ink-tertiary" data-qa="practice-stat-label">Minutes Played</p>
            <p className="type-metric text-ink-primary mt-1.5" data-qa="practice-stat-metric">{thisWeekMinutes} <span className="type-card-metadata text-ink-secondary font-normal">min</span></p>
            <p className="type-card-metadata text-ink-secondary mt-1">This week in music</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nav bg-brand-soft text-brand" data-qa="practice-stat-icon">
            <Clock className="icon-md text-brand" />
          </div>
        </Surface>

        <Surface tone="panel" padding="md" interactive="static-card" className="flex items-start justify-between" data-qa="practice-stat-card">
          <div>
            <p className="type-stat-label text-ink-tertiary" data-qa="practice-stat-label">Calm Sessions</p>
            <p className="type-metric text-ink-primary mt-1.5" data-qa="practice-stat-metric">{thisWeekSessions}</p>
            <p className="type-card-metadata text-ink-secondary mt-1">Across 7 days</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nav bg-brand-soft text-brand" data-qa="practice-stat-icon">
            <Play className="icon-md text-brand fill-current" />
          </div>
        </Surface>

        <Surface tone="panel" padding="md" interactive="static-card" className="flex items-start justify-between" data-qa="practice-stat-card">
          <div>
            <p className="type-stat-label text-ink-tertiary" data-qa="practice-stat-label">Active Pieces</p>
            <p className="type-metric text-ink-primary mt-1.5" data-qa="practice-stat-metric">{thisWeekPieces}</p>
            <p className="type-card-metadata text-ink-secondary mt-1">{activeScores.length} total in repertoire</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nav bg-brand-soft text-brand" data-qa="practice-stat-icon">
            <Music className="icon-md text-brand" />
          </div>
        </Surface>

        <Surface tone="panel" padding="md" interactive="static-card" className="flex items-start justify-between" data-qa="practice-stat-card">
          <div>
            <p className="type-stat-label text-ink-tertiary" data-qa="practice-stat-label">Days Active</p>
            <p className="type-metric text-ink-primary mt-1.5" data-qa="practice-stat-metric">{thisWeekMarks.filter(Boolean).length} <span className="type-card-metadata text-ink-secondary font-normal">/ 7</span></p>
            <p className="type-card-metadata text-ink-secondary mt-1">Weekly playing rhythm</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nav bg-brand-soft text-brand" data-qa="practice-stat-icon">
            <Sparkles className="icon-md text-brand" />
          </div>
        </Surface>
      </div>

      {/* Hero Resume Module */}
      {continueScore && (
        <section className="space-y-3" data-qa="practice-resume-section">
          <p className="type-card-metadata text-ink-secondary">Pick up where you left off</p>
          <Surface
            interactive
            padding="md"
            className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            data-qa="practice-resume-module"
          >
            {/* Semantic Stretched Link so clicking the resume module anywhere launches practice setup */}
            <Link
              to={`/score/${continueScore.id}/setup`}
              data-qa="practice-resume-link"
              className="absolute inset-0 z-0 rounded-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label={`Resume playing ${continueScore.title} by ${continueScore.composer}`}
            />

            <div className="flex items-center gap-4 min-w-0 pointer-events-none">
              <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-control border border-line-subtle/50 bg-surface-panel/95 sm:block">
                <ScorePreview id={continueScore.id} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 type-card-value-label text-brand">
                  <Sparkles className="icon-xs" />
                  <span>Ready to play</span>
                </span>
                <h2 className="truncate type-panel-title text-ink-primary mt-0.5">
                  {continueScore.title}
                </h2>
                <p className="truncate type-card-metadata text-ink-secondary mt-0.5">
                  {continueScore.composer} · Continue from bar {continueScore.lastMeasure} · Played {continueScore.lastPlayed}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-2">
              <div className="pointer-events-none" aria-hidden="true">
                <Button intent="primary" size="md" asChild tabIndex={-1}>
                  <span className="select-none">
                    <Play className="icon-sm fill-current" />
                    <span>Resume playing</span>
                  </span>
                </Button>
              </div>
              <div className="pointer-events-auto">
                <Button intent="secondary" size="md" asChild>
                  <Link to={`/score/${continueScore.id}`}>
                    <span>Score details</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Surface>
        </section>
      )}

      {/* 2-column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Pieces */}
        <Surface tone="panel" padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="type-panel-title text-ink-primary" data-qa="practice-recent-heading">Recent Repertoire</h2>
            <Link to="/library" className="type-body-small text-brand font-medium hover:underline">
              View all ({activeScores.length})
            </Link>
          </div>

          <div className="divide-y divide-line-subtle/50">
            {recentPieces.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-control border border-line-subtle/50 bg-surface-panel">
                    <ScorePreview id={s.id} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <Link to={`/score/${s.id}`} className="block truncate type-subsection text-ink-primary hover:text-brand transition-colors">
                      {s.title}
                    </Link>
                    <p className="truncate type-card-metadata text-ink-secondary">{s.composer}</p>
                  </div>
                </div>

                <Button intent="subtle" size="xs" asChild className="shrink-0">
                  <Link to={`/score/${s.id}/setup`}>
                    <Play className="icon-xs fill-current" />
                    <span>Play</span>
                  </Link>
                </Button>
              </div>
            ))}
            {recentPieces.length === 0 && (
              <p className="py-6 text-center type-body-small text-ink-tertiary">
                No scores in repertoire yet.
              </p>
            )}
          </div>
        </Surface>

        {/* Right Column: Weekly Rhythm & Reflective Stats */}
        <Surface tone="panel" padding="md" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="type-panel-title text-ink-primary">Weekly Rhythm</h2>
            <span className="type-card-metadata text-ink-secondary">7-day view</span>
          </div>

          <div className="flex justify-between items-center rounded-control bg-neutral-muted/60 p-4 border border-line-subtle/50">
            {week.days.map((d, i) => (
              <div key={d.key} className="flex flex-col items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full transition-colors ${
                    thisWeekMarks[i] ? 'bg-brand' : 'bg-line-strong'
                  }`}
                />
                <span className="type-metadata font-medium text-ink-secondary">{d.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="type-body-small text-ink-secondary">
              Music is a sanctuary, not an assignment. You have spent <span className="font-semibold text-ink-primary">{thisWeekMinutes} calm minutes</span> with your instruments this week.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button intent="secondary" size="sm" asChild>
              <Link to="/practice/history">
                <Clock className="icon-sm" />
                <span>Practice history</span>
              </Link>
            </Button>
            <Button intent="secondary" size="sm" asChild>
              <Link to="/practice/progress">
                <BarChart2 className="icon-sm" />
                <span>Progress &amp; insights</span>
              </Link>
            </Button>
          </div>
        </Surface>
      </div>

      {/* 0-Score Welcome */}
      {activeScores.length === 0 && (
        <Surface tone="panel" padding="lg" className="flex flex-col items-center gap-3 text-center">
          <PracticeGlyph className="h-8 w-8 text-brand" />
          <h2 className="type-section-title text-ink-primary">Welcome to Practice</h2>
          <p className="max-w-sm type-body-small text-ink-secondary">
            Bring the sheet music you already care about. Add your first piece to begin playing without pressure.
          </p>
          <Button intent="primary" size="md" className="mt-3" asChild>
            <Link to="/add-score">
              <span>Add your first score</span>
            </Link>
          </Button>
        </Surface>
      )}
    </div>
  );
}
