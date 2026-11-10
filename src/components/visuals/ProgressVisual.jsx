/**
 * ProgressVisual — Landing progress section visual.
 * Focuses on reflective time immersed in music, rather than stressful BPM
 * charts, streaks, or judgment scores.
 */
import { Clock, Calendar, BookmarkCheck } from 'lucide-react';

export default function ProgressVisual() {
  // Reflective weekly distribution (hours per day)
  const days = [
    { label: 'Mon', mins: 35, piece: 'Clair de Lune' },
    { label: 'Tue', mins: 0, piece: null },
    { label: 'Wed', mins: 45, piece: 'Clair de Lune' },
    { label: 'Thu', mins: 20, piece: 'Gymnopédie No. 1' },
    { label: 'Fri', mins: 0, piece: null },
    { label: 'Sat', mins: 60, piece: 'Clair de Lune' },
    { label: 'Sun', mins: 50, piece: 'Clair de Lune' },
  ];

  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-2.5 sm:p-6 min-w-0 overflow-hidden">
      {/* Reflective Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line-subtle pb-3 gap-2">
        <div>
          <p className="type-caption uppercase tracking-wider text-ink-tertiary">Time with Music</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="font-display text-lg sm:text-2xl font-medium text-ink-primary">3.5 hours</span>
            <span className="type-metadata text-ink-tertiary">this week · 5 gentle sessions</span>
          </div>
        </div>

        <div className="rounded-control border border-line-subtle bg-surface-canvas/60 px-2.5 py-1 text-left sm:text-right shrink-0">
          <p className="type-caption text-ink-tertiary">No Streaks</p>
          <p className="type-metadata font-medium text-brand">Play at your pace</p>
        </div>
      </div>

      {/* Gentle Weekly Immersion Bars (calm height, no red/green) */}
      <div className="mt-5">
        <p className="type-caption text-ink-tertiary mb-2">Weekly Rhythm</p>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 items-end h-24 pt-4">
          {days.map((d) => {
            const heightPercent = d.mins > 0 ? Math.max(20, (d.mins / 60) * 100) : 4;
            return (
              <div key={d.label} className="flex flex-col items-center gap-1 h-full justify-end group min-w-0">
                <span className="text-xs text-ink-secondary/70 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {d.mins > 0 ? `${d.mins}m` : '—'}
                </span>
                <div 
                  className={`w-full rounded-sm transition-all ${
                    d.mins > 0 ? 'bg-neutral-muted border-t-2 border-brand group-hover:bg-brand' : 'bg-line-subtle/50'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-medium text-ink-secondary/80 truncate">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repertoire Relationship Log */}
      <div className="mt-5 space-y-2.5 border-t border-line-subtle pt-3.5">
        <div className="flex items-center justify-between text-xs text-ink-tertiary">
          <span>Pieces you revisited</span>
          <span>Time spent</span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between rounded-control border border-line-subtle bg-surface-panel px-3 py-2 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
              <BookmarkCheck className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">Clair de Lune</p>
              <p className="type-metadata text-ink-tertiary truncate">Returned 4 times · mm. 14–36</p>
            </div>
          </div>
          <span className="type-metadata font-medium text-ink-secondary shrink-0">2 hrs 30 min</span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between rounded-control border border-line-subtle bg-surface-canvas/40 px-3 py-2 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-canvas text-ink-tertiary border border-line-subtle">
              <Clock className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">Gymnopédie No. 1</p>
              <p className="type-metadata text-ink-tertiary truncate">Returned 1 time · Full score</p>
            </div>
          </div>
          <span className="type-metadata font-medium text-ink-secondary shrink-0">40 min</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-tertiary border-t border-line-subtle pt-2.5 gap-1.5">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" /> No countdowns or overdue pieces
        </span>
        <span className="italic text-ink-tertiary">Come back whenever you wish</span>
      </div>
    </div>
  );
}
