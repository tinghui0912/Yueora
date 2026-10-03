import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, BarChart3, History } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { buildSummary } from '@/lib/mockData';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';

export default function PracticeSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const scoreId = state.scoreId || (sessionId || '').replace(/-session/, '').replace(/^s-/, '');
  const base = buildSummary(scoreId);
  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const session = usePrototypeStore((s) => s.practiceSessions.find((p) => p.id === sessionId));
  const summary = { ...base, accuracy: state.accuracy ?? session?.accuracy ?? base.accuracy, duration: state.duration ?? session?.duration ?? base.duration };

  const trickyFrom = state.trickyFrom ?? session?.trickyFrom ?? 1;
  const trickyTo = state.trickyTo ?? session?.trickyTo ?? Math.min(score?.measures || 32, 5);

  const [replaying, setReplaying] = useState(false);
  const [replayPos, setReplayPos] = useState(0);
  const totalMeasures = score?.measures || 32;

  const toggleReplay = () => {
    if (replayPos >= totalMeasures) setReplayPos(0);
    setReplaying((r) => !r);
  };

  useEffect(() => {
    if (!replaying) return;
    const t = setInterval(() => {
      setReplayPos((p) => {
        if (p + 1 >= totalMeasures) { setReplaying(false); return p; }
        return p + 1;
      });
    }, 800);
    return () => clearInterval(t);
  }, [replaying]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <Link to={score ? `/score/${scoreId}` : '/practice'} className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> {score?.title || 'Back'}
      </Link>

      {/* Hero — human first */}
      <h1 className="mt-6 type-display text-[clamp(1.75rem,4vw,2.75rem)] text-ink-primary">{summary.hero}</h1>
      <p className="mt-2 type-body text-ink-secondary">{summary.title} · {summary.composer}</p>

      {/* Insight — one kept surface */}
      <div className="mt-6 rounded-container border border-line-subtle bg-surface-panel p-5">
        <p className="type-body-small text-ink-secondary">{summary.insight}</p>
        <Link to={`/score/${scoreId}/practice`} state={{ range: 'selected', rangeFrom: trickyFrom, rangeTo: trickyTo }} className="mt-3 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Play className="h-4 w-4" /> Try that section again
        </Link>
        <p className="mt-2 type-metadata text-ink-tertiary">Measures {trickyFrom}–{trickyTo} will be pre-selected.</p>
      </div>

      {/* Metrics — flat band with separators, not KPI cards */}
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-line-subtle">
        <div className="sm:px-4 sm:first:pl-0"><Metric label="Accuracy" value={`${summary.accuracy}%`} /></div>
        <div className="sm:px-4"><Metric label="Timing" value={summary.timing} /></div>
        <div className="sm:px-4"><Metric label="Duration" value={summary.duration} /></div>
        <div className="sm:px-4"><Metric label="Tempo" value={summary.tempo} /></div>
      </dl>

      {/* Compared with last time — plain section */}
      <section className="mt-8">
        <SectionHeader title="Compared with last time" />
        <dl className="mt-3 space-y-2 type-body-small">
          <div className="flex justify-between"><dt className="text-ink-secondary">Accuracy</dt><dd className="text-brand">{summary.compared.accuracy}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Missed notes</dt><dd className="text-brand">{summary.compared.errors}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Tempo</dt><dd className="text-brand">{summary.compared.tempo}</dd></div>
        </dl>
      </section>

      {/* Details — plain definition list */}
      <section className="mt-6">
        <SectionHeader title="Details" />
        <dl className="mt-3 space-y-2 type-body-small">
          <div className="flex justify-between"><dt className="text-ink-secondary">Missing notes</dt><dd className="text-ink-primary">{summary.missing}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Unexpected notes</dt><dd className="text-ink-primary">{summary.unexpected}</dd></div>
        </dl>
      </section>

      {/* Replay — compact player row */}
      <section className="mt-6">
        <SectionHeader title="Replay performance" />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={toggleReplay} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90">
            {replaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(replayPos / totalMeasures) * 100}%` }} />
            </div>
            <p className="mt-1 type-metadata text-ink-tertiary">Measure {replayPos} of {totalMeasures}</p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link to={`/score/${scoreId}/practice`} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <RotateCcw className="h-4 w-4" /> Play full score again
        </Link>
        <Link to={`/score/${scoreId}`} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to score
        </Link>
        <Link to="/practice" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to Practice
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/practice/history" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"><History className="h-4 w-4" /> Practice history</Link>
        <Link to="/practice/progress" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"><BarChart3 className="h-4 w-4" /> Progress</Link>
      </div>
    </div>
  );
}