/**
 * Score position over a recording timeline.
 *
 * A timeline point is { t, measure } where t is seconds from the start of the
 * recording. The points are captured while practising — each time the score
 * moved to a new measure, that moment was written down. Replaying uses those
 * points instead of guessing how long a measure "should" take.
 */

export function normalizeTimeline(timeline) {
  if (!Array.isArray(timeline)) return [];
  return timeline
    .filter((p) => p && Number.isFinite(p.t) && Number.isFinite(p.measure))
    .map((p) => ({ t: Math.max(0, p.t), measure: Math.max(1, Math.round(p.measure)) }))
    .sort((a, b) => a.t - b.t);
}

export const hasTimeline = (timeline) => normalizeTimeline(timeline).length > 0;

/**
 * The measure the score was on at a given second. Without captured points we
 * spread the played range evenly across the recording — an approximation, and
 * the UI says so rather than implying note-level alignment.
 */
export function measureAtTime({ timeline, time, startMeasure = 1, endMeasure, durationSeconds }) {
  const points = normalizeTimeline(timeline);
  if (points.length) {
    let measure = points[0].measure;
    for (const point of points) {
      if (point.t <= time + 0.05) measure = point.measure;
      else break;
    }
    return measure;
  }

  const start = Math.max(1, startMeasure || 1);
  const end = Math.max(start, endMeasure || start);
  if (!durationSeconds || end === start) return start;
  const ratio = Math.min(0.9999, Math.max(0, time / durationSeconds));
  return start + Math.floor(ratio * (end - start + 1));
}