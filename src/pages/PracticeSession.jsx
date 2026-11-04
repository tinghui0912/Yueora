import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Flag, Timer, RotateCcw, Check, Repeat, SkipForward,
  Settings2, MoreHorizontal, Video, EyeOff, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import { generateNotes } from '@/lib/mockData';
import { measureWindowStart, fmtClock, tempoLabel, rangeLabel } from '@/lib/practiceUtils';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import TempoPopover from '@/components/practice/TempoPopover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GROUPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'E', 'G', 'F', 'D', 'C'];

/**
 * Practice workspace — the music is prepared here, not the system.
 * Mode / input / recording arrived from Setup; Section, Tempo, Loop and Skip
 * live here because they only make sense once the score is in front of you.
 */
export default function PracticeSession() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config || null;
  const prefill = config?.prefill || null;

  const mode = config?.mode || 'follow';
  const input = config?.input || 'microphone';
  const recording = config?.recording || 'off';

  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const addPracticeSession = usePrototypeStore((s) => s.addPracticeSession);
  const updateScoreLastPlayed = usePrototypeStore((s) => s.updateScoreLastPlayed);

  const [notes] = useState(() => generateNotes(scoreId));

  const initialRange = prefill
    ? { kind: 'section', startGroupId: null, endGroupId: null, startMeasure: prefill.startMeasure || 1, endMeasure: prefill.endMeasure || prefill.startMeasure || 1 }
    : { kind: 'full', startGroupId: null, endGroupId: null, startMeasure: 1, endMeasure: 0 };

  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [sectionPhase, setSectionPhase] = useState('idle'); // idle | start | end
  const [pickWindow, setPickWindow] = useState(1);
  const [pendingStart, setPendingStart] = useState(null);

  const [tempoMode, setTempoMode] = useState('score');
  const [customBpm, setCustomBpm] = useState(score?.tempo || 80);
  const [metronome, setMetronome] = useState(true);
  const [loop, setLoop] = useState(false);

  const [phase, setPhase] = useState('ready'); // ready | countin | running | paused
  const [countBeat, setCountBeat] = useState(4);
  const [activeMeasure, setActiveMeasure] = useState(initialRange.startMeasure);
  const [visibleMeasureStart, setVisibleMeasureStart] = useState(() => measureWindowStart(initialRange.startMeasure));
  const [matched, setMatched] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [exitOpen, setExitOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selfViewHidden, setSelfViewHidden] = useState(false);
  const finished = useRef(false);

  const totalMeasures = score?.measures || 32;
  const maxMeasure = selectedRange.kind === 'section' ? selectedRange.endMeasure : totalMeasures;
  const loopAllowed = mode === 'follow' && selectedRange.kind === 'section';
  const bpm = tempoMode === 'fixed' ? customBpm : (score?.tempo || 80);
  const isActive = phase === 'running' || phase === 'paused';
  const tempoLocked = phase !== 'ready';
  const recordingOn = recording !== 'off';

  // Setup owns technical readiness — arriving here without it means going back.
  useEffect(() => {
    if (!config) navigate(`/score/${scoreId}/setup`, { replace: true });
  }, [config, navigate, scoreId]);

  // Session clock
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Performance: one measure of count-in, then the music runs.
  useEffect(() => {
    if (phase !== 'countin') return undefined;
    const t = setInterval(() => {
      setCountBeat((b) => {
        if (b <= 1) {
          setPhase('running');
          return 0;
        }
        return b - 1;
      });
    }, 600);
    return () => clearInterval(t);
  }, [phase]);

  // Performance advances on its own at the chosen tempo.
  useEffect(() => {
    if (phase !== 'running' || mode !== 'performance') return undefined;
    const interval = Math.min(2400, Math.max(400, Math.round(60000 / (bpm * 4)) * 4));
    const t = setInterval(() => advance(), interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, bpm, activeMeasure, selectedRange, loop]);

  // The playhead always stays visible — following the score is a system behavior,
  // not a toggle. Pausing hands the view back to you.
  useEffect(() => {
    if (phase === 'running' || phase === 'countin') {
      setVisibleMeasureStart(measureWindowStart(activeMeasure));
    }
  }, [activeMeasure, phase]);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const durationSec = Math.max(1, elapsed || 30);
    // Skipped groups are not wrong notes: they never lower accuracy.
    const accuracy = Math.max(56, Math.min(99, 100 - Math.floor(durationSec / 150)));
    const sessionId = `s-${Date.now()}`;
    const trickyFrom = selectedRange.kind === 'section'
      ? selectedRange.startMeasure
      : (score?.difficultSections?.[0]?.from || Math.min(Math.max(1, maxMeasure - 4), Math.floor(maxMeasure * 0.6)));
    const trickyTo = selectedRange.kind === 'section'
      ? selectedRange.endMeasure
      : (score?.difficultSections?.[0]?.to || Math.min(maxMeasure, trickyFrom + 4));

    addPracticeSession({
      id: sessionId,
      scoreId,
      duration: `${Math.max(1, Math.round(durationSec / 60))} min`,
      durationSec,
      mode: mode === 'follow' ? 'Follow' : 'Performance',
      input: input === 'microphone' ? 'Microphone' : 'MIDI',
      recordingMode: recording,
      mediaKind: recording === 'off' ? null : recording,
      tempoBpm: bpm,
      skippedGroups: skipped,
      rangeDetail: selectedRange.kind === 'full'
        ? { ...selectedRange, startMeasure: 1, endMeasure: maxMeasure }
        : selectedRange,
      range: rangeLabel(selectedRange),
      insight: 'Nice session.',
      accuracy,
      trickyFrom,
      trickyTo,
    });
    updateScoreLastPlayed(scoreId, activeMeasure);

    navigate(`/practice/${sessionId}/summary`, {
      state: {
        scoreId,
        accuracy,
        durationSec,
        duration: fmtClock(durationSec),
        tempoBpm: bpm,
        recordingMode: recording,
        skippedGroups: skipped,
        trickyFrom,
        trickyTo,
        rangeLabel: rangeLabel(selectedRange),
      },
    });
  }

  function advance() {
    const next = activeMeasure + 1;
    if (next > maxMeasure) {
      if (loop && loopAllowed) {
        setMatched((c) => c + 1);
        setActiveMeasure(selectedRange.startMeasure);
        return;
      }
      setMatched((c) => c + 1);
      finish();
      return;
    }
    setMatched((c) => c + 1);
    setActiveMeasure(next);
  }

  function skipGroup() {
    setSkipped((s) => s + 1);
    const next = activeMeasure + 1;
    if (next > maxMeasure) finish();
    else setActiveMeasure(next);
  }

  function startSession() {
    finished.current = false;
    setMatched(0);
    setSkipped(0);
    setElapsed(0);
    setActiveMeasure(selectedRange.startMeasure);
    setVisibleMeasureStart(measureWindowStart(selectedRange.startMeasure));
    setSectionPhase('idle');
    if (mode === 'performance') {
      setCountBeat(4);
      setPhase('countin');
    } else {
      setPhase('running');
    }
  }

  function restart() {
    finished.current = false;
    setPhase('ready');
    setMatched(0);
    setSkipped(0);
    setElapsed(0);
    setActiveMeasure(selectedRange.startMeasure);
    setVisibleMeasureStart(measureWindowStart(selectedRange.startMeasure));
  }

  function startSectionPick() {
    setSectionPhase('start');
    setPendingStart(null);
    setPickWindow(measureWindowStart(activeMeasure));
  }

  function handleSectionClick(noteId) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const measure = pickWindow + note.measure;
    const groupId = `${note.id}@${measure}`;
    if (sectionPhase === 'start') {
      setPendingStart({ measure, groupId });
      setSectionPhase('end');
      return;
    }
    if (sectionPhase === 'end' && pendingStart) {
      const forward = pendingStart.measure <= measure;
      const startMeasure = forward ? pendingStart.measure : measure;
      const endMeasure = forward ? measure : pendingStart.measure;
      setSelectedRange({
        kind: 'section',
        startGroupId: forward ? pendingStart.groupId : groupId,
        endGroupId: forward ? groupId : pendingStart.groupId,
        startMeasure,
        endMeasure,
      });
      setSectionPhase('idle');
      setPendingStart(null);
      if (activeMeasure < startMeasure || activeMeasure > endMeasure) {
        setActiveMeasure(startMeasure);
        setVisibleMeasureStart(measureWindowStart(startMeasure));
      }
      if (mode === 'performance') setLoop(false);
    }
  }

  function clearSection() {
    setSelectedRange({ kind: 'full', startGroupId: null, endGroupId: null, startMeasure: 1, endMeasure: 0 });
    setLoop(false);
    setSectionPhase('idle');
  }

  if (!score) {
    return (
      <div className="px-8 py-16 text-center">
        <p>Score not found.</p>
        <Button onClick={() => navigate('/library')} className="mt-4">Back to library</Button>
      </div>
    );
  }

  // A saved score inherits its share-link permissions — never broaden them here.
  if (!getPermissions(score).canPractice) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-xl">Practice isn’t available for this score</p>
        <p className="mt-2 text-sm text-ink-secondary">The link you saved it from didn’t include practice access, so it wasn’t carried into your library.</p>
        <Button onClick={() => navigate(`/score/${scoreId}`)} className="mt-4">Back to score</Button>
      </div>
    );
  }

  if (!config) return null;

  const selecting = sectionPhase !== 'idle';
  const canvasStart = selecting ? pickWindow : visibleMeasureStart;
  const hint =
    phase === 'ready'
      ? mode === 'follow'
        ? 'Set a section or tempo if you like, then start. Nothing is timed.'
        : 'One measure of count-in, then the take runs from start to finish.'
      : phase === 'countin'
        ? 'Count-in…'
        : phase === 'running'
          ? mode === 'follow'
            ? 'Ready. Play the current note.'
            : 'Playing — keep going.'
          : 'Paused. Take your time.';

  return (
    <div className="flex h-dvh flex-col bg-surface-canvas">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle bg-surface-panel px-3 py-3 md:px-5">
        <button
          onClick={() => (phase === 'ready' ? navigate(`/score/${scoreId}`) : setExitOpen(true))}
          className="flex min-w-0 items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{score.title}</span>
        </button>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {recording === 'video' && !selfViewHidden && (
            <div
              role="img"
              aria-label="Camera preview"
              className="relative hidden h-11 w-16 items-center justify-center overflow-hidden rounded-control border border-line-subtle bg-gradient-to-br from-ink-primary/30 to-ink-primary/5 sm:flex"
            >
              <Video className="h-4 w-4 text-surface-panel/70" aria-hidden="true" />
              {phase === 'running' && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-danger px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-danger-foreground">
                  <span className="h-1 w-1 rounded-full bg-danger-foreground" /> REC
                </span>
              )}
            </div>
          )}
          <span className="flex items-center gap-1 whitespace-nowrap type-body-small text-ink-secondary">
            <span className={`h-2 w-2 rounded-full ${phase === 'running' ? 'bg-practice-current' : phase === 'countin' ? 'bg-practice-current/60' : 'bg-ink-tertiary'}`} />
            {phase === 'running' ? 'Live' : phase === 'countin' ? 'Count-in' : phase === 'paused' ? 'Paused' : 'Ready'}
          </span>
          <span className="hidden whitespace-nowrap type-body-small text-ink-secondary capitalize md:inline">{input}</span>
          <span className="whitespace-nowrap rounded-control bg-practice-current/15 px-2 py-0.5 text-xs font-medium text-practice-current">
            Measure {activeMeasure}
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-control border border-line-subtle p-1.5 text-ink-secondary hover:bg-accent"
            aria-label="Session settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Score — the central surface */}
      <div className="relative flex-1 overflow-auto px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-3xl">
          {selecting && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-container border border-line-subtle bg-surface-panel px-3 py-2">
              <p className="type-body-small text-ink-primary">
                {sectionPhase === 'start'
                  ? 'Choose where you want to start.'
                  : 'Start selected. Choose where you want to stop.'}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPickWindow((w) => Math.max(1, w - 4))}
                  disabled={pickWindow <= 1}
                  className="rounded-control border border-line-subtle p-1.5 disabled:opacity-40"
                  aria-label="Previous measures"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 type-metadata text-ink-secondary">{pickWindow}–{Math.min(totalMeasures, pickWindow + 3)}</span>
                <button
                  onClick={() => setPickWindow((w) => Math.min(measureWindowStart(totalMeasures), w + 4))}
                  disabled={pickWindow + 4 > totalMeasures}
                  className="rounded-control border border-line-subtle p-1.5 disabled:opacity-40"
                  aria-label="Next measures"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => { setSectionPhase('idle'); setPendingStart(null); }} className="ml-1 rounded-control border border-line-subtle p-1.5" aria-label="Cancel section selection">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="rounded-container border border-line-subtle bg-surface-panel p-4 shadow-raised md:p-6">
            <ScoreCanvas
              notes={notes}
              selectedIds={null}
              onSelect={selecting ? handleSectionClick : () => {}}
              zoom={1.1}
              activeMeasure={selecting ? null : activeMeasure}
              activeMeasureVariant="practice"
              measureStart={canvasStart}
              selectedMeasures={selectedRange.kind === 'section' ? { from: selectedRange.startMeasure, to: selectedRange.endMeasure } : null}
            />

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 type-metadata text-ink-tertiary">
              <span>Showing measures {canvasStart}–{Math.min(totalMeasures, canvasStart + 3)}</span>
              {!selecting && phase === 'paused' && measureWindowStart(activeMeasure) !== visibleMeasureStart && (
                <button onClick={() => setVisibleMeasureStart(measureWindowStart(activeMeasure))} className="text-brand hover:underline">
                  Return to current position
                </button>
              )}
              {!selecting && phase !== 'running' && (
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => setVisibleMeasureStart((w) => Math.max(1, w - 4))}
                    disabled={visibleMeasureStart <= 1}
                    className="rounded p-0.5 disabled:opacity-40"
                    aria-label="Browse previous measures"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setVisibleMeasureStart((w) => Math.min(measureWindowStart(totalMeasures), w + 4))}
                    disabled={visibleMeasureStart + 4 > totalMeasures}
                    className="rounded p-0.5 disabled:opacity-40"
                    aria-label="Browse next measures"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {phase === 'countin' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-canvas/70">
            <div className="text-center">
              <p className="type-metric text-6xl text-ink-primary">{countBeat > 0 ? countBeat : '—'}</p>
              <p className="mt-2 type-body-small text-ink-secondary">One measure count-in</p>
            </div>
          </div>
        )}
      </div>

      {/* Live feedback / status */}
      <div className="border-t border-line-subtle bg-surface-panel px-4 py-2 text-center">
        {mode === 'follow' && phase !== 'ready' ? (
          <>
            <p className="type-caption text-ink-tertiary">Current note</p>
            <p className="type-display text-2xl text-ink-primary">{GROUPS[activeMeasure % GROUPS.length]}</p>
            <p className="flex items-center justify-center gap-2 type-metadata text-ink-secondary">
              <span className="flex items-center gap-1 text-practice-correct"><Check className="h-3.5 w-3.5" aria-hidden="true" /> matched</span>
              <span className="text-ink-tertiary">· {skipped} skipped</span>
            </p>
          </>
        ) : (
          <p className="type-body-small text-ink-secondary">{hint}</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-t border-line-subtle bg-surface-panel px-3 py-3 md:px-5" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
          {phase === 'ready' ? (
            <Button onClick={startSession} className="px-5">
              <Play className="mr-1.5 h-4 w-4" /> Start
            </Button>
          ) : mode === 'performance' ? (
            <Button
              onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
              className="px-5"
              disabled={phase === 'countin'}
            >
              {phase === 'running' ? <><Pause className="mr-1.5 h-4 w-4" /> Pause</> : <><Play className="mr-1.5 h-4 w-4" /> Resume</>}
            </Button>
          ) : (
            <Button
              onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
              className="px-5"
            >
              {phase === 'running' ? <><Pause className="mr-1.5 h-4 w-4" /> Pause</> : <><Play className="mr-1.5 h-4 w-4" /> Resume</>}
            </Button>
          )}

          <TempoPopover
            triggerLabel={tempoLocked ? 'Tempo is locked while playing' : 'Tempo and metronome'}
            trigger={
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-control border px-3 py-2 text-sm ${metronome ? 'border-line-strong text-ink-primary' : 'border-line-subtle text-ink-secondary'}`}
              >
                <Timer className="h-4 w-4" aria-hidden="true" /> Tempo · {tempoLabel(tempoMode, bpm)}
                {metronome && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />}
              </button>
            }
            scoreTempo={score.tempo}
            hasTempoChanges={false}
            tempoMode={tempoMode}
            customBpm={customBpm}
            bpm={bpm}
            locked={tempoLocked}
            metronome={metronome}
            onTempoMode={setTempoMode}
            onBpm={(v) => { setTempoMode('fixed'); setCustomBpm(v); }}
            onMetronome={setMetronome}
          />

          <button
            type="button"
            onClick={selecting ? () => { setSectionPhase('idle'); setPendingStart(null); } : startSectionPick}
            className={`flex items-center gap-1.5 rounded-control border px-3 py-2 text-sm ${selectedRange.kind === 'section' ? 'border-brand text-brand' : 'border-line-subtle text-ink-secondary hover:bg-accent/50'}`}
          >
            Section{selectedRange.kind === 'section' ? ` ${selectedRange.startMeasure}–${selectedRange.endMeasure}` : ''}
          </button>

          {loopAllowed && (
            <button
              type="button"
              onClick={() => setLoop((l) => !l)}
              aria-pressed={loop}
              className={`hidden items-center gap-1.5 rounded-control border px-3 py-2 text-sm sm:flex ${loop ? 'border-brand text-brand' : 'border-line-subtle text-ink-secondary hover:bg-accent/50'}`}
            >
              <Repeat className="h-4 w-4" aria-hidden="true" /> Loop
            </button>
          )}

          {mode === 'follow' && isActive && (
            <Button variant="outline" onClick={skipGroup} className="px-3">
              <SkipForward className="mr-1.5 h-4 w-4" /> Skip
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden type-metadata text-ink-tertiary sm:inline">
              {fmtClock(elapsed)} · {matched} matched{skipped > 0 ? ` · ${skipped} skipped` : ''}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-control border border-line-subtle p-2 text-ink-secondary hover:bg-accent" aria-label="More session actions">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {loopAllowed && (
                  <DropdownMenuItem onClick={() => setLoop((l) => !l)} className="sm:hidden">
                    <Repeat className="mr-2 h-4 w-4" /> {loop ? 'Turn loop off' : 'Loop section'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings2 className="mr-2 h-4 w-4" /> Session settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={restart}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restart
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={finish}>
                  <Flag className="mr-2 h-4 w-4" /> Finish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Session settings — identity can be changed only by returning to setup */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session settings</DialogTitle>
            <DialogDescription>What this session was prepared for.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 type-body-small">
            <div className="flex justify-between"><dt className="text-ink-secondary">Mode</dt><dd className="text-ink-primary">{mode === 'follow' ? 'Follow notes' : 'Performance'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-secondary">Input</dt><dd className="text-ink-primary">{input === 'midi' ? 'MIDI' : 'Microphone'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-secondary">Recording</dt><dd className="text-ink-primary capitalize">{recording}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-secondary">Section</dt><dd className="text-ink-primary">{rangeLabel(selectedRange)}</dd></div>
          </dl>
          {recording === 'video' && (
            <div className="flex items-center justify-between border-t border-line-subtle pt-3">
              <span className="flex items-center gap-2 type-body-small text-ink-primary"><EyeOff className="h-4 w-4 text-ink-tertiary" aria-hidden="true" /> Hide self-view</span>
              <Switch checked={selfViewHidden} onCheckedChange={setSelfViewHidden} aria-label="Hide self-view" />
            </div>
          )}
          <p className="type-metadata text-ink-tertiary">
            Mode, input and recording are prepared in setup. Changing them ends this session.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
            <Button asChild variant="outline">
              <Link to={`/score/${scoreId}/setup`}>Return to setup</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit confirmation */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Leave practice?</DialogTitle></DialogHeader>
          <p className="text-sm text-ink-secondary">Your session is still going. You can keep what you have so far, or let it go.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExitOpen(false)}>Keep playing</Button>
            <Button variant="outline" onClick={() => { setExitOpen(false); finish(); }}>Save &amp; leave</Button>
            <Button variant="destructive" onClick={() => navigate(`/score/${scoreId}`)}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}