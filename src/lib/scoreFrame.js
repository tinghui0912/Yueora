import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ScoreCanvas from '@/components/editor/ScoreCanvas';

/**
 * Rasterises the real score canvas for the local share-video export.
 *
 * The export must show the same notation the app shows, so this renders the
 * actual ScoreCanvas component off-screen and captures its SVG — no substitute
 * staves are drawn by hand.
 */

// The canvas refers to design tokens; a standalone SVG has no stylesheet, so the
// values are inlined on its root element.
const TOKENS = {
  '--foreground': '220 5% 13%',
  '--border': '47 13% 87%',
  '--muted-foreground': '223 3% 43%',
  '--primary': '148 36% 27%',
  '--practice-current': '40 55% 48%',
  '--selection': '148 36% 88%',
  '--warning': '38 58% 45%',
  '--card': '0 0% 100%',
};

const SCORE_CANVAS_BG = '#fffdf8';
const SCORE_WIDTH = 40 + 4 * 168 + 20;

export async function rasterizeScoreWindow({ notes, measureStart, activeMeasure, width = 1200 }) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;padding:20px;background:#fffdf8;';
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
    svg.setAttribute('style', Object.entries(TOKENS).map(([k, v]) => `${k}:${v}`).join(';'));
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
    ctx.fillStyle = SCORE_CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}