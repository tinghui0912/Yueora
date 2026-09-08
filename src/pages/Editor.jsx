import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Undo2, Redo2, Share2, MousePointer2, Music2, Trash2,
  ZoomIn, ZoomOut, Play, ChevronLeft, ChevronRight, Check, Loader2,
} from 'lucide-react';
import { getScore, generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import EditorInspector from '@/components/editor/EditorInspector';
import SharingDialog from '@/components/sharing/SharingDialog';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'note', icon: Music2, label: 'Note' },
  { id: 'delete', icon: Trash2, label: 'Delete' },
];

export default function Editor() {
  const { scoreId } = useParams();
  const score = getScore(scoreId);
  const [notes, setNotes] = useState(() => generateNotes(scoreId));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [measure, setMeasure] = useState(1);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const saveTimer = useRef(null);
  const noteCounter = useRef(0);

  const selected = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

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
    setSelectedId(null);
  };
  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, notes]);
    setNotes(next);
    setSelectedId(null);
  };

  const updateNote = (next) => commit((prev) => prev.map((n) => (n.id === next.id ? next : n)));
  const addNote = (pos) => {
    const id = `n${Date.now()}-${noteCounter.current++}`;
    commit((prev) => [...prev, { id, ...pos }]);
    setSelectedId(id);
  };
  const deleteNote = (id) => {
    commit((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <p>Score not found.</p>
        <Link to="/library" className="text-primary underline">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-3">
          <Link to={`/score/${scoreId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{score.title}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <SaveIndicator state={saveState} onRetry={() => setSaveState('saving')} />
          <button onClick={undo} disabled={past.length === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
          <button onClick={redo} disabled={future.length === 0} className="rounded p-1.5 hover:bg-accent disabled:opacity-40" aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
          <button onClick={() => setSharingOpen(true)} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 hover:bg-accent"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </div>

      {/* Mobile tool bar */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5 md:hidden">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${tool === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Tool rail */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3 md:flex">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${tool === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            >
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

        {/* Canvas */}
        <div className="min-w-0 flex-1 overflow-auto bg-background p-6">
          <div className="mx-auto max-w-3xl rounded-md border border-border bg-card p-6 shadow-sm">
            <ScoreCanvas notes={notes} selectedId={selectedId} onSelect={setSelectedId} onAddNote={addNote} onDelete={deleteNote} tool={tool} zoom={zoom} />
            <p className="mt-4 text-center text-sm text-muted-foreground">Page 1 of {score.pages}</p>
          </div>
        </div>

        {/* Inspector */}
        <div className="hidden w-60 shrink-0 overflow-y-auto border-l border-border p-4 lg:block">
          <EditorInspector note={selected} onChange={updateNote} />
        </div>
      </div>

      {/* Playback bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90" aria-label="Play"><Play className="h-3.5 w-3.5" /></button>
          <span>Playback</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMeasure((m) => Math.max(1, m - 1))} className="rounded border border-border px-2 py-1 hover:bg-accent" aria-label="Previous measure"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span>Measure {measure} / {score.measures || 16}</span>
          <button onClick={() => setMeasure((m) => Math.min(score.measures || 16, m + 1))} className="rounded border border-border px-2 py-1 hover:bg-accent" aria-label="Next measure"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <SharingDialog open={sharingOpen} onOpenChange={setSharingOpen} score={score} />
    </div>
  );
}

function SaveIndicator({ state, onRetry }) {
  if (state === 'saving') return <span className="hidden items-center gap-1 text-muted-foreground sm:flex"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  if (state === 'failed') return <button onClick={onRetry} className="hidden items-center gap-1 text-destructive sm:flex">Save failed — Retry</button>;
  return <span className="hidden items-center gap-1 text-primary sm:flex"><Check className="h-3.5 w-3.5" /> Saved</span>;
}