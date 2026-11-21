import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, Mic, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import { getScoreNotation, NOTATION_PREVIEW_NOTICE } from '@/lib/scoreNotation';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { fmtClock, measureWindowStart } from '@/lib/practiceUtils';
import { measureAtTime, hasTimeline } from '@/lib/syncTimeline';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

/**
 * One playback timeline for the recording and the score.
 *
 * The recording is the clock: seeking, pausing or restarting moves the score
 * with it. The score position comes from the measure changes recorded during
 * the session, so it follows what actually happened rather than an estimate.
 */
export default function SyncPlayback({
  src,
  mediaType = 'video',
  scoreId,
  scoreTitle,
  loading = false,
  error = null,
  onRetry = undefined,
  startMeasure = 1,
  endMeasure = undefined,
  durationSeconds = 0,
  timeline = undefined,
}) {
  const mediaRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [mediaError, setMediaError] = useState(null);

  const score = usePrototypeStore((s) => s.scores.find((x) => x.id === scoreId));
  const { notes, approximate } = useMemo(() => getScoreNotation(score, scoreId), [score, scoreId]);
  const exact = hasTimeline(timeline);

  const measure = measureAtTime({
    timeline,
    time,
    startMeasure,
    endMeasure,
    durationSeconds: duration || durationSeconds,
  });
  const windowStart = measureWindowStart(measure);

  useEffect(() => {
    setTime(0);
    setPlaying(false);
    setMediaError(null);
    setDuration(durationSeconds || 0);
  }, [src, durationSeconds]);

  const play = () => {
    const node = mediaRef.current;
    if (!node) return;
    node.play().catch(() => setMediaError('Playback was blocked. Press play again.'));
  };

  const pause = () => mediaRef.current?.pause();

  const seek = (value) => {
    const node = mediaRef.current;
    if (!node) return;
    const next = Math.max(0, Math.min(duration || durationSeconds || 0, value));
    node.currentTime = next;
    setTime(next);
  };

  const restart = () => {
    seek(0);
    play();
  };

  const shownDuration = duration || durationSeconds || 0;
  const progress = shownDuration ? Math.min(100, (time / shownDuration) * 100) : 0;
  const unavailable = loading || error || !src;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* The recording */}
        <div className="min-w-0">
          {error ? (
            <div className="flex aspect-video flex-col items-center justify-center rounded-container border border-line-subtle bg-surface-panel px-6 text-center">
              <AlertCircle className="h-6 w-6 text-warning" aria-hidden="true" />
              <p className="mt-2 type-body-small text-ink-primary">This recording could not be opened.</p>
              <p className="mt-1 type-metadata text-ink-tertiary">{error}</p>
              {onRetry && <Button intent="secondary" size="sm" className="mt-3" onClick={onRetry}>Try again</Button>}
            </div>
          ) : loading || !src ? (
            <div className="flex aspect-video items-center justify-center rounded-container border border-line-subtle bg-surface-panel">
              <Loader2 className="h-5 w-5 animate-spin text-ink-tertiary" aria-label="Loading recording" />
            </div>
          ) : mediaType === 'video' ? (
            <video
              ref={mediaRef}
              src={src}
              playsInline
              preload="metadata"
              className="w-full rounded-container border border-line-subtle bg-black"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || durationSeconds)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setMediaError('The recording file could not be played.')}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-container border border-line-subtle bg-surface-panel">
              <audio
                ref={mediaRef}
                src={src}
                preload="metadata"
                className="sr-only"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || durationSeconds)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onError={() => setMediaError('The recording file could not be played.')}
              />
              <Mic className="h-6 w-6 text-brand" aria-hidden="true" />
              <p className="mt-2 type-body-small font-medium text-ink-primary">{scoreTitle || 'Audio recording'}</p>
              <p className="type-metadata text-ink-tertiary">Audio · {fmtClock(shownDuration)}</p>
            </div>
          )}
        </div>

        {/* The score, following the recording */}
        <div className="min-w-0 rounded-container border border-line-subtle bg-surface-panel p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="type-caption text-ink-tertiary">Score</p>
            <p className="type-metadata text-ink-tertiary">Measures {windowStart}–{windowStart + 3}</p>
          </div>
          <div className="mt-2 overflow-x-auto">
            <ScoreCanvas
              notes={notes}
              selectedIds={null}
              onSelect={() => {}}
              zoom={0.94}
              activeMeasure={measure}
              activeMeasureVariant="practice"
              measureStart={windowStart}
            />
          </div>
          <p className="mt-2 type-metadata text-ink-tertiary">
            {exact
              ? 'The score follows the measure changes recorded during this session.'
              : 'Approximate: this session did not record measure changes, so the range is spread evenly across the recording.'}
          </p>
          {approximate && (
            <p className="mt-1 type-metadata text-ink-tertiary">{NOTATION_PREVIEW_NOTICE}</p>
          )}
        </div>
      </div>

      {/* Shared controls — one clock for both */}
      <div className="mt-4 rounded-container border border-line-subtle bg-surface-panel px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <IconButton
            icon={RotateCcw}
            label="Restart from the beginning"
            tone="outline"
            size="sm"
            onClick={restart}
            disabled={unavailable}
          />
          <IconButton
            icon={SkipBack}
            label="Back 10 seconds"
            tone="outline"
            size="sm"
            onClick={() => seek(time - 10)}
            disabled={unavailable}
          />
          <IconButton
            icon={playing ? Pause : Play}
            label={playing ? 'Pause' : 'Play'}
            tone="primary"
            size="md"
            onClick={() => (playing ? pause() : play())}
            disabled={unavailable}
          />
          <IconButton
            icon={SkipForward}
            label="Forward 10 seconds"
            tone="outline"
            size="sm"
            onClick={() => seek(time + 10)}
            disabled={unavailable}
          />

          <div className="relative mx-1 min-w-[140px] flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.round(shownDuration))}
              step={1}
              value={Math.min(Math.round(time), Math.round(shownDuration))}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={unavailable}
              aria-label="Seek through the recording"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
          </div>

          <span className="shrink-0 tabular-nums type-metadata text-ink-secondary">
            {fmtClock(time)} / {fmtClock(shownDuration)}
          </span>
        </div>
        {mediaError && <p className="mt-2 type-metadata text-danger">{mediaError}</p>}
      </div>
    </div>
  );
}