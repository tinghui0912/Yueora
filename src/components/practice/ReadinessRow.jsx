import { AlertCircle, Check, Circle, Loader2 } from 'lucide-react';

const tone = {
  ready: { text: 'text-emerald-600', label: 'Ready' },
  progress: { text: 'text-ink-secondary', label: 'Preparing' },
  error: { text: 'text-danger', label: 'Needs attention' },
  idle: { text: 'text-ink-tertiary', label: 'Not tested' },
};

function StatusIcon({ status }) {
  if (status === 'ready') return <Check className="icon-sm" aria-hidden="true" />;
  if (status === 'progress') return <Loader2 className="icon-sm animate-spin" aria-hidden="true" />;
  if (status === 'error') return <AlertCircle className="icon-sm" aria-hidden="true" />;
  return <Circle className="icon-sm" aria-hidden="true" />;
}

// Readiness is never communicated by colour alone: icon + label + status text.
export default function ReadinessRow({
  label,
  detail = undefined,
  status = 'idle',
  statusText = undefined,
  action = null,
  children = null,
}) {
  const t = tone[status] || tone.idle;
  const isReady = status === 'ready';
  const text = statusText || t.label;

  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`flex shrink-0 items-center justify-center ${isReady ? 'text-emerald-600' : t.text}`}>
            <StatusIcon status={status} />
          </span>
          <span className="type-body-small text-ink-primary font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          {!isReady && (
            <span className={`type-metadata ${t.text}`}>
              {text}
            </span>
          )}
          {action && <span className="shrink-0">{action}</span>}
        </div>
      </div>
      {detail && <p className="mt-1 pl-6 type-metadata text-ink-tertiary">{detail}</p>}
      {children && <div className="mt-2 pl-6">{children}</div>}
    </div>
  );
}