/**
 * Practice statistics, counted by calendar day.
 *
 * The last seven days means the seven dates ending today — not the seven most
 * recent sessions. Practice and Progress read the same numbers from here.
 */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function practiceWeek(activities, days = 7) {
  const mine = (activities || []).filter((a) => a.ownerId === 'you' && a.completedAt);

  const buckets = Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      key: startOfDay(date),
      date,
      label: DAY_LABELS[date.getDay()],
      seconds: 0,
      sessions: 0,
      scoreIds: [],
    };
  });

  mine.forEach((a) => {
    const parsed = new Date(a.completedAt);
    if (Number.isNaN(parsed.getTime())) return;
    const bucket = buckets.find((b) => b.key === startOfDay(parsed));
    if (!bucket) return;
    bucket.seconds += a.durationSeconds || 0;
    bucket.sessions += 1;
    if (!bucket.scoreIds.includes(a.scoreId)) bucket.scoreIds.push(a.scoreId);
  });

  const totalSeconds = buckets.reduce((sum, b) => sum + b.seconds, 0);
  const pieces = new Set();
  buckets.forEach((b) => b.scoreIds.forEach((id) => pieces.add(id)));

  return {
    days: buckets.map((b) => ({ ...b, minutes: Math.round(b.seconds / 60) })),
    totalMinutes: Math.round(totalSeconds / 60),
    totalSeconds,
    sessions: buckets.reduce((sum, b) => sum + b.sessions, 0),
    pieces: pieces.size,
    activeDays: buckets.filter((b) => b.sessions > 0).length,
  };
}