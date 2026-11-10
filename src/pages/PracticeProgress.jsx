import { Link } from 'react-router-dom';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { dayLabel, minutesLabel } from '@/lib/practiceUtils';
import { practiceWeek } from '@/lib/practiceStats';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';
import StateMessage from '@/components/patterns/StateMessage';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Progress is read from lightweight activity only — time, pieces and how often.
 * There is no historical accuracy here because accuracy was never stored.
 */
export default function PracticeProgress() {
  const activities = (usePrototypeStore((s) => s.practiceActivities) || []).filter((a) => a.ownerId === 'you');

  const totalSeconds = activities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const pieceIds = [...new Set(activities.map((a) => a.scoreId))];

  // The seven dates ending today — the same calculation Practice shows.
  const today = startOfDay(new Date());
  const week = practiceWeek(activities);
  const days = week.days.map((d) => ({ ...d, isToday: d.key === today }));
  const max = Math.max(1, ...days.map((d) => d.minutes));

  const pieces = pieceIds.map((id) => {
    const items = activities.filter((a) => a.scoreId === id);
    const latest = items.reduce((acc, a) => (!acc || new Date(a.completedAt) > new Date(acc.completedAt) ? a : acc), null);
    return {
      id,
      title: latest?.scoreTitleSnapshot || 'Score',
      sessions: items.length,
      minutes: Math.round(items.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 60),
      lastLabel: dayLabel(latest?.completedAt),
    };
  }).sort((a, b) => b.minutes - a.minutes);

  return (
    <AppPage size="standard">
      <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
      <div className="mt-3">
        <PageHeader
          title="Progress"
          description="Time spent and pieces played — nothing graded."
        />
      </div>

      {activities.length === 0 ? (
        <div className="mt-8">
          <StateMessage
            tone="neutral"
            title="Nothing to look back on yet"
            description="Once you practise, this page shows how much time you've spent and which pieces you keep returning to."
            primaryAction={<Link to="/practice" className="rounded-control bg-brand px-4 py-2 type-body-small font-semibold text-white hover:bg-brand-hover">Go to Practice</Link>}
          />
        </div>
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-line-subtle">
            <div className="sm:px-5 sm:first:pl-0"><Metric label="Practice time" value={`${totalMinutes}`} context="minutes" /></div>
            <div className="sm:px-5"><Metric label="Pieces played" value={`${pieces.length}`} /></div>
            <div className="sm:px-5"><Metric label="Sessions" value={`${activities.length}`} /></div>
          </dl>

          <section className="mt-8">
            <SectionHeader title="Last seven days" />
            <div className="mt-3 border-y border-line-subtle py-5">
              <div className="flex h-40 items-end justify-between gap-2">
                {days.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs tabular-nums text-ink-secondary/70">{d.minutes > 0 ? d.minutes : ''}</span>
                    <div
                      className={`w-full rounded-t transition-colors ${d.isToday ? 'bg-brand' : 'bg-neutral-muted hover:bg-neutral-hover'}`}
                      style={{ height: `${(d.minutes / max) * 100}%`, minHeight: d.minutes > 0 ? 3 : 0 }}
                    />
                    <span className="text-xs font-medium text-ink-secondary/80">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <SectionHeader title="Pieces you return to" />
            <div className="mt-3 divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel overflow-hidden">
              {pieces.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-neutral-hover">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-primary">{p.title}</p>
                    <p className="type-metadata text-ink-tertiary">{p.sessions} {p.sessions === 1 ? 'session' : 'sessions'} · {minutesLabel(p.minutes * 60)} total · last {p.lastLabel}</p>
                  </div>
                  <Link to={`/score/${p.id}`} className="shrink-0 type-body-small font-medium text-brand hover:underline">Open</Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AppPage>
  );
}