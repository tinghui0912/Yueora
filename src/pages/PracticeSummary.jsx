import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, History, Play, RotateCcw, Wand2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { usePracticeRuntime } from '@/stores/practiceRuntime';
import { generateNotes } from '@/lib/mockData';
import { fmtClock, measureWindowStart } from '@/lib/practiceUtils';
import { downloadBlob, extensionFor, slugify, uploadRecording } from '@/lib/media';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';
import AppPage from '@/components/patterns/AppPage';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import SyncPlayback from '@/components/performances/SyncPlayback';
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
  const scores = usePrototypeStore((s) => s.scores);
  const savePerformance = usePrototypeStore((s) => s.savePerformance);

  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [notes] = useState(() => generateNotes(report?.scoreId));
  const alive = useRef(false);

  // The captured file never leaves this page unless the user saves it.
  const reportBlob = report?.mediaBlob || null;
  const reportMediaUrl = useMemo(() => (reportBlob ? URL.createObjectURL(reportBlob) : null), [reportBlob]);
  useEffect(() => () => { if (reportMediaUrl) URL.revokeObjectURL(reportMediaUrl); }, [reportMediaUrl]);

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

  if (!live) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center md:px-8">
        <h1 className="type-section-title text-ink-primary">This practice report is no longer available.</h1>
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

  const { durationSeconds, tempoBpm, rangeSummary, mediaType, mediaBlob, savedPerformanceId } = live;
  const score = scores.find((s) => s.id === live.scoreId);
  const saved = !!savedPerformanceId;
  const markerMeasure = live.startMeasure || 1;
  const filename = `${slugify(live.scoreTitle)}-${new Date().toISOString().slice(0, 10)}`;

  const downloadRecording = () => {
    if (!mediaBlob) return;
    downloadBlob(mediaBlob, `${filename}.${extensionFor(mediaBlob)}`);
  };

  const handleSave = async () => {
    if (!mediaBlob) {
      setSaveError('There is no recording file to keep for this session.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const fileUri = await uploadRecording(mediaBlob, `${filename}.${extensionFor(mediaBlob)}`);
      const id = `perf-${Date.now()}`;
      savePerformance({
        id,
        activityId: live.activityId,
        scoreId: live.scoreId,
        scoreTitleSnapshot: live.scoreTitle,
        mediaType,
        fileUri,
        createdAt: new Date().toISOString(),
        durationSeconds,
        tempoBpm,
        rangeSummary,
        startMeasure: live.startMeasure,
        endMeasure: live.endMeasure,
        // The measure changes captured during the session, so replay can follow
        // the score against the recording instead of guessing.
        positionTimeline: live.positionTimeline || [],
        visibility: 'private',
        sharedWith: [],
        allowComments: true,
      });
      usePracticeRuntime.getState().markSaved(id);
      setSaveOpen(false);
      toast({
        title: 'Performance saved',
        description: `${live.scoreTitle} is now in Performances.`,
      });
    } catch (err) {
      setSaveError(err?.message || 'The recording could not be uploaded. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppPage size="form">
      <Link
        to={score ? `/score/${score.id}` : '/practice'}
        className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {score ? live.scoreTitle : 'Practice'}
      </Link>

      <h1 className="mt-6 type-display text-ink-primary">
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
        {mediaBlob ? (
          <div className="mt-3">
            <SyncPlayback
              src={reportMediaUrl}
              mediaType={mediaType}
              scoreId={live.scoreId}
              scoreTitle={live.scoreTitle}
              startMeasure={live.startMeasure}
              endMeasure={live.endMeasure}
              durationSeconds={durationSeconds}
              timeline={live.positionTimeline}
            />
            <p className="mt-2 type-metadata text-ink-tertiary">
              This recording lives on this page only — it is kept if you save the performance.
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

      {/* What actually happened in this session */}
      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line-subtle pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line-subtle">
        <div className="sm:px-4 sm:first:pl-0"><Metric label="Duration" value={fmtClock(durationSeconds)} /></div>
        <div className="sm:px-4"><Metric label="Tempo" value={`${tempoBpm} BPM`} /></div>
        <div className="sm:px-4"><Metric label="Section" value={rangeSummary} /></div>
      </dl>
      <p className="mt-3 type-metadata text-ink-tertiary">
        Yueora knows what you chose and how long you played. Note-level accuracy isn’t measured, so it isn’t shown.
      </p>

      {/* Keep / download / share video */}
      {mediaBlob && (
        <section className="mt-8 border-t border-line-subtle pt-5">
          <SectionHeader title="Keep this performance" />
          <p className="mt-2 type-body-small text-ink-secondary">
            Recording is optional. Nothing is uploaded unless you choose to save it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {saved ? (
              <>
                <span className="flex items-center rounded-control bg-neutral-muted px-4 py-2.5 type-body-small font-semibold text-ink-secondary">
                  Saved to Performances
                </span>
                <Link to="/performances" className="type-body-small font-medium text-brand hover:underline">View Performances</Link>
              </>
            ) : (
              <Button onClick={() => setSaveOpen(true)}>Save performance</Button>
            )}
            <Button variant="outline" onClick={downloadRecording}>
              <Download className="mr-1.5 h-4 w-4" /> Download recording
            </Button>
            <Button variant="outline" onClick={() => setShareOpen(true)}>
              <Wand2 className="mr-1.5 h-4 w-4" /> Make a share video
            </Button>
          </div>
          <p className="mt-2 type-metadata text-ink-tertiary">
            Save or download works on the real recording file captured in this session.
          </p>
        </section>
      )}

      {!mediaBlob && (
        <p className="mt-6 type-metadata text-ink-tertiary">
          This session has no recording attached. You can choose audio or video next time in setup.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link to={`/score/${live.scoreId}/setup`} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 type-body-small font-semibold text-ink-primary hover:bg-neutral-hover transition-colors">
          <RotateCcw className="h-4 w-4" /> Play it again
        </Link>
        <Link to="/practice/history" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 type-body-small font-semibold text-ink-primary hover:bg-neutral-hover transition-colors">
          <History className="h-4 w-4" /> Practice history
        </Link>
        <Link to="/practice" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 type-body-small font-semibold text-ink-primary hover:bg-neutral-hover transition-colors">
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
        saving={saving}
        error={saveError}
        onSave={handleSave}
      />
      <ShareVideoDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={live.scoreTitle}
        composer={live.composer}
        rangeSummary={rangeSummary}
        scoreId={live.scoreId}
        startMeasure={live.startMeasure}
        endMeasure={live.endMeasure}
        timeline={live.positionTimeline}
        durationSeconds={durationSeconds}
        mediaType={mediaType}
        mediaBlob={mediaBlob}
      />
    </AppPage>
  );
}