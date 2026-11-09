import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { composeShareVideo } from '@/lib/composeShareVideo';
import { downloadBlob, slugify } from '@/lib/media';
import { getScoreNotation, NOTATION_PREVIEW_NOTICE } from '@/lib/scoreNotation';
import { usePrototypeStore } from '@/stores/prototypeStore';

const FORMATS = [
  { value: 'landscape', label: 'Landscape 16:9' },
  { value: 'portrait', label: 'Portrait 9:16' },
];
const LAYOUTS = [
  { value: 'side', label: 'Side by side' },
  { value: 'overlay', label: 'Score over video' },
];

/**
 * Builds the share video from the saved original recording. Audio and video
 * recordings both work: an audio recording gets the score as its picture.
 *
 * Generated on this device, previewed here, and downloaded — never uploaded.
 * Closing the dialog aborts the build and releases the capture.
 */
export default function ShareVideoDialog({
  open, onOpenChange, title, composer, rangeSummary,
  scoreId, startMeasure = 1, endMeasure, timeline, durationSeconds = 0,
  mediaBlob = null, mediaType = 'video', mediaUrl = null,
}) {
  const [format, setFormat] = useState('landscape');
  const [layout, setLayout] = useState('side');
  const [stage, setStage] = useState('idle'); // idle | generating | ready | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const controllerRef = useRef(null);
  const score = usePrototypeStore((s) => s.scores.find((x) => x.id === scoreId));
  const { notes, approximate } = useMemo(() => getScoreNotation(score, scoreId), [score, scoreId]);
  const hasSource = !!mediaBlob || !!mediaUrl;
  const isVideo = mediaType === 'video';

  // Leaving the dialog — or unmounting the page — stops any build in progress.
  useEffect(() => () => controllerRef.current?.abort(), []);

  useEffect(() => {
    if (!open) {
      controllerRef.current?.abort();
      controllerRef.current = null;
      setStage('idle');
      setError(null);
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!result) { setPreviewUrl(null); return undefined; }
    const url = URL.createObjectURL(result);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const generate = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStage('generating');
    setError(null);

    try {
      let blob = mediaBlob;
      if (!blob && mediaUrl) {
        const response = await fetch(mediaUrl, { signal: controller.signal });
        if (!response.ok) throw new Error('The saved recording could not be read for this video.');
        blob = await response.blob();
      }
      if (!blob) throw new Error('A share video needs the saved recording.');

      const video = await composeShareVideo({
        mediaBlob: blob,
        mediaType,
        format,
        layout: isVideo ? layout : 'side',
        notes,
        startMeasure,
        endMeasure,
        timeline,
        durationSeconds,
        signal: controller.signal,
        meta: { title, composer, rangeSummary },
      });
      if (controller.signal.aborted) return;
      setResult(video);
      setStage('ready');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err?.message || 'The video could not be generated.');
      setStage('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  const close = () => {
    controllerRef.current?.abort();
    onOpenChange(false);
  };

  const download = () => {
    if (!result) return;
    downloadBlob(result, `${slugify(title)}-share.webm`);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Make a share video</DialogTitle>
          <DialogDescription>
            {title} — your {isVideo ? 'video' : 'audio'} recording with the score alongside it.
          </DialogDescription>
        </DialogHeader>

        {!hasSource ? (
          <p className="type-body-small text-ink-secondary">
            A share video is built from a saved recording. This performance has no recording file.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="type-caption text-ink-tertiary">Format</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    aria-pressed={format === f.value}
                    disabled={stage === 'generating'}
                    className={`rounded-control border px-3 py-1.5 type-body-small transition-colors disabled:opacity-50 ${format === f.value ? 'border-brand bg-brand-soft text-brand-soft-foreground font-medium' : 'border-line-subtle text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isVideo ? (
              <div>
                <p className="type-caption text-ink-tertiary">Layout</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setLayout(l.value)}
                      aria-pressed={layout === l.value}
                      disabled={stage === 'generating'}
                      className={`rounded-control border px-3 py-1.5 type-body-small transition-colors disabled:opacity-50 ${layout === l.value ? 'border-brand bg-brand-soft text-brand-soft-foreground font-medium' : 'border-line-subtle text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="type-body-small text-ink-secondary">
                Your audio recording with the score as the picture — the page follows the measure changes recorded
                during the session.
              </p>
            )}

            {approximate && (
              <p className="type-metadata text-ink-tertiary">{NOTATION_PREVIEW_NOTICE}</p>
            )}

            {stage === 'generating' && (
              <p className="flex items-center gap-2 type-body-small text-ink-secondary">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Building the video from your recording — this takes about as long as the recording.
              </p>
            )}

            {previewUrl && (
              <div>
                <p className="type-caption text-ink-tertiary">Preview</p>
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="mt-2 w-full rounded-container border border-line-subtle bg-black"
                />
              </div>
            )}

            {stage === 'error' && <p className="type-body-small text-danger">{error}</p>}

            <p className="type-metadata text-ink-tertiary">
              Built on this device and downloaded by you. The video is not uploaded to Yueora, does not appear in
              Performances, and does not use your storage.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            {stage === 'generating' ? 'Stop and close' : 'Close'}
          </Button>
          {hasSource && stage !== 'ready' && (
            <Button onClick={generate} disabled={stage === 'generating'}>
              {stage === 'generating'
                ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Building video…</>
                : stage === 'error' ? 'Try again' : 'Generate video'}
            </Button>
          )}
          {stage === 'ready' && (
            <Button onClick={download}>
              <Download className="mr-1.5 h-4 w-4" /> Download video
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}