// Small shared helpers for the practice surfaces. Presentation only.

// The score canvas shows four measures at a time; this returns the window start
// that contains a given measure.
export const measureWindowStart = (measure) =>
  Math.max(1, Math.floor((Math.max(1, measure || 1) - 1) / 4) * 4 + 1);

export const fmtClock = (sec) => {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const tempoLabel = (tempoMode, bpm) => (tempoMode === 'score' ? 'Score' : `${bpm} BPM`);

export const rangeLabel = (range) =>
  !range || range.kind === 'full'
    ? 'Full score'
    : range.startMeasure === range.endMeasure
      ? `Measure ${range.startMeasure}`
      : `Measures ${range.startMeasure}–${range.endMeasure}`;