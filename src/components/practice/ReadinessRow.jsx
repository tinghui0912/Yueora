import { AlertCircle, Check, Circle, Loader2 } from 'lucide-react';

const tone = {
  ready: { text: 'text-brand', label: 'Ready' },
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
  const text = statusText || t.label;
  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`flex items-center gap-2 type-body-small ${t.text}`}>
          <StatusIcon status={status} />
          <span>{text}</span>
        </span>
        <span className="type-body-small text-ink-primary">{label}</span>
        {action && <span className="ml-auto shrink-0">{action}</span>}
      </div>
      {detail && <p className="mt-1 pl-6 type-metadata text-ink-tertiary">{detail}</p>}
      {children && <div className="mt-2 pl-6">{children}</div>}
    </div>
  );
}