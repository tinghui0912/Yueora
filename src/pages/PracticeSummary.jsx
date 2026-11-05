import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, History, Play, RotateCcw, Wand2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { usePracticeRuntime } from '@/stores/practiceRuntime';
import { generateNotes } from '@/lib/mockData';
import { fmtClock, measureWindowStart } from '@/lib/practiceUtils';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import PerformanceReplay from '@/components/performances/PerformanceReplay';
import ShareVideoDialog from '@/components/performances/ShareVideoDialog';
import SavePerformanceDialog from '@/components/performances/SavePerformanceDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * Performance report — temporary feedback, never a stored record.
 * Everything on this page came from the run that just ended; leaving discards it.
 */
export default function PracticeSummary() {
  const { activityId } = useParams();
  const { toast } = useToast();
  const report = usePracticeRuntime((s) => s.report);
  const clearReport = usePracticeRuntime((s) => s.clearReport);
  const scored = usePrototypeStore((s) => s.scores);
  const savePerformance = usePrototypeStore((s) => s.savePerformance);
  const members = usePrototypeStore((s) => s.teamMembers) || [];

  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [notes] = useState(() => generateNotes(report?.scoreId));
  const alive = useRef(false);

  // Leaving the report destroys it; a brief delay survives a dev remount.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      setTimeout(() => {
        if (!alive.current) clearReport();
      }, 500);
    };
  }, [clearReport]);

  const live = report && report.activityId === activityId ? report : null;
  const score = live ? scored.find((s) => s.id === live.scoreId) : null;

  if (!live) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center md:px-8">
        <h1 className="type-section-title text-2xl text-ink-primary">This practice report is no longer available.</h1>
        <p className="mt-3 type-body text-ink-secondary">
          Practice reports are temporary. Only saved performances remain available.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild><Link to="/practice">Back to Practice</Link></Button>
          <Button asChild variant="outline"><Link to="/performances">Performances</Link></Button>
        </div>
      </div>
    );
  }

  const { durationSeconds, tempoBpm, rangeSummary, feedback, mediaType, savedPerformanceId } = live;
  const saved = !!savedPerformanceId;
  const markerMeasure = live.startMeasure || 1;

  const handleSave = ({ visibility, sharedWith }) => {
    const id = `perf-${Date.now()}`;
    savePerformance({
      id,
      activityId: live.activityId,
      scoreId: live.scoreId,
      scoreTitleSnapshot: live.scoreTitle,
      mediaType,
      mediaRef: live.mediaRef,
      createdAt: new Date().toISOString(),
      durationSeconds,
      tempoBpm,
      rangeSummary,
      visibility,
      sharedWith,
    });
    usePracticeRuntime.getState().markSaved(id);
    setSaveOpen(false);
    toast({
      title: 'Performance saved',
      description: `${live.scoreTitle} is now in Performances.`,
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <Link
        to={score ? `/score/${score.id}` : '/practice'}
        className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {score ? live.scoreTitle : 'Practice'}
      </Link>

      <h1 className="mt-6 type-display text-[clamp(1.75rem,4vw,2.75rem)] text-ink-primary">
        You played it through.
      </h1>
      <p className="mt-2 type-body text-ink-secondary">
        {rangeSummary} at {tempoBpm} BPM, {fmtClock(durationSeconds)} of playing.
      </p>
      <p className="mt-1 type-metadata text-ink-tertiary">{live.scoreTitle} · {live.composer}</p>

      <div className="mt-5">
        <Button asChild>
          <Link to={`/score/${live.scoreId}/setup`} state={{ prefill: { startMeasure: markerMeasure, endMeasure: live.endMeasure } }}>
            <Play className="mr-1.5 h-4 w-4" /> Play again
          </Link>
        </Button>
      </div>

      {/* Replay — the recording only exists while this page is open */}
      <section className="mt-9">
        <SectionHeader title="Replay" />
        {mediaType ? (
          <div className="mt-3">
            <PerformanceReplay
              scoreId={live.scoreId}
              mediaKind={mediaType}
              durationSec={durationSeconds}
              totalMeasures={live.endMeasure || 32}
              startMeasure={markerMeasure}
            />
            <p className="mt-2 type-metadata text-ink-tertiary">
              Temporary recording. Saved only if you keep this performance.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="type-body-small text-ink-secondary">No recording was made for this performance.</p>
            <div className="mt-3 rounded-container border border-line-subtle bg-surface-panel p-3">
              <ScoreCanvas
                notes={notes}
                selectedIds={null}
                onSelect={() => {}}
                zoom={1}
                activeIssueMeasure={markerMeasure}
                measureStart={measureWindowStart(markerMeasure)}
              />
            </div>
            <p className="mt-2 type-metadata text-ink-tertiary">
              Measures {live.startMeasure}–{live.endMeasure} of this performance are marked on the score.
            </p>
          </div>
        )}
      </section>

      {/* Reference feedback — only when a listening input was configured */}
      {feedback ? (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-line-subtle">
          <div className="sm:px-4 sm:first:pl-0"><Metric label="Reference accuracy" value={`${feedback.accuracy}%`} /></div>
          <div className="sm:px-4"><Metric label="Duration" value={fmtClock(durationSeconds)} /></div>
          <div className="sm:px-4"><Metric label="Tempo" value={`${tempoBpm} BPM`} /></div>
          <div className="sm:px-4"><Metric label="Measures" value={`${feedback.groupsMatched}`} /></div>
        </dl>
      ) : (
        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line-subtle pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line-subtle">
          <div className="sm:px-4 sm:first:pl-0"><Metric label="Duration" value={fmtClock(durationSeconds)} /></div>
          <div className="sm:px-4"><Metric label="Tempo" value={`${tempoBpm} BPM`} /></div>
          <div className="sm:px-4"><Metric label="Section" value={rangeSummary} /></div>
        </dl>
      )}
      {feedback && (
        <p className="mt-2 type-metadata text-ink-tertiary">
          A listening model never hears every note — treat this as a reference, not a score.
        </p>
      )}

      {/* Keep / download / share */}
      {mediaType && (
        <section className="mt-8 border-t border-line-subtle pt-5">
          <SectionHeader title="Keep this performance" />
          <p className="mt-2 type-body-small text-ink-secondary">
            Recording is optional. Nothing is uploaded unless you choose to save it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {saved ? (
              <>
                <span className="flex items-center rounded-control bg-muted px-4 py-2.5 text-sm font-semibold text-ink-secondary">
                  Saved to Performances
                </span>
                <Link to="/performances" className="text-sm font-medium text-brand hover:underline">View Performances</Link>
              </>
            ) : (
              <Button onClick={() => setSaveOpen(true)}>Save performance</Button>
            )}
            <Button
              variant="outline"
              onClick={() => toast({ title: 'Recording downloaded', description: `${live.scoreTitle} — ${mediaType} recording (mock file).` })}
            >
              <Download className="mr-1.5 h-4 w-4" /> Download recording
            </Button>
            {mediaType === 'video' && (
              <Button variant="outline" onClick={() => setShareOpen(true)}>
                <Wand2 className="mr-1.5 h-4 w-4" /> Make a share video
              </Button>
            )}
          </div>
        </section>
      )}

      {!mediaType && (
        <p className="mt-6 type-metadata text-ink-tertiary">
          Recording was off. You can choose audio or video next time in setup.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link to={`/score/${live.scoreId}/setup`} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <RotateCcw className="h-4 w-4" /> Play it again
        </Link>
        <Link to="/practice/history" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <History className="h-4 w-4" /> Practice history
        </Link>
        <Link to="/practice" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to Practice
        </Link>
      </div>

      <p className="mt-6 type-metadata text-ink-tertiary">
        This report is temporary and disappears when you leave.
      </p>

      <SavePerformanceDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        scoreTitle={live.scoreTitle}
        members={members}
        onSave={handleSave}
      />
      <ShareVideoDialog open={shareOpen} onOpenChange={setShareOpen} title={live.scoreTitle} />
    </div>
  );
}