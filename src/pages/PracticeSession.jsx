import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Flag, Timer, RotateCcw, Mic, Piano, Check, AlertCircle, Repeat } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const noteSeq = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'E', 'G', 'F', 'D', 'C'];

export default function PracticeSession() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const inheritedRange = location.state?.range;
  const inheritedFrom = location.state?.rangeFrom;
  const inheritedTo = location.state?.rangeTo;
  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const addPracticeSession = usePrototypeStore((s) => s.addPracticeSession);
  const updateScoreLastPlayed = usePrototypeStore((s) => s.updateScoreLastPlayed);

  const [setup, setSetup] = useState(true);
  const [mode, setMode] = useState('follow');
  const [input, setInput] = useState('microphone');
  const [range, setRange] = useState(inheritedRange || 'whole');
  const [rangeFrom, setRangeFrom] = useState(inheritedFrom || 1);
  const [rangeTo, setRangeTo] = useState(inheritedTo || 16);
  const [tempoPct, setTempoPct] = useState(100);
  const [metronome, setMetronome] = useState(true);
  const [countIn, setCountIn] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loop, setLoop] = useState(false);
  const [micReady, setMicReady] = useState(null);
  const [midiReady, setMidiReady] = useState(null);

  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [activeMeasure, setActiveMeasure] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [notes] = useState(() => generateNotes(scoreId));
  const timer = useRef(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  useEffect(() => {
    if (!running || mode !== 'performance') return;
    const t = setInterval(() => advance(), 1400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, idx]);

  const advance = () => {
    setCorrect((c) => c + 1);
    setIdx((i) => {
      const next = i + 1;
      if (next >= noteSeq.length) {
        if (loop) { setActiveMeasure(rangeFrom); return 0; }
        finish();
        return i;
      }
      return next;
    });
    setActiveMeasure((m) => {
      const nextM = m + 1;
      const maxM = range === 'whole' ? (score?.measures || 32) : rangeTo;
      if (nextM > maxM) {
        if (loop) return rangeFrom;
        return maxM;
      }
      return nextM;
    });
  };

  const finish = () => {
    clearInterval(timer.current);
    const accuracy = Math.round((correct / noteSeq.length) * 100) || 88;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
    const rangeLabel = range === 'whole' ? 'Whole score' : range === 'tricky' ? `Measures ${rangeFrom}–${rangeTo}` : `Measures ${rangeFrom}–${rangeTo}`;
    const sessionId = `s-${Date.now()}`;
    addPracticeSession({
      id: sessionId,
      scoreId,
      duration: `${mins || 1} min`,
      mode: mode === 'follow' ? 'Follow' : 'Performance',
      input: input === 'microphone' ? 'Microphone' : 'MIDI',
      range: rangeLabel,
      insight: 'Nice session.',
      accuracy,
      trickyFrom: 34,
      trickyTo: 38,
    });
    updateScoreLastPlayed(scoreId, activeMeasure);
    navigate(`/practice/${sessionId}/summary`, {
      state: { scoreId, accuracy, duration, mode, input, tempo: tempoPct, trickyFrom: 34, trickyTo: 38, rangeLabel },
    });
  };

  if (!score) return <div className="px-8 py-16 text-center"><p>Score not found.</p><Button onClick={() => navigate('/library')} className="mt-4">Back to library</Button></div>;

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const originalTempo = score.tempo;
  const ready = input === 'microphone' ? micReady === true : midiReady === true;

  // ---- Setup / preflight ----
  if (setup) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
        <button onClick={() => navigate(`/score/${scoreId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {score.title}
        </button>
        <h1 className="mt-4 font-display text-2xl font-medium">Practice setup</h1>

        <div className="mt-6 space-y-6 rounded-md border border-border bg-card p-6">
          <Field label="Mode">
            <Seg options={[['follow', 'Follow notes'], ['performance', 'Performance']]} value={mode} onChange={setMode} />
            <p className="mt-1.5 text-xs text-muted-foreground">{mode === 'follow' ? 'Yueora waits for you to play each note before moving on.' : 'Yueora advances automatically — play along in real time.'}</p>
          </Field>
          <Field label="Input">
            <Seg options={[['microphone', 'Microphone'], ['midi', 'MIDI']]} value={input} onChange={setInput} />
          </Field>

          {input === 'microphone' ? (
            <Field label="Microphone readiness">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${micReady === true ? 'bg-primary' : micReady === false ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                  {micReady === true ? 'Microphone ready' : micReady === false ? 'Permission denied — allow access in your browser' : 'Not tested yet'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setMicReady(true)}><Mic className="mr-1.5 h-4 w-4" /> Test microphone</Button>
                  {micReady === false && <Button variant="outline" size="sm" onClick={() => setMicReady(null)}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset</Button>}
                </div>
                {micReady === false && <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> Allow microphone access, then test again.</p>}
              </div>
            </Field>
          ) : (
            <Field label="MIDI device">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${midiReady === true ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  {midiReady === true ? 'MIDI keyboard connected' : 'No device detected'}
                </div>
                <Button variant="outline" size="sm" onClick={() => setMidiReady(true)}><Piano className="mr-1.5 h-4 w-4" /> Detect devices</Button>
                {midiReady !== true && <p className="text-xs text-muted-foreground">Connect your MIDI device, then detect.</p>}
              </div>
            </Field>
          )}

          <Field label="Range">
            <Seg options={[['whole', 'Whole score'], ['selected', 'Selected measures'], ['tricky', 'Recent tricky section']]} value={range} onChange={setRange} />
            {range === 'selected' && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span>From</span><Input type="number" min={1} value={rangeFrom} onChange={(e) => setRangeFrom(Number(e.target.value))} className="h-8 w-20" />
                <span>To</span><Input type="number" min={1} value={rangeTo} onChange={(e) => setRangeTo(Number(e.target.value))} className="h-8 w-20" />
              </div>
            )}
            {range === 'tricky' && (
              <p className="mt-2 text-sm text-primary">Measures 34–38 — this section felt trickier last time.</p>
            )}
          </Field>

          <Field label={`Playback speed · ${tempoPct}% (original ${originalTempo} BPM)`}>
            <input type="range" min={50} max={150} value={tempoPct} onChange={(e) => setTempoPct(Number(e.target.value))} className="w-full accent-primary" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <ToggleRow label="Metronome" checked={metronome} onChange={setMetronome} />
            <ToggleRow label="Count-in" checked={countIn} onChange={setCountIn} />
            <ToggleRow label="Auto-scroll" checked={autoScroll} onChange={setAutoScroll} />
            <ToggleRow label="Loop range" checked={loop} onChange={setLoop} icon={Repeat} />
          </div>

          <div className="flex items-center justify-between">
            {!ready && <p className="text-xs text-muted-foreground">{input === 'microphone' ? 'Test your microphone to start.' : 'Detect your MIDI device to start.'}</p>}
            <Button onClick={() => { setSetup(false); setRunning(true); setIdx(0); setCorrect(0); setElapsed(0); setActiveMeasure(rangeFrom); }} disabled={!ready} className="ml-auto"><Play className="mr-1.5 h-4 w-4" /> Start practice</Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Practice workspace (immersive) ----
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button onClick={() => setExitOpen(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {score.title}
        </button>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${running ? 'bg-primary' : 'bg-muted-foreground'}`} /> {running ? 'Live' : 'Paused'}</span>
          <span className="capitalize">{input}</span>
          <span>{Math.round(originalTempo * tempoPct / 100)} BPM</span>
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium">Measure {activeMeasure}</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto bg-background p-6">
        <div className="w-full max-w-3xl rounded-md border border-border bg-card p-6 shadow-sm">
          <ScoreCanvas notes={notes} selectedId={null} onSelect={() => {}} zoom={1.1} />
          {autoScroll && <p className="mt-2 text-center text-xs text-muted-foreground">Auto-scrolling to measure {activeMeasure}</p>}
        </div>
      </div>

      {/* Live feedback */}
      <div className="border-t border-border bg-card px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current note</p>
        <p className="mt-0.5 font-display text-4xl font-medium">{noteSeq[idx]}</p>
        <div className="mt-1 flex items-center justify-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-primary"><Check className="h-4 w-4" /> matched</span>
          <span className="text-muted-foreground">next: {noteSeq[(idx + 1) % noteSeq.length]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-border px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
          <button onClick={() => setMetronome((m) => !m)} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${metronome ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
            <Timer className="h-4 w-4" /> Metronome
          </button>
          {mode === 'follow' ? (
            <Button onClick={advance} className="px-6"><Play className="mr-1.5 h-4 w-4" /> Play note</Button>
          ) : (
            <Button onClick={() => setRunning((r) => !r)} className="px-6">{running ? <><Pause className="mr-1.5 h-4 w-4" /> Pause</> : <><Play className="mr-1.5 h-4 w-4" /> Resume</>}</Button>
          )}
          <Button variant="outline" onClick={() => { setIdx(0); setCorrect(0); setElapsed(0); setActiveMeasure(rangeFrom); }} className="px-4"><RotateCcw className="mr-1.5 h-4 w-4" /> Restart</Button>
          <Button variant="outline" onClick={finish} className="px-4"><Flag className="mr-1.5 h-4 w-4" /> Finish</Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">{fmt(elapsed)} · {correct}/{noteSeq.length} notes · {loop ? 'Looping' : 'No loop'}</p>
      </div>

      {/* Exit confirmation */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Leave practice?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Your session is still going. You can save what you have so far, or discard it.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExitOpen(false)}>Keep playing</Button>
            <Button variant="outline" onClick={finish}>Save partial session</Button>
            <Button variant="destructive" onClick={() => navigate(`/score/${scoreId}`)}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }) {
  return <div><p className="mb-2 text-sm font-medium text-foreground">{label}</p>{children}</div>;
}
function Seg({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-border p-0.5">
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} className={`rounded px-3 py-1.5 text-sm ${value === v ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'}`}>{label}</button>
      ))}
    </div>
  );
}
function ToggleRow({ label, checked, onChange, icon: Icon }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <span className="flex items-center gap-1.5">{Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />} {label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${checked ? 'bg-primary' : 'bg-input'}`}>
        <span className={`block h-4 w-4 rounded-full bg-background transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}