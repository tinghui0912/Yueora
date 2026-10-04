/**
 * ProgressVisual — Landing progress section visual.
 * Compact tempo trend line + recent sessions, not a BI dashboard.
 */
import { TrendingUp } from 'lucide-react';

export default function ProgressVisual() {
  // Deterministic mock data for tempo trend
  const points = [72, 74, 73, 76, 78, 77, 80, 82];
  const maxVal = 90;
  const minVal = 60;
  const chartW = 200;
  const chartH = 80;
  const stepX = chartW / (points.length - 1);

  const pathD = points.map((v, i) => {
    const x = i * stepX;
    const y = chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaD = `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  return (
    <div className="rounded-container border border-line-subtle bg-surface-panel p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="type-caption text-ink-tertiary">Tempo trend</p>
        <span className="flex items-center gap-1 text-xs font-medium text-practice-correct">
          <TrendingUp className="h-3.5 w-3.5" /> +8 BPM
        </span>
      </div>

      {/* Tempo trend line */}
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="mt-3 h-24 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#progressGrad)" />
        <path d={pathD} fill="none" stroke="hsl(var(--brand))" strokeWidth="1.5" />
        {points.map((v, i) => {
          const x = i * stepX;
          const y = chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
          return <circle key={i} cx={x} cy={y} r="1.5" fill="hsl(var(--brand))" />;
        })}
      </svg>

      {/* Recent sessions */}
      <div className="mt-4 space-y-2 border-t border-line-subtle pt-3">
        <p className="type-caption text-ink-tertiary">Recent sessions</p>
        {[
          { title: 'Clair de Lune', detail: 'Measures 12–18 · 14 min', tempo: '78 BPM' },
          { title: 'Moonlight Sonata', detail: 'Measures 1–8 · 22 min', tempo: '72 BPM' },
        ].map((s) => (
          <div key={s.title} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-ink-primary">{s.title}</p>
              <p className="text-xs text-ink-tertiary">{s.detail}</p>
            </div>
            <span className="text-xs font-medium text-ink-secondary">{s.tempo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}