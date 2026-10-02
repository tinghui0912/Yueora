import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, AlertTriangle, ChevronUp, ChevronDown, ScanLine } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function RecognitionReview() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const imp = usePrototypeStore((s) => s.imports.find((i) => i.id === importId));
  const issues = usePrototypeStore((s) => s.recognitionIssues[importId] || []);
  const resolveIssue = usePrototypeStore((s) => s.resolveRecognitionIssue);
  const completeImport = usePrototypeStore((s) => s.completeImport);

  const [activeIssue, setActiveIssue] = useState(issues[0]?.id ?? null);
  const [notes] = useState(() => generateNotes(imp?.scoreId || importId));
  const [selectedId, setSelectedId] = useState(null);
  const [mobileView, setMobileView] = useState('recognized'); // 'original' | 'recognized'
  const [mobileIssuesOpen, setMobileIssuesOpen] = useState(false);

  if (!imp) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p>Import not found.</p>
          <Link to="/imports" className="text-primary underline">Back to imports</Link>
        </div>
      </div>
    );
  }

  const active = issues.find((i) => i.id === activeIssue);
  const reviewed = issues.filter((i) => i.resolved).length;

  const goPrev = () => { if (!active) return; const idx = issues.findIndex((i) => i.id === active.id); if (idx > 0) setActiveIssue(issues[idx - 1].id); };
  const goNext = () => { if (!active) return; const idx = issues.findIndex((i) => i.id === active.id); if (idx < issues.length - 1) setActiveIssue(issues[idx + 1].id); };

  const handleMarkFixed = () => { if (active) resolveIssue(importId, active.id); };
  const handleLooksGood = () => {
    completeImport(importId);
    toast({ title: 'Import complete', description: `${imp.title} is ready in your library.` });
    navigate(`/score/${imp.scoreId}`);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <Link to={`/imports/${importId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {imp.title}
        </Link>
        <div className="flex items-center gap-3">
          {active && (
            <div className="hidden items-center gap-1 sm:flex">
              <button onClick={goPrev} disabled={issues.findIndex((i) => i.id === active.id) === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" aria-label="Previous issue"><ChevronUp className="h-4 w-4" /></button>
              <button onClick={goNext} disabled={issues.findIndex((i) => i.id === active.id) === issues.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" aria-label="Next issue"><ChevronDown className="h-4 w-4" /></button>
            </div>
          )}
          <span className="text-sm text-muted-foreground">Recognition review</span>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="flex border-b border-border md:hidden">
        <button onClick={() => setMobileView('original')} className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${mobileView === 'original' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}><ScanLine className="h-4 w-4" /> Original</button>
        <button onClick={() => setMobileView('recognized')} className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${mobileView === 'recognized' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}><Pencil className="h-4 w-4" /> Recognized</button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Original scan — desktop */}
        <div className="hidden w-1/3 shrink-0 flex-col border-r border-border md:flex">
          <p className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original scan</p>
          <div className="flex-1 overflow-auto bg-background p-4">
            <div className="mx-auto max-w-sm rounded-md border border-border bg-card p-4">
              <div className="staff-bg aspect-[3/4] w-full rounded border border-border opacity-60" />
              <p className="mt-2 text-center text-xs text-muted-foreground">Page 1 (scan)</p>
              {active && <p className="mt-1 text-center text-xs text-primary">Highlight near measure {active.measure}</p>}
            </div>
          </div>
        </div>

        {/* Original scan — mobile */}
        {mobileView === 'original' && (
          <div className="flex-1 overflow-auto bg-background p-4 md:hidden">
            <div className="mx-auto max-w-sm rounded-md border border-border bg-card p-4">
              <div className="staff-bg aspect-[3/4] w-full rounded border border-border opacity-60" />
              <p className="mt-2 text-center text-xs text-muted-foreground">Page 1 (scan)</p>
              {active && <p className="mt-1 text-center text-xs text-primary">Highlight near measure {active.measure}</p>}
            </div>
          </div>
        )}

        {/* Recognized score */}
        {(mobileView === 'recognized' || typeof window !== 'undefined') && (
          <div className={`min-w-0 flex-1 overflow-auto bg-background p-6 ${mobileView === 'original' ? 'hidden md:block' : ''}`}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recognized score</p>
            <div className="mx-auto max-w-3xl rounded-md border border-border bg-card p-6 shadow-sm">
              <ScoreCanvas notes={notes} selectedId={selectedId} onSelect={setSelectedId} zoom={1} />
              {active && (
                <div className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2">
                  <p className="text-sm font-medium text-gold">Measure {active.measure}: {active.type}</p>
                  <p className="text-xs text-muted-foreground">{active.detail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issues panel — desktop */}
        <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-border p-4 md:block">
          <IssuesPanel issues={issues} activeIssue={activeIssue} setActiveIssue={setActiveIssue} active={active} onMarkFixed={handleMarkFixed} onFixInEditor={() => navigate(`/score/${imp.scoreId}/edit`, { state: { focusMeasure: active?.measure, issueType: active?.type } })} />
        </div>
      </div>

      {/* Mobile issues button */}
      <button onClick={() => setMobileIssuesOpen(true)} className="flex items-center justify-between border-t border-border px-4 py-3 md:hidden">
        <span className="text-sm font-medium">{issues.length} issues · {reviewed} reviewed</span>
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Mobile issues bottom sheet */}
      {mobileIssuesOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileIssuesOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Issues to review</p>
              <button onClick={() => setMobileIssuesOpen(false)} className="text-sm text-muted-foreground">Close</button>
            </div>
            <div className="mt-3 space-y-2">
              {issues.map((iss) => (
                <button key={iss.id} onClick={() => { setActiveIssue(iss.id); setMobileIssuesOpen(false); }} className={`w-full rounded-md border p-3 text-left ${activeIssue === iss.id ? 'border-primary bg-accent/40' : 'border-border'} ${iss.resolved ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium"><AlertTriangle className="h-3.5 w-3.5 text-gold" /> Measure {iss.measure}</span>
                    {iss.resolved && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{iss.type}</p>
                </button>
              ))}
            </div>
            {active && (
              <div className="mt-3 border-t border-border pt-3">
                <Button variant="outline" size="sm" className="w-full" onClick={handleMarkFixed}>{active.resolved ? 'Mark as unresolved' : 'Mark as fixed'}</Button>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate(`/score/${imp.scoreId}/edit`, { state: { focusMeasure: active?.measure, issueType: active?.type } })}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Fix in editor</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom actions — desktop */}
      <div className="hidden items-center justify-between border-t border-border px-4 py-3 md:flex">
        <span className="text-sm text-muted-foreground">{reviewed} of {issues.length} reviewed</span>
        <div className="flex gap-2">
          <Link to={`/score/${imp.scoreId}/edit`} state={{ focusMeasure: active?.measure, issueType: active?.type }}>
            <Button variant="outline"><Pencil className="mr-1.5 h-4 w-4" /> Fix in editor</Button>
          </Link>
          <Button onClick={handleLooksGood}><Check className="mr-1.5 h-4 w-4" /> Looks good</Button>
        </div>
      </div>

      {/* Mobile bottom actions */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 md:hidden">
        <span className="text-sm text-muted-foreground">{reviewed}/{issues.length}</span>
        <div className="flex gap-2">
          <Link to={`/score/${imp.scoreId}/edit`} state={{ focusMeasure: active?.measure, issueType: active?.type }}><Button variant="outline" size="sm"><Pencil className="mr-1 h-3.5 w-3.5" /> Editor</Button></Link>
          <Button size="sm" onClick={handleLooksGood}><Check className="mr-1 h-3.5 w-3.5" /> Looks good</Button>
        </div>
      </div>
    </div>
  );
}

function IssuesPanel({ issues, activeIssue, setActiveIssue, active, onMarkFixed, onFixInEditor }) {
  return (
    <>
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
          <Button variant="outline" size="sm" className="w-full" onClick={onMarkFixed}>{active.resolved ? 'Mark as unresolved' : 'Mark as fixed'}</Button>
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onFixInEditor}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Fix in editor</Button>
        </div>
      )}
    </>
  );
}