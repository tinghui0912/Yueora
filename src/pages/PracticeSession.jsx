import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Flag, Timer, RotateCcw, Repeat, Settings2,
  MoreHorizontal, Video, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { usePrototypeStore, getPermissions } from '@/stores/prototypeStore';
import { usePracticeRuntime } from '@/stores/practiceRuntime';
import { generateNotes } from '@/lib/mockData';
import { measureWindowStart, fmtClock, rangeLabel } from '@/lib/practiceUtils';
import useSessionRecorder from '@/lib/useSessionRecorder';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import TempoPopover from '@/components/practice/TempoPopover';
import FollowFeedback from '@/components/practice/FollowFeedback';
import VirtualKeyboard from '@/components/practice/VirtualKeyboard';
import PracticeSettingsDialog from '@/components/practice/PracticeSettingsDialog';
import { Surface } from '@/components/patterns/Surface';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const GROUPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'E', 'G', 'F', 'D', 'C'];

/**
 * Practice workspace — an immersive, low-chrome environment for playing.
 * During active playing, secondary interface chrome recedes and music takes center stage.
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
  const recorder = useSessionRecorder();

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
  const startedMs = useRef(null);
  const positionRef = useRef([]);

  const recordPosition = (measure) => {
    if (!startedMs.current) return;
    const t = Math.max(0, Math.round((Date.now() - startedMs.current) / 1000));
    positionRef.current = [...positionRef.current.filter((p) => p.t < t), { t, measure }];
  };

  const totalMeasures = score?.measures || 32;
  const maxMeasure = selectedRange.kind === 'section' ? selectedRange.endMeasure : totalMeasures;
  const loopAllowed = mode === 'follow' && selectedRange.kind === 'section';
  const bpm = tempoMode === 'fixed' ? customBpm : (score?.tempo || 80);
  const tempoLocked = phase !== 'ready';
  const beatMs = Math.round(60000 / bpm);

  useEffect(() => {
    if (!config) navigate(`/score/${scoreId}/setup`, { replace: true });
  }, [config, navigate, scoreId]);

  useEffect(() => () => recorder.cancel(), [recorder.cancel]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

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

  const advance = useCallback(() => {
    const next = activeMeasure + 1;
    if (next > maxMeasure) {
      if (loop && loopAllowed) {
        setActiveMeasure(selectedRange.startMeasure);
        recordPosition(selectedRange.startMeasure);
        return;
      }
      finish();
      return;
    }
    setActiveMeasure(next);
    recordPosition(next);
  }, [activeMeasure, loop, loopAllowed, maxMeasure, selectedRange.startMeasure]);

  useEffect(() => {
    if (phase !== 'running' || mode !== 'performance') return undefined;
    const interval = Math.max(280, beatMs * 4);
    const t = setInterval(() => advance(), interval);
    return () => clearInterval(t);
  }, [phase, mode, beatMs, advance]);

  useEffect(() => {
    if (phase === 'running' || phase === 'countin') {
      setVisibleMeasureStart(measureWindowStart(activeMeasure));
    }
  }, [activeMeasure, phase]);

  async function finish() {
    if (finished.current) return;
    if (!startedAt.current) return;
    finished.current = true;

    const mediaBlob = recording === 'off' ? null : await recorder.stop();
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(1, elapsed);
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
      toast({ title: 'Practice preserved', description: `${score.title} — ${fmtClock(durationSeconds)}.` });
      navigate(`/score/${scoreId}`);
      return;
    }

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
      mediaType: mediaBlob ? recording : null,
      mediaBlob,
      positionTimeline: positionRef.current,
      savedPerformanceId: null,
    });
    navigate(`/practice/${activityId}/summary`);
  }

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

  async function startSession() {
    finished.current = false;
    setMatched(0);
    setSkipped(0);
    setElapsed(0);
    setGroupStatus('waiting');
    setActiveMeasure(selectedRange.startMeasure);
    setVisibleMeasureStart(measureWindowStart(selectedRange.startMeasure));
    setSectionPhase('idle');

    if (recording !== 'off') {
      const result = await recorder.start(recording);
      if (!result.ok) toast({ title: 'No recording this time', description: result.error });
    }

    startedAt.current = new Date().toISOString();
    startedMs.current = Date.now();
    positionRef.current = [{ t: 0, measure: selectedRange.startMeasure }];
    if (mode === 'performance') {
      setCountBeat(4);
      setPhase('countin');
    } else {
      setPhase('running');
    }
  }

  function togglePlayPause() {
    if (phase === 'ready') {
      startSession();
    } else if (phase === 'running') {
      setPhase('paused');
    } else if (phase === 'paused') {
      setPhase('running');
    }
  }

  function restart() {
    finished.current = false;
    startedAt.current = null;
    recorder.cancel();
    setPhase('ready');
    setMatched(0);
    setSkipped(0);
    setElapsed(0);
    setGroupStatus('waiting');
    setActiveMeasure(selectedRange.startMeasure);
    setVisibleMeasureStart(measureWindowStart(selectedRange.startMeasure));
  }

  // Keyboard accessibility for music stand navigation (Space to toggle, Esc to exit/cancel)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (sectionPhase !== 'idle') {
          setSectionPhase('idle');
          setPendingStart(null);
        } else if (phase !== 'ready') {
          setExitOpen(true);
        } else {
          navigate(`/score/${scoreId}`);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, sectionPhase, scoreId, navigate]);

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

  if (!score) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div>
          <p className="type-section-title text-ink-primary">Score not found.</p>
          <Button onClick={() => navigate('/library')} className="mt-4">Back to Repertoire</Button>
        </div>
      </div>
    );
  }

  if (!getPermissions(score).canPractice) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="type-section-title text-ink-primary">Practice is not enabled for this score</p>
        <p className="mt-2 type-body-small text-ink-secondary">
          The link you received does not include practice permission.
        </p>
        <Button onClick={() => navigate(`/score/${scoreId}`)} className="mt-5">Back to score</Button>
      </div>
    );
  }

  if (!config) return null;

  const selecting = sectionPhase !== 'idle';
  const canvasStart = selecting ? pickWindow : visibleMeasureStart;
  const isPlaying = phase === 'running';

  return (
    <div className="flex h-dvh flex-col bg-surface-canvas select-none">
      {/* Workspace Header: softly recedes during active playing */}
      <header
        className={`flex items-center justify-between gap-3 border-b border-line-subtle bg-surface-panel/90 px-4 py-2.5 backdrop-blur-md transition-opacity duration-slow md:px-6 ${
          isPlaying ? 'opacity-40 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => (phase === 'ready' ? navigate(`/score/${scoreId}`) : setExitOpen(true))}
          className="flex min-w-0 items-center gap-2 type-label font-medium text-ink-secondary hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-control"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate type-subsection text-ink-primary">{score.title}</span>
        </button>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {recording === 'video' && !selfViewHidden && (
            <div
              role="img"
              aria-label="Camera preview"
              className="relative hidden h-9 w-14 items-center justify-center overflow-hidden rounded-control border border-line-subtle bg-ink-primary/10 sm:flex"
            >
              <Video className="h-3.5 w-3.5 text-ink-secondary" aria-hidden="true" />
              {isPlaying && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded-control bg-danger px-1 py-px text-[9px] font-bold uppercase tracking-wider text-white"> {/* ds-allow: miniature simulation badge */}
                  REC
                </span>
              )}
            </div>
          )}

          {/* Session Phase Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-line-subtle bg-neutral-muted/50 px-3 py-1 type-metadata text-ink-secondary">
            <span
              className={`h-2 w-2 rounded-full ${
                isPlaying ? 'bg-brand animate-pulse' : phase === 'countin' ? 'bg-practice-current' : 'bg-ink-tertiary'
              }`}
            />
            <span className="type-metadata font-medium">
              {isPlaying ? 'Playing' : phase === 'countin' ? 'Count-in' : phase === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>

          {/* Current Bar Badge */}
          <span className="rounded-control border border-line-subtle bg-surface-panel px-2.5 py-1 type-caption text-ink-primary">
            Bar {activeMeasure}
          </span>

          <IconButton
            icon={Settings2}
            size="sm"
            tone="outline"
            label="Practice settings"
            onClick={() => setSettingsOpen(true)}
          />
        </div>
      </header>

      {/* Main Score Canvas — The Musician's Music Stand */}
      <main className="relative flex-1 overflow-auto p-3 sm:p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl">
          {/* Section range selector notification bar */}
          {selecting && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-container border border-line-subtle bg-surface-panel p-3">
              <p className="type-metadata text-ink-primary font-medium">
                {sectionPhase === 'start'
                  ? 'Choose starting measure on score.'
                  : 'Starting measure selected. Click ending measure.'}
              </p>
              <div className="flex items-center gap-1">
                <IconButton
                  icon={ChevronLeft}
                  size="xs"
                  tone="outline"
                  label="Previous measures"
                  onClick={() => setPickWindow((w) => Math.max(1, w - 4))}
                  disabled={pickWindow <= 1}
                />
                <span className="px-1 type-metadata text-ink-secondary">
                  Bars {pickWindow}–{Math.min(totalMeasures, pickWindow + 3)}
                </span>
                <IconButton
                  icon={ChevronRight}
                  size="xs"
                  tone="outline"
                  label="Next measures"
                  onClick={() => setPickWindow((w) => Math.min(measureWindowStart(totalMeasures), w + 4))}
                  disabled={pickWindow + 4 > totalMeasures}
                />
                <IconButton
                  icon={X}
                  size="xs"
                  tone="outline"
                  label="Cancel section"
                  onClick={() => { setSectionPhase('idle'); setPendingStart(null); }}
                  className="ml-1"
                />
              </div>
            </div>
          )}

          {/* Musical Score Workspace */}
          <Surface
            tone="panel"
            className="p-4 sm:p-8 relative"
          >
            <ScoreCanvas
              notes={notes}
              selectedIds={null}
              onSelect={selecting ? handleSectionClick : () => {}}
              zoom={1.15}
              activeMeasure={selecting || !highlightMeasure ? null : activeMeasure}
              activeMeasureVariant="practice"
              measureStart={canvasStart}
              selectedMeasures={selectedRange.kind === 'section' ? { from: selectedRange.startMeasure, to: selectedRange.endMeasure } : null}
              showNoteNames={showNoteNames}
            />

            {/* Position indicator & measure navigation */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3 type-metadata text-ink-secondary">
              <span>Showing bars {canvasStart}–{Math.min(totalMeasures, canvasStart + 3)} of {totalMeasures}</span>

              {!selecting && phase === 'paused' && measureWindowStart(activeMeasure) !== visibleMeasureStart && (
                <button
                  onClick={() => setVisibleMeasureStart(measureWindowStart(activeMeasure))}
                  className="text-brand font-semibold hover:underline"
                >
                  Return to current position (Bar {activeMeasure})
                </button>
              )}

              {!selecting && phase !== 'running' && (
                <div className="flex items-center gap-1">
                  <IconButton
                    icon={ChevronLeft}
                    size="xs"
                    tone="outline"
                    label="Browse previous measures"
                    disabled={visibleMeasureStart <= 1}
                    onClick={() => setVisibleMeasureStart((w) => Math.max(1, w - 4))}
                  />
                  <IconButton
                    icon={ChevronRight}
                    size="xs"
                    tone="outline"
                    label="Browse next measures"
                    disabled={visibleMeasureStart + 4 > totalMeasures}
                    onClick={() => setVisibleMeasureStart((w) => Math.min(measureWindowStart(totalMeasures), w + 4))}
                  />
                </div>
              )}
            </div>
          </Surface>

          {virtualKeyboard && (
            <div className="mt-3">
              <VirtualKeyboard current={GROUPS[activeMeasure % GROUPS.length]} showNames={showNoteNames} />
            </div>
          )}
        </div>

        {/* Count-in Overlay */}
        {phase === 'countin' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-canvas/80 backdrop-blur-xs">
            <div className="text-center">
              {/* ds-allow: oversized rehearsal count-in number */}
              <p className="font-display text-7xl font-medium text-ink-primary animate-pulse">
                {countBeat > 0 ? countBeat : '—'}
              </p>
              <p className="mt-2 type-metadata text-ink-secondary">One bar count-in · ♩ = {bpm}</p>
            </div>
          </div>
        )}
      </main>

      {/* Listening companion / Non-judgmental status band */}
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
          <p className="text-center type-metadata text-ink-secondary">
            {phase === 'ready'
              ? mode === 'follow'
                ? 'Set a range if you wish, then press Start or Spacebar. Yueora follows your tempo.'
                : 'One bar of count-in, then the take runs continuously.'
              : 'Press Space to Pause or Resume'}
          </p>
        )}
      </div>

      {/* Bottom Transport System */}
      <footer
        className="border-t border-line-subtle bg-surface-panel px-4 py-3 md:px-6"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          {/* Primary Transport Play / Pause */}
          <div className="flex items-center gap-2">
            {phase === 'ready' ? (
              <Button
                intent="primary"
                size="md"
                onClick={startSession}
              >
                <Play className="icon-sm fill-current" />
                <span>Start</span>
              </Button>
            ) : mode === 'performance' ? (
              <Button
                intent="primary"
                size="md"
                onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
                disabled={phase === 'countin'}
              >
                {phase === 'running' ? (
                  <>
                    <Pause className="icon-sm fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="icon-sm fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                intent="secondary"
                size="md"
                onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
              >
                {phase === 'running' ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
                <span>{phase === 'running' ? 'Pause' : 'Resume'}</span>
              </Button>
            )}

            <span className="type-metadata tabular-nums font-mono text-ink-secondary ml-1.5">
              {fmtClock(elapsed)}
            </span>
          </div>

          {/* Tempo, section range, and looping */}
          <div className="flex items-center gap-2">
            <TempoPopover
              triggerLabel={tempoLocked ? 'Tempo is locked during play' : 'Tempo and metronome'}
              trigger={
                <button
                  type="button"
                  className={`flex h-9 items-center gap-1.5 rounded-control border px-3 type-label font-medium transition-colors ${
                    metronome ? 'border-line-strong text-ink-primary' : 'border-line-subtle text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <Timer className="h-4 w-4" />
                  <span>♩ = {bpm}</span>
                  {metronome && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
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
              className={`flex h-9 items-center gap-1.5 rounded-control border px-3 type-label font-medium transition-colors ${
                selectedRange.kind === 'section'
                  ? 'border-brand bg-neutral-muted font-semibold text-ink-primary'
                  : 'border-line-subtle text-ink-secondary hover:bg-neutral-hover'
              }`}
            >
              <span>Section{selectedRange.kind === 'section' ? ` ${selectedRange.startMeasure}–${selectedRange.endMeasure}` : ''}</span>
            </button>

            {loopAllowed && (
              <button
                type="button"
                onClick={() => setLoop((l) => !l)}
                aria-pressed={loop}
                className={`hidden h-9 items-center gap-1.5 rounded-control border px-3 type-label font-medium sm:flex transition-colors ${
                  loop ? 'border-brand bg-neutral-muted font-semibold text-ink-primary' : 'border-line-subtle text-ink-secondary hover:bg-neutral-hover'
                }`}
              >
                <Repeat className={`h-4 w-4 ${loop ? 'text-brand' : ''}`} />
                <span>Loop</span>
              </button>
            )}
          </div>

          {/* Secondary Actions & Finish */}
          <div className="flex items-center gap-2">
            <Button
              intent="secondary"
              size="md"
              onClick={finish}
              disabled={!startedAt.current}
            >
              Finish take
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  icon={MoreHorizontal}
                  tone="outline"
                  size="md"
                  label="More session actions"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings2 className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Session settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={restart}>
                  <RotateCcw className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Restart from bar 1
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-line-subtle" />
                <DropdownMenuItem onClick={finish} disabled={!startedAt.current}>
                  <Flag className="mr-2 h-3.5 w-3.5" /> Finish &amp; preserve
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>

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

      {/* Exit confirmation dialog */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Leave practice?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary mt-1">You can preserve this session in your repertoire history, or discard it.</p>
          <DialogFooter className="mt-4 gap-2">
            <Button intent="quiet" size="sm" onClick={() => setExitOpen(false)}>Keep playing</Button>
            <Button intent="secondary" size="sm" onClick={() => { setExitOpen(false); finish(); }}>Save &amp; finish</Button>
            <Button
              intent="danger"
              size="sm"
              onClick={() => { setExitOpen(false); recorder.cancel(); clearReport(); navigate(`/score/${scoreId}`); }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
