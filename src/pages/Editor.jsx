import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Undo2, Redo2, Share2, MousePointer2, Music2, Trash2,
  ZoomIn, ZoomOut, Play, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle,
  Minus, Hash, Waves, Link2, Copy, Clipboard, ScanLine, X,
} from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import EditorInspector from '@/components/editor/EditorInspector';
import SharingDialog from '@/components/sharing/SharingDialog';
import { Button } from '@/components/ui/button';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'note', icon: Music2, label: 'Note' },
  { id: 'rest', icon: Minus, label: 'Rest' },
  { id: 'accidental', icon: Hash, label: 'Sharp' },
  { id: 'tie', icon: Link2, label: 'Tie' },
  { id: 'slur', icon: Waves, label: 'Slur' },
  { id: 'delete', icon: Trash2, label: 'Delete' },
];

export default function Editor() {
  const { scoreId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const scores = usePrototypeStore((s) => s.scores);
  const imports = usePrototypeStore((s) => s.imports);
  const score = useMemo(() => {
    const sc = scores.find((sc) => sc.id === scoreId);
    if (sc) return sc;
    const imp = imports.find((i) => i.scoreId === scoreId);
    if (imp && imp.pendingScore) {
      const ps = imp.pendingScore;
      return {
        id: imp.scoreId, title: ps.title || imp.title || 'Untitled', composer: ps.composer || 'Unknown',
        instrument: ps.instrument || 'Piano', tags: ps.tags || [], ownership: 'mine', favorite: false,
        folderIds: ps.folderIds || [], lastPlayed: 'never', lastMeasure: 1, tempo: 80,
        pages: ps.pages || imp.pages || 1, measures: 32, difficultSections: [],
        created: new Date().toISOString().slice(0, 10), source: ps.source || imp.source || 'PDF',
        currentVersion: 'Current version', versionRestoredAt: null, _pending: true,
      };
    }
    return null;
  }, [scores, imports, scoreId]);

  // Recognition issue context
  const importId = searchParams.get('import') || location.state?.importId;
  const activeIssueId = searchParams.get('issue') || location.state?.activeIssueId;
  const issues = usePrototypeStore((s) => (importId ? s.recognitionIssues[importId] || [] : []));
  const resolveIssue = usePrototypeStore((s) => s.resolveRecognitionIssue);
  const activeIssue = useMemo(() => issues.find((i) => i.id === activeIssueId) || null, [issues, activeIssueId]);

  const [notes, setNotes] = useState(() => generateNotes(scoreId));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [measure, setMeasure] = useState(1);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const [view, setView] = useState('score');
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [clipboard, setClipboard] = useState([]);
  const [tiePending, setTiePending] = useState(null);
  const [slurPending, setSlurPending] = useState(null);
  const [recovered, setRecovered] = useState(!!(location.state?.importId));
  const saveTimer = useRef(null);
  const noteCounter = useRef(0);

  const selectedList = useMemo(() => notes.filter((n) => selectedIds.has(n.id)), [notes, selectedIds]);
  const firstSelected = selectedList[0] || null;

  const commit = (updater) => {
    setPast((p) => [...p, notes]);
    setFuture([]);
    setNotes(updater);
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState('saved'), 900);
  };

  const undo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [notes, ...f]);
    setNotes(prev);
    setSelectedIds(new Set());
  };
  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, notes]);
    setNotes(next);
    setSelectedIds(new Set());
  };

  const handleSelect = (id, shiftKey) => {
    if (id === null) { setSelectedIds(new Set()); return; }
    if (tool === 'tie') {
      if (tiePending && tiePending !== id) {
        commit((prev) => prev.map((n) => n.id === tiePending ? { ...n, tieTo: id } : n));
        setTiePending(null);
      } else { setTiePending(id); }
      return;
    }
    if (tool === 'slur') {
      if (slurPending && slurPending !== id) {
        commit((prev) => prev.map((n) => n.id === slurPending ? { ...n, slurTo: id } : n));
        setSlurPending(null);
      } else { setSlurPending(id); }
      return;
    }
    if (tool === 'accidental') {
      commit((prev) => prev.map((n) => n.id === id ? { ...n, accidental: n.accidental === 'sharp' ? undefined : 'sharp' } : n));
      return;
    }
    if (shiftKey) {
      setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const updateNote = (next) => commit((prev) => prev.map((n) => (n.id === next.id ? next : n)));
  const addNote = (pos) => {
    const id = `n${Date.now()}-${noteCounter.current++}`;
    commit((prev) => [...prev, { id, ...pos, type: pos.type || 'note' }]);
    setSelectedIds(new Set([id]));
  };
  const deleteNote = (id) => {
    commit((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const deleteSelected = () => { commit((prev) => prev.filter((n) => !selectedIds.has(n.id))); setSelectedIds(new Set()); };
  const copySelected = () => { setClipboard(selectedList.map((n) => ({ ...n, id: undefined }))); };
  const paste = () => {
    if (clipboard.length === 0) return;
    const newNotes = clipboard.map((n, i) => ({ ...n, id: `n${Date.now()}-${noteCounter.current++}-${i}` }));
    commit((prev) => [...prev, ...newNotes]);
    setSelectedIds(new Set(newNotes.map((n) => n.id)));
  };
  const changeDurationSelected = (duration) => { commit((prev) => prev.map((n) => selectedIds.has(n.id) ? { ...n, duration } : n)); };

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const issueIdx = activeIssue ? issues.findIndex((i) => i.id === activeIssue.id) : -1;
  const goPrevIssue = () => { if (issueIdx > 0) { const next = issues[issueIdx - 1]; const url = new URL(window.location); url.searchParams.set('issue', next.id); window.history.replaceState(null, '', url.toString()); window.dispatchEvent(new PopStateEvent('popstate')); } };
  const goNextIssue = () => { if (issueIdx >= 0 && issueIdx < issues.length - 1) { const next = issues[issueIdx + 1]; const url = new URL(window.location); url.searchParams.set('issue', next.id); window.history.replaceState(null, '', url.toString()); window.dispatchEvent(new PopStateEvent('popstate')); } };
  const markIssueFixed = () => { if (activeIssue) resolveIssue(importId, activeIssue.id); };

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <p>Score not found.</p>
        <Link to="/library" className="text-primary underline">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-line-subtle px-3 py-2">
        <div className="flex items-center gap-3">
          <Link to={score._pending && importId ? `/imports/${importId}` : `/score/${scoreId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{score.title}</span>
          </Link>
          {activeIssue && (
            <span className="hidden items-center gap-1.5 rounded-md bg-gold/10 px-2 py-1 text-xs font-medium text-gold sm:flex">
              <AlertCircle className="h-3.5 w-3.5" /> Issue {issueIdx + 1} of {issues.length} · Measure {activeIssue.measure} · {activeIssue.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <SaveIndicator state={saveState} onRetry={() => { setSaveState('saving'); clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => setSaveState('saved'), 900); }} onFail={() => setSaveState('failed')} />
          <button onClick={undo} disabled={past.length === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
          <button onClick={redo} disabled={future.length === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
          <button onClick={copySelected} disabled={selectedIds.size === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Copy"><Copy className="h-4 w-4" /></button>
          <button onClick={paste} disabled={clipboard.length === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Paste"><Clipboard className="h-4 w-4" /></button>
          {!score._pending && <button onClick={() => setSharingOpen(true)} className="flex items-center gap-1.5 rounded-md border border-line-subtle px-2.5 py-1.5 hover:bg-accent"><Share2 className="h-4 w-4" /> Share</button>}
        </div>
      </div>

      {/* Recovered unsaved changes banner */}
      {recovered && (
        <div className="flex items-center justify-between border-b border-gold/30 bg-gold/5 px-4 py-2 text-sm">
          <span className="flex items-center gap-2 text-gold"><Check className="h-4 w-4" /> Recovered unsaved changes from your recognition review.</span>
          <button onClick={() => setRecovered(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Recognition issue nav bar */}
      {activeIssue && (
        <div className="flex items-center justify-between border-b border-line-subtle bg-gold/5 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gold">Recognition issue {issueIdx + 1} of {issues.length}</span>
            <span className="text-muted-foreground">· Measure {activeIssue.measure} · {activeIssue.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goPrevIssue} disabled={issueIdx === 0} className="rounded border border-line-subtle p-1.5 hover:bg-accent disabled:opacity-30" aria-label="Previous issue"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button onClick={goNextIssue} disabled={issueIdx >= issues.length - 1} className="rounded border border-line-subtle p-1.5 hover:bg-accent disabled:opacity-30" aria-label="Next issue"><ChevronRight className="h-3.5 w-3.5" /></button>
            <Button size="sm" variant="outline" onClick={markIssueFixed}>{activeIssue.resolved ? 'Unmark' : 'Mark fixed'}</Button>
          </div>
        </div>
      )}

      {/* Mobile tool bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line-subtle px-2 py-1.5 md:hidden no-scrollbar">
        {tools.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${tool === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 border-b border-line-subtle px-4 py-1.5">
        <ViewTab active={view === 'score'} onClick={() => setView('score')} icon={Music2} label="Score" />
        <ViewTab active={view === 'original'} onClick={() => setView('original')} icon={ScanLine} label="Original" />
        <ViewTab active={view === 'split'} onClick={() => setView('split')} icon={ChevronLeft} label="Side by side" />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Tool rail */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-line-subtle py-3 md:flex">
          {tools.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} className={`flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${tool === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
              <t.icon className="h-4 w-4" />
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
          <div className="mt-auto flex flex-col items-center gap-1">
            <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
            <span className="text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="min-w-0 flex-1 overflow-auto bg-surface-canvas p-6">
          {view === 'original' ? (
            <div className="mx-auto max-w-sm rounded-md border border-line-subtle bg-surface-panel p-4">
              <div className="staff-bg aspect-[3/4] w-full rounded border border-line-subtle opacity-60" />
              <p className="mt-2 text-center text-xs text-muted-foreground">Original scan · Page 1</p>
            </div>
          ) : view === 'split' ? (
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original</p>
                <div className="rounded-md border border-line-subtle bg-surface-panel p-4">
                  <div className="staff-bg aspect-[3/4] w-full rounded border border-line-subtle opacity-60" />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</p>
                <div className="mx-auto max-w-3xl rounded-md border border-line-subtle bg-surface-panel p-6 shadow-sm">
                  <ScoreCanvas notes={notes} selectedIds={selectedIds} onSelect={handleSelect} onAddNote={addNote} onDelete={deleteNote} tool={tool} zoom={zoom} activeIssueMeasure={activeIssue?.measure} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-md border border-line-subtle bg-surface-panel p-6 shadow-sm">
              <ScoreCanvas notes={notes} selectedIds={selectedIds} onSelect={handleSelect} onAddNote={addNote} onDelete={deleteNote} tool={tool} zoom={zoom} activeIssueMeasure={activeIssue?.measure} />
              <p className="mt-4 text-center text-sm text-muted-foreground">Page 1 of {score.pages}</p>
            </div>
          )}
        </div>

        {/* Inspector — desktop */}
        <div className="hidden w-60 shrink-0 overflow-y-auto border-l border-line-subtle p-4 lg:block">
          <EditorInspector note={firstSelected} onChange={updateNote} />
          {selectedIds.size > 1 && (
            <div className="mt-4 space-y-2 border-t border-line-subtle pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{selectedIds.size} notes selected</p>
              <Button variant="outline" size="sm" className="w-full" onClick={deleteSelected}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete selected</Button>
              <Button variant="outline" size="sm" className="w-full" onClick={copySelected}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy selected</Button>
              <div className="flex gap-1">
                {['1', '2', '4', '8'].map((d) => (
                  <button key={d} onClick={() => changeDurationSelected(d)} className="flex-1 rounded border border-line-subtle py-1 text-xs hover:bg-accent">{d}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile inspector trigger */}
      {firstSelected && (
        <button onClick={() => setMobileInspectorOpen(true)} className="flex items-center justify-between border-t border-line-subtle px-4 py-2.5 lg:hidden">
          <span className="text-sm font-medium">Edit note · {firstSelected.type === 'rest' ? 'Rest' : 'Note'} {firstSelected.measure + 1}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* Playback bar */}
      <div className="flex items-center justify-between border-t border-line-subtle px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90" aria-label="Play"><Play className="h-3.5 w-3.5" /></button>
          <span>Playback</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMeasure((m) => Math.max(1, m - 1))} className="rounded border border-line-subtle px-2 py-1 hover:bg-accent" aria-label="Previous measure"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span>Measure {measure} / {score.measures || 16}</span>
          <button onClick={() => setMeasure((m) => Math.min(score.measures || 16, m + 1))} className="rounded border border-line-subtle px-2 py-1 hover:bg-accent" aria-label="Next measure"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <SharingDialog open={sharingOpen} onOpenChange={setSharingOpen} score={score} />

      {/* Mobile inspector bottom sheet */}
      {mobileInspectorOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileInspectorOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-line-subtle bg-surface-panel p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Edit note</p>
              <button onClick={() => setMobileInspectorOpen(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3">
              <EditorInspector note={firstSelected} onChange={(n) => { updateNote(n); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewTab({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm ${active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function SaveIndicator({ state, onRetry, onFail }) {
  if (state === 'saving') return <span className="hidden items-center gap-1 text-muted-foreground sm:flex"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  if (state === 'failed') return (
    <span className="hidden items-center gap-2 sm:flex">
      <button onClick={onRetry} className="text-danger">Save failed — Retry</button>
      <button onClick={onFail} className="text-xs text-muted-foreground underline" title="Demo: simulate save failure">Demo fail</button>
    </span>
  );
  return (
    <span className="hidden items-center gap-2 text-primary sm:flex">
      <Check className="h-3.5 w-3.5" /> Saved
      <button onClick={onFail} className="text-xs text-muted-foreground underline" title="Demo: simulate save failure">Demo fail</button>
    </span>
  );
}