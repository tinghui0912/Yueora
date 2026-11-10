import { measureWindowStart } from '@/lib/practiceUtils';
import { measureAtTime } from '@/lib/syncTimeline';
import { rasterizeScoreWindow } from '@/lib/scoreFrame';
import { resolveSemanticColor } from '@/lib/cssTokens';

const SIZES = {
  landscape: { width: 1280, height: 720 },
  portrait: { width: 720, height: 1280 },
};

function drawCover(ctx, video, x, y, w, h) {
  const vw = video.videoWidth || 16;
  const vh = video.videoHeight || 9;
  const scale = Math.max(w / vw, h / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.drawImage(video, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function clock(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Builds the share video locally: the saved recording laid out with the real
 * score, captured into a real video file in the browser.
 *
 * Nothing here is uploaded. The returned Blob only becomes a file on the user's
 * device — it is never a stored performance.
 */
export async function composeShareVideo({
  mediaBlob,
  mediaType = 'video',
  format = 'landscape',
  layout = 'side',
  meta = /** @type {Record<string, any>} */ ({}),
  notes = [],
  startMeasure = 1,
  endMeasure,
  timeline,
  durationSeconds = 0,
  signal,
}) {
  if (!mediaBlob) throw new Error('The original recording is needed to build a video.');
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot build a video.');
  if (signal?.aborted) throw new Error('The video build was stopped.');

  const { width, height } = SIZES[format] || SIZES.landscape;
  const objectUrl = URL.createObjectURL(mediaBlob);
  const video = document.createElement('video');
  video.src = objectUrl;
  video.playsInline = true;
  video.preload = 'auto';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  let audioContext = null;
  let destination = null;
  let stream = null;
  let recorder = null;

  // Aborting (dialog closed, user left the page) stops capture immediately, so
  // nothing is left recording in the background.
  const stopCapture = () => {
    try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch { /* already stopped */ }
    try { video.pause(); } catch { /* not playing */ }
  };
  const onAbort = () => stopCapture();
  if (signal) signal.addEventListener('abort', onAbort);

  const drawScoreBox = (box, scoreCanvas, measure) => {
    ctx.fillStyle = resolveSemanticColor('--surface-panel');
    ctx.fillRect(box.x, box.y, box.width, box.height);

    const pad = Math.max(10, Math.round(box.width * 0.035));
    const titleSize = Math.max(13, Math.round(box.width * 0.034));
    const metaSize = Math.max(10, Math.round(box.width * 0.021));

    ctx.textAlign = 'left';
    ctx.fillStyle = resolveSemanticColor('--ink-primary');
    ctx.font = `600 ${titleSize}px Georgia, serif`;
    ctx.fillText(meta.title || 'Performance', box.x + pad, box.y + pad + titleSize);

    ctx.fillStyle = resolveSemanticColor('--brand');
    ctx.font = `${metaSize}px Helvetica, Arial, sans-serif`;
    const subtitle = [meta.composer, meta.rangeSummary].filter(Boolean).join(' · ');
    if (subtitle) ctx.fillText(subtitle, box.x + pad, box.y + pad + titleSize + metaSize + 6);

    if (scoreCanvas) {
      const top = box.y + pad + titleSize + metaSize + 18;
      const availW = box.width - pad * 2;
      const availH = box.y + box.height - pad - top;
      const scale = Math.min(availW / scoreCanvas.width, availH / scoreCanvas.height);
      const dw = scoreCanvas.width * scale;
      const dh = scoreCanvas.height * scale;
      ctx.drawImage(scoreCanvas, box.x + pad + (availW - dw) / 2, top, dw, dh);
    }

    ctx.fillStyle = resolveSemanticColor('--ink-tertiary');
    ctx.font = `${Math.max(9, Math.round(metaSize * 0.85))}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`Measure ${measure}`, box.x + box.width - pad, box.y + box.height - pad * 0.7);
    ctx.textAlign = 'left';
  };

  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('The recording could not be read for a share video.'));
    });

    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : Math.max(1, durationSeconds);

    // The score follows the recording in four-measure windows — the same window
    // size the practice screen uses. Each window is rasterised from the real
    // notation before recording starts.
    const windows = new Map();
    const step = Math.max(0.5, Math.min(2, duration / 180));
    for (let t = 0; t <= duration; t += step) {
      const measure = measureAtTime({ timeline, time: t, startMeasure, endMeasure, durationSeconds: duration });
      const windowStart = measureWindowStart(measure);
      if (!windows.has(windowStart)) windows.set(windowStart, measure);
    }
    if (!windows.size) windows.set(measureWindowStart(startMeasure), startMeasure);

    const frames = new Map();
    for (const [windowStart, measure] of windows) {
      frames.set(windowStart, await rasterizeScoreWindow({ notes, measureStart: windowStart, activeMeasure: measure }));
    }

    const draw = () => {
      const time = video.currentTime;
      const measure = measureAtTime({ timeline, time, startMeasure, endMeasure, durationSeconds: duration });
      const frame = frames.get(measureWindowStart(measure)) || frames.values().next().value;

      ctx.fillStyle = '#15171a';
      ctx.fillRect(0, 0, width, height);

      if (mediaType === 'video') {
        if (layout === 'overlay') {
          drawCover(ctx, video, 0, 0, width, height);
          const scoreHeight = height * 0.36;
          ctx.globalAlpha = 0.96;
          drawScoreBox({ x: width * 0.04, y: height - scoreHeight - height * 0.05, width: width * 0.92, height: scoreHeight }, frame, measure);
          ctx.globalAlpha = 1;
        } else if (format === 'portrait') {
          const videoHeight = height * 0.52;
          drawCover(ctx, video, 0, 0, width, videoHeight);
          drawScoreBox({ x: 0, y: videoHeight, width, height: height - videoHeight }, frame, measure);
        } else {
          const half = width / 2;
          drawCover(ctx, video, 0, 0, half, height);
          drawScoreBox({ x: half, y: 0, width: half, height }, frame, measure);
        }
      } else {
        // An audio recording gets the score as its picture.
        ctx.fillStyle = '#12201a';
        ctx.fillRect(0, 0, width, height);
        drawScoreBox({ x: width * 0.05, y: height * 0.05, width: width * 0.9, height: height * 0.82 }, frame, measure);
        ctx.fillStyle = resolveSemanticColor('--brand-soft');
        ctx.font = `500 ${Math.round(width * 0.018)}px Helvetica, Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Audio recording', width * 0.05, height * 0.945);
      }

      ctx.fillStyle = resolveSemanticColor('--surface-canvas');
      ctx.font = `500 ${Math.round(width * 0.017)}px Helvetica, Arial, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`${clock(time)} / ${clock(duration)}`, width - width * 0.04, height - height * 0.03);
      ctx.textAlign = 'left';
    };

    stream = canvas.captureStream(30);

    // The recording's own audio track is routed straight into the export; the
    // graph has no speaker output, so building a video stays silent.
    try {
      const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        const source = audioContext.createMediaElementSource(video);
        destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }
    } catch {
      // A silent share video is still a real export; audio capture is best-effort.
    }

    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const finished = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    draw();
    recorder.start(500);
    try {
      await video.play();
    } catch (err) {
      if (!signal?.aborted) throw err;
    }

    await new Promise((resolve) => {
      const tick = () => {
        if (signal?.aborted || video.ended) { resolve(); return; }
        draw();
        requestAnimationFrame(tick);
      };
      video.onended = resolve;
      requestAnimationFrame(tick);
    });

    if (signal?.aborted) throw new Error('The video build was stopped.');
    recorder.stop();
    const blob = await finished;
    if (signal?.aborted) throw new Error('The video build was stopped.');
    if (!blob.size) throw new Error('The video came out empty. Try again.');
    return blob;
  } finally {
    if (signal) signal.removeEventListener('abort', onAbort);
    stopCapture();
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (destination) destination.stream.getTracks().forEach((track) => track.stop());
    video.pause();
    video.removeAttribute('src');
    video.load?.();
    URL.revokeObjectURL(objectUrl);
    if (audioContext) audioContext.close().catch(() => {});
  }
}