import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Check, Pencil, AlertTriangle, ChevronUp, ChevronDown, ScanLine } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import MockScanPage from '@/components/visuals/MockScanPage';
import { Button } from '@/components/ui/button';
import BackLink from '@/components/patterns/BackLink';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import StateMessage from '@/components/patterns/StateMessage';
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
  const [mobileView, setMobileView] = useState('recognized'); // 'original' | 'recognized'
  const [mobileIssuesOpen, setMobileIssuesOpen] = useState(false);

  if (!imp) {
    return (
      <div className="flex h-dvh items-center justify-center bg-surface-canvas">
        <StateMessage
          tone="neutral"
          title="Import not found"
          description="This import may have been removed, or the link may be incorrect."
          primaryAction={<Button onClick={() => navigate('/imports')}>Back to imports</Button>}
        />
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
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-line-subtle px-4 py-2.5 bg-surface-panel">
        <BackLink to={`/imports/${importId}`} label={imp.title} />
        <div className="flex items-center gap-3">
          {active && (
            <div className="hidden items-center gap-1 sm:flex">
              <button onClick={goPrev} disabled={issues.findIndex((i) => i.id === active.id) === 0} className="rounded-control p-1 text-ink-secondary hover:bg-surface-paper disabled:opacity-30" aria-label="Previous issue"><ChevronUp className="icon-sm" /></button>
              <button onClick={goNext} disabled={issues.findIndex((i) => i.id === active.id) === issues.length - 1} className="rounded-control p-1 text-ink-secondary hover:bg-surface-paper disabled:opacity-30" aria-label="Next issue"><ChevronDown className="icon-sm" /></button>
            </div>
          )}
          <span className="type-body-small text-ink-secondary">Recognition review</span>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="flex border-b border-line-subtle md:hidden bg-surface-panel">
        <button onClick={() => setMobileView('original')} className={`flex flex-1 items-center justify-center gap-1.5 py-2 type-body-small font-medium ${mobileView === 'original' ? 'border-b-2 border-brand text-brand' : 'text-ink-secondary'}`}><ScanLine className="icon-sm" /> Original</button>
        <button onClick={() => setMobileView('recognized')} className={`flex flex-1 items-center justify-center gap-1.5 py-2 type-body-small font-medium ${mobileView === 'recognized' ? 'border-b-2 border-brand text-brand' : 'text-ink-secondary'}`}><Pencil className="icon-sm" /> Recognized</button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Original scan — desktop */}
        <div className="hidden w-1/3 shrink-0 flex-col border-r border-line-subtle md:flex">
          <p className="border-b border-line-subtle px-4 py-2 type-caption text-ink-tertiary">Original scan</p>
          <div className="flex-1 overflow-auto bg-surface-canvas p-4">
            <div className="mx-auto max-w-sm rounded-container border border-line-subtle bg-surface-panel p-3 shadow-sm">
              <MockScanPage seed={importId + '-scan'} className="aspect-[3/4] w-full" showHighlight={!!active} highlightMeasure={active?.measure} />
              <p className="mt-2 text-center text-xs text-ink-tertiary">Page 1 (scan)</p>
              {active && <p className="mt-1 text-center text-xs text-warning">Highlight near measure {active.measure}</p>}
            </div>
          </div>
        </div>

        {/* Original scan — mobile */}
        {mobileView === 'original' && (
          <div className="flex-1 overflow-auto bg-surface-canvas p-4 md:hidden">
            <div className="mx-auto max-w-sm rounded-container border border-line-subtle bg-surface-panel p-3 shadow-sm">
              <MockScanPage seed={importId + '-scan'} className="aspect-[3/4] w-full" showHighlight={!!active} highlightMeasure={active?.measure} />
              <p className="mt-2 text-center text-xs text-ink-tertiary">Page 1 (scan)</p>
              {active && <p className="mt-1 text-center text-xs text-warning">Highlight near measure {active.measure}</p>}
            </div>
          </div>
        )}

        {/* Recognized score */}
        {(mobileView === 'recognized' || typeof window !== 'undefined') && (
          <div className={`min-w-0 flex-1 overflow-auto bg-surface-canvas p-6 ${mobileView === 'original' ? 'hidden md:block' : ''}`}>
            <p className="mb-3 type-caption text-ink-tertiary">Recognized score</p>
            <div className="mx-auto max-w-3xl rounded-md border border-line-subtle bg-surface-panel p-6 shadow-sm">
              <ScoreCanvas notes={notes} selectedIds={new Set()} onSelect={() => {}} zoom={1} activeIssueMeasure={active?.measure} />
              {active && (
                <div className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2">
                  <p className="text-sm font-medium text-warning">Measure {active.measure}: {active.type}</p>
                  <p className="type-caption text-ink-secondary">{active.detail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issues panel — desktop */}
        <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-line-subtle p-4 md:block">
          <IssuesPanel issues={issues} activeIssue={activeIssue} setActiveIssue={setActiveIssue} active={active} onMarkFixed={handleMarkFixed} onFixInEditor={() => navigate(`/score/${imp.scoreId}/edit`, { state: { importId, activeIssueId: active?.id } })} />
        </div>
      </div>

      {/* Mobile issues button */}
      <button onClick={() => setMobileIssuesOpen(true)} className="flex items-center justify-between border-t border-line-subtle px-4 py-3 md:hidden">
        <span className="text-sm font-medium">{issues.length} issues · {reviewed} reviewed</span>
        <ChevronUp className="h-4 w-4 text-ink-secondary" />
      </button>

      {/* Mobile issues sheet */}
      <Sheet open={mobileIssuesOpen} onOpenChange={setMobileIssuesOpen}>
        <SheetContent side="bottom" className="max-h-[70dvh] overflow-y-auto">
          <SheetHeader><SheetTitle>Issues to review</SheetTitle></SheetHeader>
          <div className="mt-3 space-y-2">
            {issues.map((iss) => (
              <button key={iss.id} onClick={() => { setActiveIssue(iss.id); setMobileIssuesOpen(false); }} className={`w-full rounded-control border p-3 text-left ${activeIssue === iss.id ? 'border-brand bg-brand-soft' : 'border-line-subtle'} ${iss.resolved ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium"><AlertTriangle className="h-3.5 w-3.5 text-warning" /> Measure {iss.measure}</span>
                  {iss.resolved && <Check className="h-3.5 w-3.5 text-success" />}
                </div>
                <p className="mt-0.5 type-metadata text-ink-tertiary">{iss.type}</p>
              </button>
            ))}
          </div>
          {active && (
            <div className="mt-3 border-t border-line-subtle pt-3">
              <Button variant="outline" size="sm" className="w-full" onClick={handleMarkFixed}>{active.resolved ? 'Mark as unresolved' : 'Mark as fixed'}</Button>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate(`/score/${imp.scoreId}/edit`, { state: { importId, activeIssueId: active?.id } })}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Fix in editor</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom actions — desktop */}
      <div className="hidden items-center justify-between border-t border-line-subtle px-4 py-3 md:flex bg-surface-panel">
        <span className="type-body-small text-ink-secondary">{reviewed} of {issues.length} reviewed</span>
        <div className="flex gap-2">
          <Link to={`/score/${imp.scoreId}/edit`} state={{ importId, activeIssueId: active?.id }}>
            <Button intent="secondary"><Pencil className="mr-1.5 icon-sm" /> Fix in editor</Button>
          </Link>
          <Button intent="primary" onClick={handleLooksGood}><Check className="mr-1.5 icon-sm" /> Looks good</Button>
        </div>
      </div>

      {/* Mobile bottom actions */}
      <div className="flex items-center justify-between border-t border-line-subtle px-4 py-3 md:hidden bg-surface-panel" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <span className="type-body-small text-ink-secondary">{reviewed}/{issues.length}</span>
        <div className="flex gap-2">
          <Link to={`/score/${imp.scoreId}/edit`} state={{ importId, activeIssueId: active?.id }}><Button intent="secondary" size="sm"><Pencil className="mr-1 icon-xs" /> Editor</Button></Link>
          <Button intent="primary" size="sm" onClick={handleLooksGood}><Check className="mr-1 icon-xs" /> Looks good</Button>
        </div>
      </div>
    </div>
  );
}

function IssuesPanel({ issues, activeIssue, setActiveIssue, active, onMarkFixed, onFixInEditor }) {
  return (
    <>
      <p className="type-caption text-ink-tertiary">Issues to review</p>
      <div className="mt-3 space-y-2">
        {issues.length === 0 && <p className="type-body-small text-ink-secondary">No issues detected.</p>}
        {issues.map((iss) => (
          <button
            key={iss.id}
            onClick={() => setActiveIssue(iss.id)}
            className={`w-full rounded-container border p-3 text-left transition-colors ${activeIssue === iss.id ? 'border-brand bg-brand/5 shadow-xs' : 'border-line-subtle bg-surface-panel hover:bg-surface-paper'} ${iss.resolved ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 type-body-small font-medium"><AlertTriangle className="icon-xs text-warning" /> Measure {iss.measure}</span>
              {iss.resolved && <Check className="icon-xs text-success" />}
            </div>
            <p className="mt-0.5 type-metadata text-ink-secondary">{iss.type}</p>
            <p className="mt-0.5 type-metadata text-ink-secondary">{iss.detail}</p>
            <p className="mt-1 type-metadata text-ink-tertiary">Confidence: {iss.confidence}</p>
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-4 border-t border-line-subtle pt-3 space-y-2">
          <Button intent="secondary" size="sm" className="w-full" onClick={onMarkFixed}>{active.resolved ? 'Mark as unresolved' : 'Mark as fixed'}</Button>
          <Button intent="secondary" size="sm" className="w-full" onClick={onFixInEditor}><Pencil className="mr-1.5 icon-xs" /> Fix in editor</Button>
        </div>
      )}
    </>
  );
}