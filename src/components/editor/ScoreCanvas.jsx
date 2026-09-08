const STAVES = [
  { top: 70, label: 'Treble' },
  { top: 200, label: 'Bass' },
];
const STAFF_LEFT = 40;
const MEASURE_W = 168;
const MEASURES = 4;
const LINE_GAP = 9;
const NOTE_R = 4.6;

const durationFill = { '1': true, '2': true, '4': false, '8': false };

export default function ScoreCanvas({ notes, selectedId, onSelect, onAddNote, onDelete, tool, zoom }) {
  const width = STAFF_LEFT + MEASURES * MEASURE_W + 20;
  const height = STAVES[STAVES.length - 1].top + 70;
  const z = zoom || 1;

  const noteY = (staff, step) => STAVES[staff].top + (8 - step) * (LINE_GAP / 2) + LINE_GAP * 2;

  const handleBackgroundClick = (e) => {
    if (tool === 'note' && onAddNote) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const ox = (e.clientX - rect.left) * width / rect.width;
      const oy = (e.clientY - rect.top) * height / rect.height;
      const staff = oy < (STAVES[0].top + STAVES[1].top) / 2 ? 0 : 1;
      let measure = Math.floor((ox - STAFF_LEFT) / MEASURE_W);
      measure = Math.max(0, Math.min(MEASURES - 1, measure));
      let x = Math.round(ox - STAFF_LEFT - measure * MEASURE_W);
      x = Math.max(10, Math.min(MEASURE_W - 16, x));
      let step = Math.round(8 - (oy - STAVES[staff].top - LINE_GAP * 2) / (LINE_GAP / 2));
      step = Math.max(0, Math.min(8, step));
      onAddNote({ staff, measure, x, step, duration: '4' });
    } else {
      onSelect?.(null);
    }
  };

  return (
    <div className="flex justify-center">
      <div style={{ transform: `scale(${z})`, transformOrigin: 'top center' }}>
        <svg width={width} height={height} onClick={handleBackgroundClick} className="select-none">
          {STAVES.map((st, si) => (
            <g key={si}>
              {Array.from({ length: 5 }).map((_, li) => (
                <line key={li} x1={STAFF_LEFT} x2={STAFF_LEFT + MEASURES * MEASURE_W} y1={st.top + li * LINE_GAP} y2={st.top + li * LINE_GAP} stroke="hsl(var(--border))" strokeWidth={1} />
              ))}
              {Array.from({ length: MEASURES + 1 }).map((_, mi) => (
                <line key={mi} x1={STAFF_LEFT + mi * MEASURE_W} x2={STAFF_LEFT + mi * MEASURE_W} y1={st.top} y2={st.top + 4 * LINE_GAP} stroke="hsl(var(--foreground))" strokeWidth={mi === 0 || mi === MEASURES ? 1.5 : 0.75} />
              ))}
              <text x={STAFF_LEFT - 26} y={st.top + 30} fontSize="20" fill="hsl(var(--muted-foreground))">{si === 0 ? '𝄞' : '𝄢'}</text>
            </g>
          ))}

          {notes.map((n) => {
            const x = STAFF_LEFT + n.measure * MEASURE_W + n.x;
            const y = noteY(n.staff, n.step);
            const isSel = n.id === selectedId;
            const stemUp = n.step >= 4;
            const fill = durationFill[n.duration] ? 'hsl(var(--foreground))' : 'hsl(var(--card))';
            return (
              <g
                key={n.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool === 'delete' && onDelete) onDelete(n.id);
                  else onSelect?.(n.id);
                }}
                style={{ cursor: tool === 'delete' ? 'not-allowed' : 'pointer' }}
              >
                {isSel && (
                  <rect x={x - 9} y={y - 14} width={18} height={28} rx={3} fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth={1} />
                )}
                <ellipse cx={x} cy={y} rx={NOTE_R + 0.5} ry={NOTE_R} fill={fill} stroke="hsl(var(--foreground))" strokeWidth={1.2} transform={`rotate(-18 ${x} ${y})`} />
                <line x1={x + (stemUp ? NOTE_R : -NOTE_R)} x2={x + (stemUp ? NOTE_R : -NOTE_R)} y1={y} y2={y + (stemUp ? -26 : 26)} stroke="hsl(var(--foreground))" strokeWidth={1.2} />
                {n.duration === '8' && (
                  <path d={`M ${x + (stemUp ? NOTE_R : -NOTE_R)} ${y + (stemUp ? -26 : 26)} q 10 4 6 14`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.2} />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}