import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import {
  Undo2, Redo2, Share2, MousePointer2, Music2, Trash2,
  ZoomIn, ZoomOut, Play, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle,
  Minus, Hash, Waves, Link2, Copy, Clipboard, ScanLine, X,
} from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import EditorInspector from '@/components/editor/EditorInspector';
import SharingDialog from '@/components/sharing/SharingDialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedControl, SegmentedControlItem } from '@/components/patterns/SegmentedControl';
import BackLink from '@/components/patterns/BackLink';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  const goPrevIssue = () => { if (issueIdx > 0) { const next = issues[issueIdx - 1]; const url = new URL(window.location.href); url.searchParams.set('issue', next.id); window.history.replaceState(null, '', url.toString()); window.dispatchEvent(new PopStateEvent('popstate')); } };
  const goNextIssue = () => { if (issueIdx >= 0 && issueIdx < issues.length - 1) { const next = issues[issueIdx + 1]; const url = new URL(window.location.href); url.searchParams.set('issue', next.id); window.history.replaceState(null, '', url.toString()); window.dispatchEvent(new PopStateEvent('popstate')); } };
  const markIssueFixed = () => { if (activeIssue) resolveIssue(importId, activeIssue.id); };

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <p>Score not found.</p>
        <Link to="/library" className="text-brand hover:underline">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-line-subtle bg-surface-panel px-3 py-2">
        <div className="flex items-center gap-3">
          <BackLink to={score._pending && importId ? `/imports/${importId}` : `/score/${scoreId}`} label={score.title} />
          {activeIssue && (
            <span className="hidden items-center gap-1.5 rounded-control bg-gold/10 px-2.5 py-1 type-caption text-gold sm:flex">
              <AlertCircle className="icon-xs" /> Issue {issueIdx + 1} of {issues.length} · Measure {activeIssue.measure} · {activeIssue.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 type-body-small text-ink-secondary">
          <SaveIndicator state={saveState} onRetry={() => { setSaveState('saving'); clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => setSaveState('saved'), 900); }} onFail={() => setSaveState('failed')} />
          <IconButton icon={Undo2} size="sm" tone="quiet" label="Undo" onClick={undo} disabled={past.length === 0} />
          <IconButton icon={Redo2} size="sm" tone="quiet" label="Redo" onClick={redo} disabled={future.length === 0} />
          <IconButton icon={Copy} size="sm" tone="quiet" label="Copy" onClick={copySelected} disabled={selectedIds.size === 0} />
          <IconButton icon={Clipboard} size="sm" tone="quiet" label="Paste" onClick={paste} disabled={clipboard.length === 0} />
          {!score._pending && (
            <Button intent="secondary" size="xs" onClick={() => setSharingOpen(true)}>
              <Share2 className="icon-xs" /> Share
            </Button>
          )}
        </div>
      </div>

      {/* Recovered unsaved changes banner */}
      {recovered && (
        <div className="flex items-center justify-between border-b border-gold/30 bg-gold/5 px-4 py-2 type-body-small">
          <span className="flex items-center gap-2 text-gold"><Check className="icon-sm" aria-hidden="true" /> Recovered unsaved changes from your recognition review.</span>
          <IconButton icon={X} label="Dismiss banner" tone="quiet" size="xs" onClick={() => setRecovered(false)} />
        </div>
      )}

      {/* Recognition issue nav bar */}
      {activeIssue && (
        <div className="flex items-center justify-between border-b border-line-subtle bg-gold/5 px-4 py-2">
          <div className="flex items-center gap-2 type-body-small">
            <span className="font-medium text-gold">Recognition issue {issueIdx + 1} of {issues.length}</span>
            <span className="text-ink-secondary">· Measure {activeIssue.measure} · {activeIssue.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={ChevronLeft}
              label="Previous issue"
              tone="outline"
              size="xs"
              onClick={goPrevIssue}
              disabled={issueIdx === 0}
            />
            <IconButton
              icon={ChevronRight}
              label="Next issue"
              tone="outline"
              size="xs"
              onClick={goNextIssue}
              disabled={issueIdx >= issues.length - 1}
            />
            <Button size="sm" intent="secondary" onClick={markIssueFixed}>{activeIssue.resolved ? 'Unmark' : 'Mark fixed'}</Button>
          </div>
        </div>
      )}

      {/* Mobile tool bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line-subtle bg-surface-panel px-2 py-1.5 md:hidden no-scrollbar">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-control px-2.5 py-1.5 type-body-small font-medium transition-colors ${
              tool === t.id
                ? 'bg-neutral-muted font-semibold text-ink-primary'
                : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
            }`}
          >
            <t.icon className={`h-4 w-4 ${tool === t.id ? 'text-brand' : ''}`} /> {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <IconButton icon={ZoomOut} label="Zoom out" tone="quiet" size="xs" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} />
          <span className="type-metadata font-medium text-ink-secondary">{Math.round(zoom * 100)}%</span>
          <IconButton icon={ZoomIn} label="Zoom in" tone="quiet" size="xs" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} />
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 border-b border-line-subtle bg-surface-canvas/60 px-4 py-1.5">
        <SegmentedControl value={view} onValueChange={setView} aria-label="View mode">
          <SegmentedControlItem value="score">
            <Music2 className="icon-xs" />
            <span>Score</span>
          </SegmentedControlItem>
          <SegmentedControlItem value="original">
            <ScanLine className="icon-xs" />
            <span>Original</span>
          </SegmentedControlItem>
          <SegmentedControlItem value="split">
            <ChevronLeft className="icon-xs" />
            <span>Side by side</span>
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Tool rail */}
        <div className="hidden w-16 shrink-0 flex-col items-center gap-1.5 border-r border-line-subtle bg-surface-panel py-3 md:flex">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-control transition-colors ${
                tool === t.id
                  ? 'bg-neutral-muted font-semibold text-ink-primary'
                  : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
              }`}
            >
              <t.icon className={`h-4 w-4 ${tool === t.id ? 'text-brand' : ''}`} />
              <span className="type-metadata font-medium">{t.label}</span>
            </button>
          ))}
          <div className="mt-auto flex flex-col items-center gap-1">
            <IconButton icon={ZoomIn} label="Zoom in" tone="quiet" size="sm" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} />
            <span className="type-metadata font-medium text-ink-secondary">{Math.round(zoom * 100)}%</span>
            <IconButton icon={ZoomOut} label="Zoom out" tone="quiet" size="xs" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} />
          </div>
        </div>

        {/* Canvas area */}
        <div className="min-w-0 flex-1 overflow-auto bg-surface-canvas p-6">
          {view === 'original' ? (
            <div className="mx-auto max-w-sm rounded-container border border-line-subtle bg-surface-panel p-4">
              <div className="staff-bg aspect-[3/4] w-full rounded-control border border-line-subtle opacity-60" />
              <p className="mt-2 text-center type-metadata text-ink-secondary">Original scan · Page 1</p>
            </div>
          ) : view === 'split' ? (
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="mb-2 type-caption text-ink-secondary/70">Original</p>
                <div className="rounded-container border border-line-subtle bg-surface-panel p-4">
                  <div className="staff-bg aspect-[3/4] w-full rounded-control border border-line-subtle opacity-60" />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-2 type-caption text-ink-secondary/70">Score</p>
                <div className="mx-auto max-w-3xl rounded-container border border-line-subtle bg-surface-panel p-6">
                  <ScoreCanvas notes={notes} selectedIds={selectedIds} onSelect={handleSelect} onAddNote={addNote} onDelete={deleteNote} tool={tool} zoom={zoom} activeIssueMeasure={activeIssue?.measure} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-container border border-line-subtle bg-surface-panel p-6">
              <ScoreCanvas notes={notes} selectedIds={selectedIds} onSelect={handleSelect} onAddNote={addNote} onDelete={deleteNote} tool={tool} zoom={zoom} activeIssueMeasure={activeIssue?.measure} />
              <p className="mt-4 text-center type-body-small text-ink-secondary">Page 1 of {score.pages}</p>
            </div>
          )}
        </div>

        {/* Inspector — desktop */}
        <div className="hidden w-64 shrink-0 overflow-y-auto border-l border-line-subtle bg-surface-panel p-4 lg:block">
          <EditorInspector note={firstSelected} onChange={updateNote} />
          {selectedIds.size > 1 && (
            <div className="mt-4 space-y-2.5 border-t border-line-subtle pt-3.5">
              <p className="type-caption text-ink-secondary/70">{selectedIds.size} notes selected</p>
              <Button intent="secondary" size="sm" className="w-full" onClick={deleteSelected}><Trash2 className="mr-1.5" /> Delete selected</Button>
              <Button intent="secondary" size="sm" className="w-full" onClick={copySelected}><Copy className="mr-1.5" /> Copy selected</Button>
              <div className="flex gap-1.5">
                {['1', '2', '4', '8'].map((d) => (
                  <Button key={d} intent="secondary" size="xs" className="flex-1" onClick={() => changeDurationSelected(d)}>{d}</Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile inspector trigger */}
      {firstSelected && (
        <button onClick={() => setMobileInspectorOpen(true)} className="flex items-center justify-between border-t border-line-subtle bg-surface-panel px-4 py-2.5 lg:hidden">
          <span className="type-body-small font-medium text-ink-primary">Edit note · {/** @type {any} */ (firstSelected).type === 'rest' ? 'Rest' : 'Note'} {firstSelected.measure + 1}</span>
          <ChevronRight className="icon-sm text-ink-secondary" />
        </button>
      )}

      {/* Playback bar */}
      <div className="flex items-center justify-between border-t border-line-subtle bg-surface-panel px-4 py-2.5 type-body-small text-ink-secondary">
        <div className="flex items-center gap-2">
          <IconButton icon={Play} label="Play" tone="primary" size="sm" />
          <span className="font-medium text-ink-primary">Playback</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={ChevronLeft} label="Previous measure" tone="outline" size="xs" onClick={() => setMeasure((m) => Math.max(1, m - 1))} />
          <span className="type-metadata font-medium text-ink-secondary">Measure {measure} / {score.measures || 16}</span>
          <IconButton icon={ChevronRight} label="Next measure" tone="outline" size="xs" onClick={() => setMeasure((m) => Math.min(score.measures || 16, m + 1))} />
        </div>
      </div>

      <SharingDialog open={sharingOpen} onOpenChange={setSharingOpen} score={score} />

      {/* Mobile inspector bottom sheet */}
      <Sheet open={mobileInspectorOpen} onOpenChange={setMobileInspectorOpen}>
        <SheetContent side="bottom" className="max-h-[70dvh] overflow-y-auto lg:hidden">
          <SheetHeader>
            <SheetTitle>Edit note</SheetTitle>
          </SheetHeader>
          <div className="mt-3">
            <EditorInspector note={firstSelected} onChange={(n) => { updateNote(n); }} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SaveIndicator({ state, onRetry, onFail }) {
  if (state === 'saving') return <span className="hidden items-center gap-1 type-body-small text-ink-secondary sm:flex"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  if (state === 'failed') return (
    <span className="hidden items-center gap-2 sm:flex">
      <Button intent="danger" size="xs" onClick={onRetry}>Retry</Button>
      <button onClick={onFail} className="type-metadata text-ink-tertiary underline" title="Demo: simulate save failure">Demo fail</button>
    </span>
  );
  return (
    <span className="hidden items-center gap-2 type-body-small text-brand font-medium sm:flex">
      <Check className="h-4 w-4" /> Saved
      <button onClick={onFail} className="type-metadata text-ink-tertiary underline" title="Demo: simulate save failure">Demo fail</button>
    </span>
  );
}