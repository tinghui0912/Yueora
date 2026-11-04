import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, History, Play, RotateCcw, Wand2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { buildSummary, generateNotes } from '@/lib/mockData';
import { fmtClock, measureWindowStart } from '@/lib/practiceUtils';
import SectionHeader from '@/components/patterns/SectionHeader';
import Metric from '@/components/patterns/Metric';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import PerformanceReplay from '@/components/performances/PerformanceReplay';
import ShareVideoDialog from '@/components/performances/ShareVideoDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * Practice report. The session is the record of what happened; a saved
 * performance is the recording the user chose to keep.
 */
export default function PracticeSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const { toast } = useToast();

  const session = usePrototypeStore((s) => s.practiceSessions.find((p) => p.id === sessionId));
  const performances = usePrototypeStore((s) => s.practicePerformances);
  const savePerformance = usePrototypeStore((s) => s.savePerformance);
  const scores = usePrototypeStore((s) => s.scores);

  const performance = performances.find((p) => p.sessionId === sessionId);
  const scoreId = state.scoreId || session?.scoreId || performance?.scoreId;
  const score = scores.find((s) => s.id === scoreId);
  const scoreTitle = score?.title || performance?.scoreTitle || 'Score';
  const base = buildSummary(scoreId);

  const totalMeasures = score?.measures || 32;
  const mediaKind = performance?.mediaKind || session?.mediaKind || (state.recordingMode && state.recordingMode !== 'off' ? state.recordingMode : null);
  const recordingMode = session?.recordingMode || state.recordingMode || mediaKind || 'off';
  const durationSec = session?.durationSec || state.durationSec || performance?.durationSec || Math.round((totalMeasures * 4 * 60) / (score?.tempo || 80));
  const accuracy = state.accuracy ?? session?.accuracy ?? base.accuracy;
  const tempoBpm = session?.tempoBpm || state.tempoBpm || score?.tempo || 80;
  const skipped = session?.skippedGroups ?? state.skippedGroups ?? 0;
  const rangeText = state.rangeLabel || session?.range || performance?.rangeLabel || 'Full score';

  const trickyFrom = state.trickyFrom ?? session?.trickyFrom ?? 1;
  const trickyTo = state.trickyTo ?? session?.trickyTo ?? Math.min(totalMeasures, trickyFrom + 4);
  const trickyLabel = trickyFrom === trickyTo ? `Measure ${trickyFrom}` : `Measures ${trickyFrom}–${trickyTo}`;

  const [shareOpen, setShareOpen] = useState(false);
  const [notes] = useState(() => generateNotes(scoreId));

  const keepPerformance = () => {
    savePerformance({
      sessionId,
      scoreId,
      scoreTitle,
      createdAt: 'Today',
      duration: fmtClock(durationSec),
      durationSec,
      mediaKind,
      tempo: { mode: state.tempoMode || 'score', bpm: tempoBpm },
      range: session?.rangeDetail || { kind: 'full', startMeasure: 1, endMeasure: totalMeasures },
      rangeLabel: rangeText,
      mockMediaUrl: `mock://${mediaKind}/report-${sessionId}`,
      reportId: sessionId,
    });
    toast({ title: 'Performance saved', description: `${scoreTitle} is now in Performances.` });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <Link
        to={scoreId ? `/score/${scoreId}` : '/performances'}
        className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {scoreId ? scoreTitle : 'Performances'}
      </Link>

      {/* Hero — human first */}
      <h1 className="mt-6 type-display text-[clamp(1.75rem,4vw,2.75rem)] text-ink-primary">{base.hero}</h1>
      <p className="mt-2 type-body text-ink-secondary">
        {trickyLabel} {trickyFrom === trickyTo ? 'was' : 'were'} still the trickiest part today.
      </p>
      <p className="mt-1 type-metadata text-ink-tertiary">{scoreTitle} · {base.composer} · {rangeText}</p>

      <div className="mt-5">
        <Button asChild>
          <Link to={scoreId ? `/score/${scoreId}/setup` : '/practice'} state={scoreId ? { prefill: { startMeasure: trickyFrom, endMeasure: trickyTo } } : undefined}>
            <Play className="mr-1.5 h-4 w-4" /> Try that section again
          </Link>
        </Button>
        <p className="mt-1.5 type-metadata text-ink-tertiary">{trickyLabel} will be pre-selected.</p>
      </div>

      {/* Replay */}
      <section className="mt-9">
        <SectionHeader title="Replay" />
        {mediaKind ? (
          <div className="mt-3">
            <PerformanceReplay
              scoreId={scoreId}
              mediaKind={mediaKind}
              durationSec={durationSec}
              totalMeasures={totalMeasures}
              startMeasure={1}
            />
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
                activeIssueMeasure={trickyFrom}
                measureStart={measureWindowStart(trickyFrom)}
              />
            </div>
            <p className="mt-2 type-metadata text-ink-tertiary">{trickyLabel} is marked on the score.</p>
          </div>
        )}
      </section>

      {/* Metrics — flat band */}
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-line-subtle">
        <div className="sm:px-4 sm:first:pl-0"><Metric label="Accuracy" value={`${accuracy}%`} /></div>
        <div className="sm:px-4"><Metric label="Timing" value={base.timing} /></div>
        <div className="sm:px-4"><Metric label="Duration" value={fmtClock(durationSec)} /></div>
        <div className="sm:px-4"><Metric label="Tempo" value={`${tempoBpm} BPM`} /></div>
      </dl>

      {/* Keep / Download / Share */}
      {mediaKind && (
        <section className="mt-8 border-t border-line-subtle pt-5">
          <SectionHeader title="Keep this performance" />
          <p className="mt-2 type-body-small text-ink-secondary">
            Recording is temporary until you keep it. Saving puts it in Performances.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {performance ? (
              <span className="flex items-center gap-2 rounded-control bg-muted px-4 py-2.5 text-sm font-semibold text-ink-secondary">
                Saved to Performances
              </span>
            ) : (
              <Button onClick={keepPerformance}>Save performance</Button>
            )}
            <Button
              variant="outline"
              onClick={() => toast({ title: 'Recording downloaded', description: `${scoreTitle} — ${mediaKind} recording (mock file).` })}
            >
              <Download className="mr-1.5 h-4 w-4" /> Download recording
            </Button>
            {mediaKind === 'video' && (
              <Button variant="outline" onClick={() => setShareOpen(true)}>
                <Wand2 className="mr-1.5 h-4 w-4" /> Make a share video
              </Button>
            )}
            {performance && <Link to="/performances" className="flex items-center rounded-control px-3 py-2.5 text-sm font-medium text-brand hover:underline">View Performances</Link>}
          </div>
        </section>
      )}

      {!mediaKind && (
        <p className="mt-6 type-metadata text-ink-tertiary">
          Recording was off ({recordingMode === 'off' ? 'Off' : recordingMode}). You can record next time in setup.
        </p>
      )}

      {/* Compared with last time */}
      <section className="mt-8">
        <SectionHeader title="Compared with last time" />
        <dl className="mt-3 space-y-2 type-body-small">
          <div className="flex justify-between"><dt className="text-ink-secondary">Accuracy</dt><dd className="text-brand">{base.compared.accuracy}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Missed notes</dt><dd className="text-brand">{base.compared.errors}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Tempo</dt><dd className="text-brand">{base.compared.tempo}</dd></div>
        </dl>
      </section>

      {/* Details */}
      <section className="mt-6">
        <SectionHeader title="Details" />
        <dl className="mt-3 space-y-2 type-body-small">
          <div className="flex justify-between"><dt className="text-ink-secondary">Missing notes</dt><dd className="text-ink-primary">{base.missing}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Unexpected notes</dt><dd className="text-ink-primary">{base.unexpected}</dd></div>
          {skipped > 0 && (
            <div className="flex justify-between"><dt className="text-ink-secondary">Groups skipped</dt><dd className="text-ink-primary">{skipped}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-ink-secondary">Mode</dt><dd className="text-ink-primary">{session?.mode || 'Practice'}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Input</dt><dd className="text-ink-primary">{session?.input || 'Microphone'}</dd></div>
        </dl>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link to={scoreId ? `/score/${scoreId}/setup` : '/practice'} className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          <RotateCcw className="h-4 w-4" /> Play it again
        </Link>
        <Link to="/performances" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Performances
        </Link>
        <Link to="/practice" className="flex items-center gap-2 rounded-control border border-line-subtle px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          Back to Practice
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/practice/history" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"><History className="h-4 w-4" /> Practice history</Link>
        <Link to="/practice/progress" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary"><BarChart3 className="h-4 w-4" /> Progress</Link>
      </div>

      <ShareVideoDialog open={shareOpen} onOpenChange={setShareOpen} title={scoreTitle} />
    </div>
  );
}