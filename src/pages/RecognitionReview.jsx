import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, AlertTriangle } from 'lucide-react';
import { getRecognitionIssues, generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import { Button } from '@/components/ui/button';

export default function RecognitionReview() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const data = getRecognitionIssues(importId);
  const [issues, setIssues] = useState(data.issues);
  const [activeIssue, setActiveIssue] = useState(data.issues[0]?.id ?? null);
  const [notes] = useState(() => generateNotes(data.scoreId || data.title));
  const [selectedId, setSelectedId] = useState(null);

  const resolve = (id) => setIssues((p) => p.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)));
  const active = issues.find((i) => i.id === activeIssue);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <Link to={`/imports/${importId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {data.title}
        </Link>
        <span className="text-sm text-muted-foreground">Recognition review</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Original scan */}
        <div className="hidden w-1/3 shrink-0 flex-col border-r border-border md:flex">
          <p className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original scan</p>
          <div className="flex-1 overflow-auto bg-background p-4">
            <div className="mx-auto max-w-sm rounded-md border border-border bg-card p-4">
              <div className="staff-bg aspect-[3/4] w-full rounded border border-border opacity-60" />
              <p className="mt-2 text-center text-xs text-muted-foreground">Page 1 (scan)</p>
            </div>
          </div>
        </div>

        {/* Recognized score */}
        <div className="min-w-0 flex-1 overflow-auto bg-background p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recognized score</p>
          <div className="mx-auto max-w-3xl rounded-md border border-border bg-card p-6 shadow-sm">
            <ScoreCanvas notes={notes} selectedId={selectedId} onSelect={setSelectedId} zoom={1} />
          </div>
        </div>

        {/* Issues panel */}
        <div className="w-72 shrink-0 overflow-y-auto border-l border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issues to review</p>
          <div className="mt-3 space-y-2">
            {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues detected.</p>}
            {issues.map((iss) => (
              <button
                key={iss.id}
                onClick={() => setActiveIssue(iss.id)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${activeIssue === iss.id ? 'border-primary bg-accent/40' : 'border-border hover:bg-accent/40'} ${iss.resolved ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium"><AlertTriangle className="h-3.5 w-3.5 text-gold" /> Measure {iss.measure}</span>
                  {iss.resolved && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{iss.type}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{iss.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">Confidence: {iss.confidence}</p>
              </button>
            ))}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="w-full" onClick={() => resolve(active.id)}>
                {active.resolved ? 'Mark as unresolved' : 'Mark as fixed'}
              </Button>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate(`/score/${data.scoreId}/edit`)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Fix in editor
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">{issues.filter((i) => i.resolved).length} of {issues.length} reviewed</span>
        <div className="flex gap-2">
          <Link to={`/score/${data.scoreId}/edit`}>
            <Button variant="outline"><Pencil className="mr-1.5 h-4 w-4" /> Fix in editor</Button>
          </Link>
          <Button onClick={() => navigate(`/score/${data.scoreId}`)}>
            <Check className="mr-1.5 h-4 w-4" /> Looks good
          </Button>
        </div>
      </div>
    </div>
  );
}