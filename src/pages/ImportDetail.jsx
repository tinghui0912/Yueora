import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileMusic, RefreshCw, AlertTriangle, CheckCircle2, Pencil, ArrowRight } from 'lucide-react';
import { getImport } from '@/lib/mockData';

const statusMeta = {
  processing: { label: 'Processing your score…', color: 'text-primary' },
  needs_review: { label: 'Needs review', color: 'text-gold' },
  failed: { label: 'Recognition failed', color: 'text-destructive' },
  completed: { label: 'Completed', color: 'text-muted-foreground' },
};

export default function ImportDetail() {
  const { importId } = useParams();
  const imp = getImport(importId);

  if (!imp) {
    return (
      <div className="px-8 py-16 text-center">
        <h1 className="font-display text-2xl">Import not found</h1>
        <Link to="/imports" className="mt-4 inline-block text-primary underline">Back to imports</Link>
      </div>
    );
  }

  const meta = statusMeta[imp.status];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <Link to="/imports" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Imports
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">{imp.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Started {imp.started} · {imp.source} · {imp.pages} pages</p>
        </div>
        <span className={`shrink-0 text-sm font-medium ${meta.color}`}>{meta.label}</span>
      </div>

      {/* Progress / status */}
      <div className="mt-6 rounded-md border border-border bg-card p-5">
        {imp.status === 'processing' && (
          <>
            <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Recognizing notation…</span><span>{imp.progress}%</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${imp.progress}%` }} /></div>
            <p className="mt-3 text-sm text-muted-foreground">You can leave this page. We’ll let you know when it’s ready.</p>
          </>
        )}
        {imp.status === 'needs_review' && (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-gold" />
            <p className="text-sm text-muted-foreground">Recognition finished with {imp.issues} {imp.issues === 1 ? 'spot' : 'spots'} to review.</p>
          </div>
        )}
        {imp.status === 'failed' && (
          <div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-foreground">{imp.failure}</p>
            </div>
            <button className="mt-4 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"><RefreshCw className="h-4 w-4" /> Try again</button>
          </div>
        )}
        {imp.status === 'completed' && (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Recognition complete. Your score is ready.</p>
          </div>
        )}
      </div>

      {/* Source files */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source files</h2>
        <div className="mt-2 space-y-2">
          {Array.from({ length: imp.pages }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
              <FileMusic className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Page {i + 1}.pdf</span>
              <button className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Replace"><RefreshCw className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Resulting score */}
      {imp.status === 'completed' && imp.scoreId && (
        <div className="mt-6 rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resulting score</p>
          <Link to={`/score/${imp.scoreId}`} className="mt-2 flex items-center justify-between hover:bg-accent/40">
            <span className="font-medium">{imp.title}</span>
            <span className="flex items-center gap-1 text-sm text-primary">Open score <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {imp.status === 'needs_review' && (
          <Link to={`/review/${imp.id}`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Pencil className="h-4 w-4" /> Review recognition
          </Link>
        )}
        {imp.status === 'completed' && imp.scoreId && (
          <Link to={`/score/${imp.scoreId}`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Open score
          </Link>
        )}
        <button className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">Remove from import history</button>
      </div>
    </div>
  );
}