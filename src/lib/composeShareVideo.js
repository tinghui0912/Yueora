const SIZES = {
  landscape: { width: 1280, height: 720 },
  portrait: { width: 720, height: 1280 },
};

const PAPER = '#fffdf8';
const INK = '#23252a';
const LINE = '#d8d3c6';
const BRAND = '#2c5f47';

function drawStaff(ctx, x, y, width, staffGap) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const lineY = y + i * staffGap;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }
}

/** The score presentation drawn over the recording — the same notation the app shows. */
function drawScore(ctx, box, meta) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  const pad = Math.max(12, box.width * 0.04);
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = `600 ${Math.round(box.width * 0.035)}px Georgia, serif`;
  ctx.fillText(meta.title || 'Performance', box.x + pad, box.y + pad + box.width * 0.03);

  ctx.fillStyle = BRAND;
  ctx.font = `${Math.round(box.width * 0.022)}px Helvetica, Arial, sans-serif`;
  const subtitle = [meta.composer, meta.rangeSummary].filter(Boolean).join(' · ');
  if (subtitle) ctx.fillText(subtitle, box.x + pad, box.y + pad + box.width * 0.065);

  const staffTop = box.y + box.height * 0.3;
  const staffGap = Math.max(5, box.height * 0.014);
  drawStaff(ctx, box.x + pad, staffTop, box.width - pad * 2, staffGap);
  drawStaff(ctx, box.x + pad, staffTop + staffGap * 6, box.width - pad * 2, staffGap);

  // Bar markers give the notation its measure structure.
  const barCount = 5;
  const usable = box.width - pad * 2;
  ctx.strokeStyle = LINE;
  for (let i = 1; i < barCount; i += 1) {
    const barX = box.x + pad + (usable / barCount) * i;
    ctx.beginPath();
    ctx.moveTo(barX, staffTop);
    ctx.lineTo(barX, staffTop + staffGap * 10);
    ctx.stroke();
  }

  ctx.fillStyle = '#8b8b86';
  ctx.font = `${Math.round(box.width * 0.02)}px Helvetica, Arial, sans-serif`;
  const first = meta.startMeasure || 1;
  for (let i = 0; i < barCount; i += 1) {
    ctx.fillText(String(first + i), box.x + pad + (usable / barCount) * i + 4, staffTop - staffGap);
  }
}

/**
 * Builds the share video in the browser: the real recording is laid out with the
 * score presentation and captured back into a real video file.
 */
export async function composeShareVideo({ videoBlob, format, layout, meta = {} }) {
  if (!videoBlob) throw new Error('The original recording is needed to build a share video.');
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot build a video.');

  const { width, height } = SIZES[format] || SIZES.landscape;
  const objectUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement('video');
  video.src = objectUrl;
  video.playsInline = true;
  video.muted = true;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const draw = () => {
    ctx.fillStyle = '#15171a';
    ctx.fillRect(0, 0, width, height);

    if (layout === 'overlay') {
      ctx.drawImage(video, 0, 0, width, height);
      const scoreHeight = height * 0.34;
      ctx.globalAlpha = 0.94;
      drawScore(ctx, { x: width * 0.05, y: height - scoreHeight - height * 0.05, width: width * 0.9, height: scoreHeight }, meta);
      ctx.globalAlpha = 1;
      return;
    }

    if (format === 'portrait') {
      const videoHeight = height * 0.55;
      ctx.drawImage(video, 0, 0, width, videoHeight);
      drawScore(ctx, { x: 0, y: videoHeight, width, height: height - videoHeight }, meta);
      return;
    }

    const half = width / 2;
    ctx.drawImage(video, 0, 0, half, height);
    drawScore(ctx, { x: half, y: 0, width: half, height }, meta);
  };

  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('The recording could not be read for a share video.'));
    });

    const stream = canvas.captureStream(30);
    try {
      const captured = video.captureStream ? video.captureStream() : null;
      captured?.getAudioTracks().forEach((track) => stream.addTrack(track));
    } catch {
      // A silent share video is still a real video; audio capture is best-effort.
    }

    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const finished = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    draw();
    recorder.start(500);
    await video.play();

    await new Promise((resolve) => {
      let frame = 0;
      const tick = () => {
        if (video.ended) { resolve(); return; }
        draw();
        frame += 1;
        requestAnimationFrame(tick);
      };
      video.onended = resolve;
      requestAnimationFrame(tick);
      if (frame === 0) draw();
    });

    recorder.stop();
    const blob = await finished;
    if (!blob.size) throw new Error('The share video came out empty. Try again.');
    return blob;
  } finally {
    video.pause();
    video.removeAttribute('src');
    URL.revokeObjectURL(objectUrl);
  }
}