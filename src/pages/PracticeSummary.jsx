import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { buildSummary, getScore } from '@/lib/mockData';

export default function PracticeSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const scoreId = state.scoreId || (sessionId || '').replace('-session', '');
  const base = buildSummary(scoreId);
  const score = getScore(scoreId);

  const summary = {
    ...base,
    accuracy: state.accuracy ?? base.accuracy,
    duration: state.duration ?? base.duration,
  };

  return (
    <div className="px-4 py-6 md:px-8">
      <Link to={score ? `/score/${scoreId}` : '/practice'} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {score?.title || 'Back'}
      </Link>

      <div className="mx-auto mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-medium">Practice complete</h1>
        <p className="mt-1 text-muted-foreground">{summary.title} · {summary.composer}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric label="Accuracy" value={`${summary.accuracy}%`} accent />
          <Metric label="Timing" value={summary.timing} />
          <Metric label="Duration" value={summary.duration} />
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Needs attention</p>
          <div className="mt-3 space-y-2">
            {summary.needsAttention.map((n) => (
              <div key={n.measure} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-gold" />
                  <div>
                    <p className="text-sm font-medium">Measure {n.measure}</p>
                    <p className="text-xs text-muted-foreground">{n.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/score/${scoreId}/practice`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" /> Practice difficult sections
          </Link>
          <Link to={`/score/${scoreId}/practice`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
            <RotateCcw className="h-4 w-4" /> Practice full score again
          </Link>
          <Link to={`/score/${scoreId}`} className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">
            Back to score
          </Link>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance details</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Missing notes</dt><dd>{summary.missing}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Unexpected notes</dt><dd>{summary.unexpected}</dd></div>
          </dl>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compared with last time</p>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Accuracy</dt><dd className="text-primary">{summary.compared.accuracy}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Errors</dt><dd className="text-primary">{summary.compared.errors}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tempo</dt><dd className="text-primary">{summary.compared.tempo}</dd></div>
            </dl>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/practice" className="text-sm font-medium text-primary hover:underline">Back to Practice hub</Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-medium ${accent ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );
}