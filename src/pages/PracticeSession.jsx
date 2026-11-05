import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Flag, Timer, RotateCcw, Repeat, Settings2,
  MoreHorizontal, Video, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import { usePracticeRuntime } from '@/stores/practiceRuntime';
import { generateNotes } from '@/lib/mockData';
import { measureWindowStart, fmtClock, tempoLabel, rangeLabel } from '@/lib/practiceUtils';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import TempoPopover from '@/components/practice/TempoPopover';
import FollowFeedback from '@/components/practice/FollowFeedback';
import VirtualKeyboard from '@/components/practice/VirtualKeyboard';
import PracticeSettingsDialog from '@/components/practice/PracticeSettingsDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const GROUPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'E', 'G', 'F', 'D', 'C'];

/**
 * Practice workspace — the music is prepared here, not the system.
 * Follow notes waits for you; Performance runs at the chosen tempo.
 */
export default function PracticeSession() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const config = location.state?.config || null;
  const prefill = config?.prefill || null;

  const mode = config?.mode || 'follow';
  const input = config?.input || 'microphone';
  const recording = config?.recording || 'off';
  const feedbackAvailable = config?.feedbackAvailable ?? input !== 'none';

  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const addPracticeActivity = usePrototypeStore((s) => s.addPracticeActivity);
  const updateScoreLastPlayed = usePrototypeStore((s) => s.updateScoreLastPlayed);
  const setReport = usePracticeRuntime((s) => s.setReport);
  const clearReport = usePracticeRuntime((s) => s.clearReport);

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
  const [groupStatus, setGroupStatus] = useState('waiting'); // waiting | matched | wrong | skipped

  const [feedbackOn, setFeedbackOn] = useState(feedbackAvailable);
  const [virtualKeyboard, setVirtualKeyboard] = useState(false);
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [highlightMeasure, setHighlightMeasure] = useState(true);

  const [exitOpen, setExitOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selfViewHidden, setSelfViewHidden] = useState(false);
  const finished = useRef(false);
  const startedAt = useRef(null);

  const totalMeasures = score?.measures || 32;
  const maxMeasure = selectedRange.kind === 'section' ? selectedRange.endMeasure : totalMeasures;
  const loopAllowed = mode === 'follow' && selectedRange.kind === 'section';
  const bpm = tempoMode === 'fixed' ? customBpm : (score?.tempo || 80);
  const isActive = phase === 'running' || phase === 'paused';
  const tempoLocked = phase !== 'ready';
  const beatMs = Math.round(60000 / bpm);

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

  // Count-in follows the chosen tempo.
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
    }, beatMs);
    return () => clearInterval(t);
  }, [phase, beatMs]);

  // Performance advances on its own; Follow advances only when you play.
  useEffect(() => {
    if (phase !== 'running' || mode !== 'performance') return undefined;
    const interval = Math.max(280, beatMs * 4);
    const t = setInterval(() => advance(), interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, bpm, activeMeasure, selectedRange, loop]);

  // The playhead always stays visible — following the score is a system behavior.
  useEffect(() => {
    if (phase === 'running' || phase === 'countin') {
      setVisibleMeasureStart(measureWindowStart(activeMeasure));
    }
  }, [activeMeasure, phase]);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(1, elapsed || (mode === 'follow' ? matched * 6 + 12 : Math.round((maxMeasure * 4 * 60) / bpm)));
    const activityId = `act-${Date.now()}`;
    const rangeSummary = rangeLabel(selectedRange);

    addPracticeActivity({
      id: activityId,
      scoreId,
      scoreTitleSnapshot: score.title,
      mode,
      startedAt: startedAt.current || completedAt,
      completedAt,
      durationSeconds,
      tempoBpm: mode === 'performance' ? bpm : null,
      rangeSummary,
    });
    updateScoreLastPlayed(scoreId, activeMeasure);

    if (mode === 'follow') {
      clearReport();
      toast({ title: 'Practice saved', description: `${score.title} — ${fmtClock(durationSeconds)}.` });
      navigate(`/score/${scoreId}`);
      return;
    }

    // A report is a moment, not a record: it lives in memory only.
    setReport({
      activityId,
      scoreId,
      scoreTitle: score.title,
      composer: score.composer,
      durationSeconds,
      tempoBpm: bpm,
      rangeSummary,
      startMeasure: selectedRange.kind === 'section' ? selectedRange.startMeasure : 1,
      endMeasure: maxMeasure,
      mediaType: recording === 'off' ? null : recording,
      mediaRef: recording === 'off' ? null : `mock://${recording}/${activityId}`,
      feedback: feedbackAvailable && feedbackOn
        ? {
            accuracy: Math.max(58, Math.min(98, 96 - Math.floor(durationSeconds / 180))),
            groupsMatched: matched,
            groupsSkipped: skipped,
          }
        : null,
      savedPerformanceId: null,
    });
    navigate(`/practice/${activityId}/summary`);
  }

  function advance() {
    const next = activeMeasure + 1;
    if (next > maxMeasure) {
      if (loop && loopAllowed) {
        setActiveMeasure(selectedRange.startMeasure);
        return;
      }
      finish();
      return;
    }
    setActiveMeasure(next);
  }

  // Deterministic demo recognition: matched and skipped both move the score on.
  function resolveCurrentGroup(outcome) {
    if (mode !== 'follow' || phase !== 'running') return;
    if (outcome === 'wrong') {
      setGroupStatus('wrong');
      return;
    }
    setGroupStatus(outcome);
    if (outcome === 'matched') setMatched((c) => c + 1);
    if (outcome === 'skipped') setSkipped((s) => s + 1);
    advance();
  }

  function startSession() {
    finished.current = false;
    startedAt.current = new Date().toISOString();
    setMatched(0);
    setSkipped(0);
    setElapsed(0);
    setGroupStatus('waiting');
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
    setGroupStatus('waiting');
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
        ? 'Set a section if you like, then start. Yueora waits for you.'
        : 'One measure of count-in, then the take runs from start to finish.'
      : phase === 'countin'
        ? 'Count-in…'
        : phase === 'running'
          ? mode === 'follow'
            ? 'Waiting for the current note.'
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
          <span className="hidden whitespace-nowrap type-body-small text-ink-secondary capitalize md:inline">{input === 'none' ? 'No input' : input}</span>
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
              activeMeasure={selecting || !highlightMeasure ? null : activeMeasure}
              activeMeasureVariant="practice"
              measureStart={canvasStart}
              selectedMeasures={selectedRange.kind === 'section' ? { from: selectedRange.startMeasure, to: selectedRange.endMeasure } : null}
              showNoteNames={showNoteNames}
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

          {virtualKeyboard && (
            <VirtualKeyboard current={GROUPS[activeMeasure % GROUPS.length]} showNames={showNoteNames} />
          )}
        </div>

        {phase === 'countin' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-canvas/70">
            <div className="text-center">
              <p className="type-metric text-6xl text-ink-primary">{countBeat > 0 ? countBeat : '—'}</p>
              <p className="mt-2 type-body-small text-ink-secondary">One measure count-in · ♩ = {bpm}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status band */}
      <div className="border-t border-line-subtle bg-surface-panel px-4 py-2">
        {mode === 'follow' && phase !== 'ready' ? (
          <FollowFeedback
            current={GROUPS[activeMeasure % GROUPS.length]}
            status={groupStatus}
            matched={matched}
            skipped={skipped}
            paused={phase === 'paused'}
            onResolve={resolveCurrentGroup}
          />
        ) : (
          <p className="text-center type-body-small text-ink-secondary">{hint}</p>
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
            <span className="type-metadata text-ink-tertiary">Waiting for you…</span>
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

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden type-metadata text-ink-tertiary sm:inline">
              {fmtClock(elapsed)}{mode === 'follow' ? ` · ${matched} matched` : ''}{skipped > 0 ? ` · ${skipped} skipped` : ''}
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

      <PracticeSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        scoreId={scoreId}
        mode={mode}
        input={input}
        recording={recording}
        rangeText={rangeLabel(selectedRange)}
        feedbackAvailable={feedbackAvailable}
        feedbackOn={feedbackOn}
        onFeedback={setFeedbackOn}
        virtualKeyboard={virtualKeyboard}
        onVirtualKeyboard={setVirtualKeyboard}
        showNoteNames={showNoteNames}
        onShowNoteNames={setShowNoteNames}
        highlightMeasure={highlightMeasure}
        onHighlightMeasure={setHighlightMeasure}
        selfViewHidden={selfViewHidden}
        onSelfViewHidden={setSelfViewHidden}
      />

      {/* Exit confirmation */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Leave practice?</DialogTitle></DialogHeader>
          <p className="text-sm text-ink-secondary">You can keep this practice in your history, or let it go.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExitOpen(false)}>Keep playing</Button>
            <Button variant="outline" onClick={() => { setExitOpen(false); finish(); }}>Finish &amp; save</Button>
            <Button
              variant="destructive"
              onClick={() => { setExitOpen(false); clearReport(); navigate(`/score/${scoreId}`); }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}