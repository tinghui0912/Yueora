/**
 * ScorePreview — miniature score page at thumbnail scale.
 * Includes page margin, score title, composer, 2–3 notation systems,
 * varying note density, bar lines, deterministic variation.
 * Looks like sheet music, not a technically editable notation engine.
 */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function ScorePreview({ id, className = '' }) {
  const seed = hash(id);
  const systems = 2 + (seed % 2); // 2 or 3 systems
  const systemH = 26;
  const startY = 30;
  const staffLines = [0, 5, 10, 15, 20];
  const w = 200;
  const h = 110;

  // Generate deterministic notes per system
  const systemNotes = Array.from({ length: systems }).map((_, si) => {
    const count = 3 + (hash(id + 'sys' + si) % 4);
    const notes = [];
    for (let i = 0; i < count; i++) {
      const v = hash(id + si + 'n' + i);
      notes.push({
        x: 30 + (v % 50) + i * 14,
        y: (v % 5) * 5,
        up: v % 2 === 0,
        flag: v % 4 === 0,
      });
    }
    return notes;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`bg-surface-paper ${className}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* Page background */}
      <rect width={w} height={h} fill="hsl(var(--surface-paper))" />

      {/* Subtle folio binding line on left */}
      <line x1="1" y1="0" x2="1" y2={h} stroke="hsl(var(--surface-paper-edge))" strokeWidth="2" opacity="0.6" />

      {/* Title placeholder */}
      <text x={w / 2} y="14" textAnchor="middle" fill="#3A3528" fontSize="5" fontFamily="Georgia, serif" opacity="0.5">
        {seed % 3 === 0 ? 'Nocturne' : seed % 3 === 1 ? 'Prelude' : 'Sonata'}
      </text>
      <text x={w / 2} y="22" textAnchor="middle" fill="#3A3528" fontSize="3.5" fontFamily="Georgia, serif" opacity="0.35">
        {seed % 4 === 0 ? 'Chopin' : seed % 4 === 1 ? 'Bach' : seed % 4 === 2 ? 'Beethoven' : 'Debussy'}
      </text>

      {/* Staff systems */}
      {Array.from({ length: systems }).map((_, si) => {
        const yBase = startY + si * (systemH + 6);
        return (
          <g key={si}>
            {/* Staff lines */}
            {staffLines.map((dy) => (
              <line key={dy} x1="14" y1={yBase + dy} x2={w - 14} y2={yBase + dy} stroke="#C8C4B8" strokeWidth="0.5" />
            ))}
            {/* Barlines */}
            <line x1="14" y1={yBase} x2="14" y2={yBase + 20} stroke="#2A2518" strokeWidth="0.8" />
            <line x1={w / 2} y1={yBase} x2={w / 2} y2={yBase + 20} stroke="#2A2518" strokeWidth="0.4" opacity="0.5" />
            <line x1={w - 14} y1={yBase} x2={w - 14} y2={yBase + 20} stroke="#2A2518" strokeWidth="0.8" />

            {/* Notes */}
            {systemNotes[si].map((n, i) => (
              <g key={i} fill="#1F2022">
                <ellipse cx={n.x} cy={yBase + n.y + 6} rx="3" ry="2.2" transform={`rotate(-15 ${n.x} ${yBase + n.y + 6})`} />
                <line x1={n.x + 2.8} y1={yBase + n.y + 6} x2={n.x + 2.8} y2={n.up ? yBase + n.y - 16 : yBase + n.y + 26} stroke="#1F2022" strokeWidth="0.9" />
                {n.flag && <path d={`M ${n.x + 2.8} ${n.up ? yBase + n.y - 16 : yBase + n.y + 26} q 6 3 3 8`} fill="none" stroke="#1F2022" strokeWidth="0.8" />}
              </g>
            ))}
          </g>
        );
      })}

      {/* Decorative marker — gold dot for some scores */}
      {seed % 3 === 0 && <circle cx={w - 22} cy={h - 14} r="2" fill="#C59B27" opacity="0.6" />}
    </svg>
  );
}