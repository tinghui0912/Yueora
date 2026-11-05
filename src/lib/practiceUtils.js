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

// "18 min" for activity lengths, "4:22" for media lengths.
export const minutesLabel = (sec) => {
  const m = Math.max(1, Math.round((sec || 0) / 60));
  return `${m} min`;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const dayLabel = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const modeLabel = (mode) => (mode === 'performance' ? 'Performance' : 'Follow notes');

export const visibilityLabel = (item) => {
  if (!item || !item.visibility || item.visibility === 'private') return 'Private';
  const n = (item.sharedWith || []).length;
  if (item.ownerId && item.ownerId !== 'you') return 'Shared with you';
  return n <= 1 ? 'Shared with 1 member' : `Shared with ${n} members`;
};