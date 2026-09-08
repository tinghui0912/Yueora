import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, BarChart3, History } from 'lucide-react';
import { buildSummary, getScore } from '@/lib/mockData';

export default function PracticeSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const scoreId = state.scoreId || (sessionId || '').replace('-session', '');
  const base = buildSummary(scoreId);
  const score = getScore(scoreId);
  const summary = { ...base, accuracy: state.accuracy ?? base.accuracy, duration: state.duration ?? base.duration };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <Link to={score ? `/score/${scoreId}` : '/practice'} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {score?.title || 'Back'}
      </Link>

      {/* Hero — human first */}
      <h1 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight">{summary.hero}</h1>
      <p className="mt-2 text-muted-foreground">{summary.title} · {summary.composer}</p>

      {/* First insight */}
      <div className="mt-6 rounded-md border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{summary.insight}</p>
        <Link to={`/score/${scoreId}/practice`} className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Play className="h-4 w-4" /> Try that section again
        </Link>
      </div>

      {/* Secondary metrics — information, not grades */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Accuracy" value={`${summary.accuracy}%`} />
        <Metric label="Timing" value={summary.timing} />
        <Metric label="Duration" value={summary.duration} />
        <Metric label="Tempo" value={summary.tempo} />
      </div>

      {/* Compare with last time */}
      <div className="mt-6 rounded-md border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compared with last time</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Accuracy</dt><dd className="text-primary">{summary.compared.accuracy}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Missed notes</dt><dd className="text-primary">{summary.compared.errors}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tempo</dt><dd className="text-primary">{summary.compared.tempo}</dd></div>
        </dl>
      </div>

      {/* Performance details */}
      <div className="mt-4 rounded-md border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Missing notes</dt><dd>{summary.missing}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Unexpected notes</dt><dd>{summary.unexpected}</dd></div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to={`/score/${scoreId}/practice`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <RotateCcw className="h-4 w-4" /> Play full score again
        </Link>
        <Link to={`/score/${scoreId}`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to score
        </Link>
        <Link to="/practice" className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to Practice
        </Link>
        <button className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <Play className="h-4 w-4" /> Replay performance
        </button>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/practice/history" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><History className="h-4 w-4" /> Practice history</Link>
        <Link to="/practice/progress" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><BarChart3 className="h-4 w-4" /> Progress</Link>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-medium">{value}</p>
    </div>
  );
}