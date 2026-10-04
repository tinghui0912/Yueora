import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Music2, Smile } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { practiceProgress as seedProgress } from '@/lib/mockData';
import PageHeader from '@/components/patterns/PageHeader';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PracticeProgress() {
  const sessions = usePrototypeStore((s) => s.practiceSessions);
  const scores = usePrototypeStore((s) => s.scores);

  // Derive live stats from sessions
  const totalMinutes = sessions.reduce((sum, s) => {
    const m = parseInt(s.duration) || 0;
    return sum + m;
  }, 0);
  const piecesPlayed = new Set(sessions.map((s) => s.scoreId)).size;
  const sessionCount = sessions.length;

  // Use seed weekly chart as baseline, but add today's session
  const weeklyMinutes = seedProgress.weeklyMinutes.slice();
  if (sessions.length > 0) {
    const todayMin = parseInt(sessions[0]?.duration) || 0;
    weeklyMinutes[weeklyMinutes.length - 1] = (weeklyMinutes[weeklyMinutes.length - 1] || 0) + todayMin;
  }

  // Recurring tricky sections from recent sessions
  const trickyMap = {};
  sessions.forEach((s) => {
    if (s.trickyFrom && s.trickyTo) {
      const key = `${s.scoreId}-${s.trickyFrom}-${s.trickyTo}`;
      const score = scores.find((sc) => sc.id === s.scoreId);
      if (!trickyMap[key]) trickyMap[key] = { scoreId: s.scoreId, label: `Measures ${s.trickyFrom}–${s.trickyTo}`, note: 'Showing up across sessions — getting steadier.', count: 0, title: score?.title };
      trickyMap[key].count++;
    }
  });
  const recurringTricky = Object.values(trickyMap).sort((a, b) => b.count - a.count).slice(0, 5);
  const fallbackTricky = recurringTricky.length > 0 ? recurringTricky : seedProgress.recurringTricky;

  // Smoother pieces — derive from scores with recent sessions
  const recentScoreIds = new Set(sessions.slice(0, 10).map((s) => s.scoreId));
  const smoother = scores.filter((s) => recentScoreIds.has(s.id)).slice(0, 4).map((s) => ({
    scoreId: s.id, title: s.title, note: 'Fewer missed notes than last time.',
  }));
  const fallbackSmoother = smoother.length > 0 ? smoother : seedProgress.smoother;

  const tempoTrend = seedProgress.tempoTrend;
  const max = Math.max(...weeklyMinutes);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
      <div className="mt-3">
        <PageHeader
          title="Progress"
          description="A calm look at how things are going — no grades, no rankings."
        />
      </div>

      {/* Metric band — flat, editorial, not KPI cards */}
      <dl className="mt-6 grid grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-line-subtle">
        <div className="sm:px-5 sm:first:pl-0">
          <Metric label="Practice time" value={`${totalMinutes}`} context="minutes" />
        </div>
        <div className="sm:px-5">
          <Metric label="Pieces played" value={`${piecesPlayed}`} />
        </div>
        <div className="sm:px-5">
          <Metric label="Sessions" value={`${sessionCount}`} />
        </div>
      </dl>

      <section className="mt-8">
        <SectionHeader title="Time played" />
        <div className="mt-3 rounded-container border border-line-subtle bg-surface-panel p-5">
          <div className="flex h-40 items-end justify-between gap-2">
            {weeklyMinutes.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${max > 0 ? (m / max) * 100 : 0}%` }} />
                <span className="text-[10px] text-ink-tertiary">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Tempo progression" />
        <div className="mt-3 space-y-3">
          {tempoTrend.map((t) => (
            <div key={t.scoreId} className="rounded-container border border-line-subtle bg-surface-panel p-4">
              <Link to={`/score/${t.scoreId}`} className="font-medium hover:underline">{t.label}</Link>
              <div className="mt-2 flex items-center gap-1">
                {t.values.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div className="w-full rounded-t bg-accent" style={{ height: `${(v / 80) * 60}px` }} />
                    <span className="mt-1 text-[10px] text-ink-tertiary">{v}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1 type-metadata text-brand">+{t.values[t.values.length - 1] - t.values[0]} BPM over recent sessions</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Recurring tricky sections" />
        <div className="mt-3 space-y-2">
          {fallbackTricky.map((t) => (
            <Link key={`${t.scoreId}-${t.label}`} to={`/score/${t.scoreId}`} className="block rounded-container border border-line-subtle bg-surface-panel p-4 hover:bg-accent/40">
              <p className="font-medium text-ink-primary">{scores.find((s) => s.id === t.scoreId)?.title || t.title} · {t.label}</p>
              <p className="mt-0.5 type-body-small text-ink-secondary">{t.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Becoming smoother" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fallbackSmoother.map((s) => (
            <div key={s.scoreId} className="flex items-start gap-3 rounded-container border border-line-subtle bg-surface-panel p-4">
              <Smile className="mt-0.5 h-4 w-4 text-brand" />
              <div>
                <p className="font-medium text-ink-primary">{s.title}</p>
                <p className="type-body-small text-ink-secondary">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}