import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ScoreCanvas from '@/components/editor/ScoreCanvas';
import { resolveSemanticColor, resolveRequiredSvgTokens } from '@/lib/cssTokens';

/**
 * Rasterises the real score canvas for the local share-video export.
 *
 * The export must show the same notation the app shows, so this renders the
 * actual ScoreCanvas component off-screen and captures its SVG — no substitute
 * staves are drawn by hand.
 */

const SCORE_WIDTH = 40 + 4 * 168 + 20;

export async function rasterizeScoreWindow({ notes, measureStart, activeMeasure, width = 1200 }) {
  const panelBg = resolveSemanticColor('--surface-panel', '#ffffff');
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-20000px;top:0;padding:20px;background:${panelBg};`;
  document.body.appendChild(host);
  const root = createRoot(host);

  let markup = null;
  let sourceWidth = SCORE_WIDTH;
  let sourceHeight = 320;

  try {
    flushSync(() => {
      root.render(
        React.createElement(ScoreCanvas, {
          notes,
          selectedIds: null,
          onSelect: () => {},
          zoom: 1,
          activeMeasure: activeMeasure ?? null,
          activeMeasureVariant: 'practice',
          measureStart,
        })
      );
    });

    const svg = host.querySelector('svg');
    if (!svg) throw new Error('The score could not be prepared for the video.');

    sourceWidth = Number(svg.getAttribute('width')) || SCORE_WIDTH;
    sourceHeight = Number(svg.getAttribute('height')) || 320;

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('style', resolveRequiredSvgTokens());
    markup = new XMLSerializer().serializeToString(svg);
  } finally {
    root.unmount();
    host.remove();
  }

  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = width / sourceWidth;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = panelBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}