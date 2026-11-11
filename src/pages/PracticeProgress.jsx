import { Link } from 'react-router-dom';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { canUsePracticeInsights } from '@/lib/commercialEntitlements';
import { checkoutPath } from '@/lib/commercial';
import { dayLabel, minutesLabel } from '@/lib/practiceUtils';
import { practiceWeek } from '@/lib/practiceStats';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';
import StateMessage from '@/components/patterns/StateMessage';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart2, Calendar, Music } from 'lucide-react';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Progress is read from lightweight activity only — time, pieces and how often.
 * Enforces commercial entitlement matrix: Free gets upgrade preview ("Available with Plus").
 */
export default function PracticeProgress() {
  const subscription = usePrototypeStore((s) => s.subscription);
  const activities = (usePrototypeStore((s) => s.practiceActivities) || []).filter((a) => a.ownerId === 'you');

  const hasInsights = canUsePracticeInsights(subscription?.plan);

  if (!hasInsights) {
    return (
      <AppPage size="standard">
        <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
        <div className="mt-3">
          <PageHeader
            title="Progress & insights"
            description="Available with Plus · Track practice time and repertoire return patterns without pressure."
          />
        </div>

        <div className="mt-8 rounded-container border border-line-subtle bg-surface-panel p-6 sm:p-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-muted px-3 py-1 type-caption font-semibold uppercase tracking-wider text-ink-primary">
              <Sparkles className="icon-xs text-brand" /> Plus Feature
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl font-medium tracking-tight text-ink-primary">
              See how your playing unfolds over time.
            </h2>
            <p className="mt-3 type-body text-ink-secondary leading-relaxed">
              Practice insights offer calm, reflective visibility into your music: time spent playing, pieces you keep returning to, and your weekly playing rhythms — never grades or streaks.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 border-y border-line-subtle py-5">
              <div className="flex items-start gap-2.5">
                <BarChart2 className="icon-sm text-ink-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="type-body-small font-medium text-ink-primary">Total time</p>
                  <p className="type-caption text-ink-tertiary">Minutes spent playing</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Music className="icon-sm text-ink-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="type-body-small font-medium text-ink-primary">Pieces played</p>
                  <p className="type-caption text-ink-tertiary">Return frequency</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="icon-sm text-ink-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="type-body-small font-medium text-ink-primary">Weekly rhythm</p>
                  <p className="type-caption text-ink-tertiary">7-day visual summary</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button intent="primary" asChild>
                <Link to={checkoutPath('plus', 'monthly')}>
                  Upgrade to Plus · $3 / mo
                </Link>
              </Button>
              <Button intent="secondary" asChild>
                <Link to="/pricing">
                  Compare plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppPage>
    );
  }

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
