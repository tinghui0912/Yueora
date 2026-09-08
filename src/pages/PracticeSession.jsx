import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Timer, Pause, Play, Check, Flag } from 'lucide-react';
import { getScore, buildSummary } from '@/lib/mockData';
import ScorePreview from '@/components/library/ScorePreview';
import { Button } from '@/components/ui/button';

const noteSeq = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'E', 'G', 'F', 'D', 'C'];

export default function PracticeSession() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const score = getScore(scoreId);

  const [setup, setSetup] = useState(true);
  const [mode, setMode] = useState('follow');
  const [input, setInput] = useState('microphone');
  const [range, setRange] = useState('whole');
  const [tempo, setTempo] = useState(100);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState('1');

  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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
      if (i + 1 >= noteSeq.length) {
        finish();
        return i;
      }
      return i + 1;
    });
  };

  const finish = () => {
    clearInterval(timer.current);
    const accuracy = Math.round((correct / noteSeq.length) * 100) || 88;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    navigate(`/practice/${scoreId}-session/summary`, {
      state: { scoreId, accuracy, duration: `${mins}:${secs.toString().padStart(2, '0')}`, mode, input, tempo },
    });
  };

  if (!score) {
    return <div className="px-8 py-16 text-center"><p>Score not found.</p><Button onClick={() => navigate('/library')} className="mt-4">Back to library</Button></div>;
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (setup) {
    return (
      <div className="px-4 py-6 md:px-8">
        <button onClick={() => navigate(`/score/${scoreId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {score.title}
        </button>
        <h1 className="mt-4 font-display text-2xl font-medium">Practice setup</h1>
        <div className="mt-6 max-w-xl space-y-6 rounded-md border border-border bg-card p-6">
          <Field label="Mode">
            <Seg options={[['follow', 'Follow notes'], ['performance', 'Performance']]} value={mode} onChange={setMode} />
          </Field>
          <Field label="Input">
            <Seg options={[['microphone', 'Microphone'], ['midi', 'MIDI']]} value={input} onChange={setInput} />
          </Field>
          <Field label="Range">
            <Seg options={[['whole', 'Whole score'], ['selected', 'Selected measures']]} value={range} onChange={setRange} />
          </Field>
          <Field label={`Tempo · ${tempo}%`}>
            <input type="range" min={50} max={150} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full accent-primary" />
          </Field>
          <Field label="Metronome">
            <Seg options={[['off', 'Off'], ['on', 'On']]} value={metronome ? 'on' : 'off'} onChange={(v) => setMetronome(v === 'on')} />
          </Field>
          <Field label="Count-in">
            <Seg options={[['0', 'Off'], ['1', '1 bar'], ['2', '2 bars']]} value={countIn} onChange={setCountIn} />
          </Field>
          <div className="flex justify-end">
            <Button onClick={() => { setSetup(false); setRunning(true); setIdx(0); setCorrect(0); setElapsed(0); }}>
              <Play className="mr-1 h-4 w-4" /> Start practice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
        <button onClick={() => navigate(`/score/${scoreId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {score.title}
        </button>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{tempo} BPM</span>
          <span className="capitalize">{input}</span>
          <span className={`flex items-center gap-1 ${input === 'midi' ? 'text-primary' : ''}`}>
            <span className={`h-2 w-2 rounded-full ${running ? 'bg-primary' : 'bg-muted-foreground'}`} /> {running ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl rounded-md border border-border bg-card p-4">
          <div className="aspect-[16/9]">
            <ScorePreview id={score.id} className="h-full w-full" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current note</p>
          <p className="mt-1 font-display text-5xl font-medium">{noteSeq[idx]}</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-primary">✓ correct</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Next: {noteSeq[(idx + 1) % noteSeq.length]}</p>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            onClick={() => setMetronome((m) => !m)}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${metronome ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
          >
            <Timer className="h-4 w-4" /> Metronome
          </button>
          {mode === 'follow' ? (
            <Button onClick={advance} className="px-6">
              <Play className="mr-1 h-4 w-4" /> Play note
            </Button>
          ) : (
            <Button onClick={() => running ? setRunning(false) : setRunning(true)} className="px-6">
              {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {running ? 'Pause' : 'Resume'}
            </Button>
          )}
          <Button variant="outline" onClick={finish} className="px-6">
            <Flag className="mr-1 h-4 w-4" /> Finish
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">{fmt(elapsed)} · {correct}/{noteSeq.length} notes</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded px-3 py-1.5 text-sm ${value === v ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}