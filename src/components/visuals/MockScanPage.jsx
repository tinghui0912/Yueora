/**
 * MockScanPage — original mock of a scanned sheet music page.
 * Warm paper tone, notation density, title/composer placeholder,
 * multiple systems, page margin, subtle scan noise, pencil marking.
 * Deterministic per seed. Original/generic notation — no copyrighted material.
 */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function MockScanPage({ seed = 'scan-1', className = '', showHighlight = false, highlightMeasure = null }) {
  const s = hash(seed);
  const systems = 4;
  const systemSpacing = 62;
  const startY = 72;
  const staffLines = [0, 6, 12, 18, 24];

  // Generate deterministic notes per system
  const systemNotes = Array.from({ length: systems }).map((_, si) => {
    const notes = [];
    const count = 4 + (hash(seed + 'sys' + si) % 4);
    for (let i = 0; i < count; i++) {
      const v = hash(seed + si + 'n' + i);
      notes.push({
        x: 32 + (v % 80) + i * 16,
        y: (v % 5) * 6,
        up: v % 2 === 0,
        dur: v % 3,
      });
    }
    return notes;
  });

  return (
    <svg viewBox="0 0 240 320" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* Paper background — slightly warm */}
      <rect width="240" height="320" fill="#F8F5EE" />
      {/* Subtle scan noise */}
      <rect width="240" height="320" fill="#000" opacity="0.015" />

      {/* Page margin line */}
      <line x1="20" y1="20" x2="220" y2="20" stroke="#D4CFC0" strokeWidth="0.5" opacity="0.5" />

      {/* Title placeholder */}
      <text x="120" y="34" textAnchor="middle" fill="#3A3528" fontSize="7" fontFamily="Georgia, serif" opacity="0.55">
        {s % 2 === 0 ? 'Nocturne' : 'Prelude'}
      </text>
      <text x="120" y="44" textAnchor="middle" fill="#3A3528" fontSize="5" fontFamily="Georgia, serif" opacity="0.4">
        {s % 3 === 0 ? 'F. Chopin' : s % 3 === 1 ? 'J. S. Bach' : 'L. v. Beethoven'}
      </text>

      {/* Staff systems */}
      {Array.from({ length: systems }).map((_, si) => {
        const yBase = startY + si * systemSpacing;
        const isHighlighted = showHighlight && highlightMeasure !== null && (Math.floor(highlightMeasure - 1) % systems) === si;
        return (
          <g key={si}>
            {/* Staff lines */}
            {staffLines.map((dy) => (
              <line key={dy} x1="20" y1={yBase + dy} x2="220" y2={yBase + dy} stroke="#5A5440" strokeWidth="0.5" opacity="0.7" />
            ))}
            {/* Barlines */}
            <line x1="20" y1={yBase} x2="20" y2={yBase + 24} stroke="#3A3528" strokeWidth="0.8" />
            <line x1="120" y1={yBase} x2="120" y2={yBase + 24} stroke="#3A3528" strokeWidth="0.5" opacity="0.6" />
            <line x1="220" y1={yBase} x2="220" y2={yBase + 24} stroke="#3A3528" strokeWidth="0.8" />

            {/* Highlight rectangle for active issue */}
            {isHighlighted && (
              <rect x="118" y={yBase - 2} width="20" height="28" fill="#E8A030" opacity="0.2" rx="1" />
            )}

            {/* Notes */}
            {systemNotes[si].map((n, i) => (
              <g key={i} fill="#2A2518" opacity="0.75">
                <ellipse cx={n.x} cy={yBase + n.y + 8} rx="3.2" ry="2.2" transform={`rotate(-15 ${n.x} ${yBase + n.y + 8})`} />
                <line x1={n.x + 3} y1={yBase + n.y + 8} x2={n.x + 3} y2={n.up ? yBase + n.y - 14 : yBase + n.y + 30} stroke="#2A2518" strokeWidth="0.8" />
                {n.dur === 2 && <line x1={n.x + 3} y1={n.up ? yBase + n.y - 14 : yBase + n.y + 30} x2={n.x + 9} y2={n.up ? yBase + n.y - 14 : yBase + n.y + 30} stroke="#2A2518" strokeWidth="1.5" />}
              </g>
            ))}

            {/* Pencil marking on one system */}
            {si === 1 && s % 2 === 0 && (
              <circle cx="140" cy={yBase + 12} r="6" fill="none" stroke="#B8541A" strokeWidth="0.6" opacity="0.35" />
            )}
          </g>
        );
      })}

      {/* Page number */}
      <text x="120" y="308" textAnchor="middle" fill="#5A5440" fontSize="4" opacity="0.4">— 1 —</text>

      {/* Subtle rotation effect via transform on outer group could be added, but keep clean */}
    </svg>
  );
}