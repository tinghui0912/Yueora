// Lightweight vector "first page" preview — staff lines, barlines, note heads.
// Deterministic per score id so each card feels like a real score.
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function ScorePreview({ id, className = '' }) {
  const seed = hash(id);
  const notes = Array.from({ length: 6 }).map((_, i) => {
    const v = hash(id + i);
    return {
      x: 38 + ((v % 7) * 18) + i * 4,
      y: 40 + (v % 5) * 8,
      up: v % 2 === 0,
    };
  });
  const lines = [40, 48, 56, 64, 72];
  return (
    <svg viewBox="0 0 200 110" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="200" height="110" fill="#FFFFFF" />
      {lines.map((y) => (
        <line key={y} x1="14" y1={y} x2="190" y2={y} stroke="#E2E0D9" strokeWidth="1" />
      ))}
      <line x1="14" y1="40" x2="14" y2="72" stroke="#1F2022" strokeWidth="1.5" />
      <line x1="190" y1="40" x2="190" y2="72" stroke="#1F2022" strokeWidth="1.5" />
      {notes.map((n, i) => (
        <g key={i} fill="#1F2022">
          <ellipse cx={n.x} cy={n.y} rx="4.2" ry="3" transform={`rotate(-18 ${n.x} ${n.y})`} />
          <line x1={n.x + 4} y1={n.y} x2={n.x + 4} y2={n.up ? n.y - 22 : n.y + 22} stroke="#1F2022" strokeWidth="1.2" />
        </g>
      ))}
      {seed % 3 === 0 && <circle cx="170" cy="30" r="3" fill="#C59B27" />}
    </svg>
  );
}