const STAVES = [
  { top: 70, label: 'Treble' },
  { top: 200, label: 'Bass' },
];
const STAFF_LEFT = 40;
const MEASURE_W = 168;
const MEASURES = 4;
const LINE_GAP = 9;
const NOTE_R = 4.6;

// Standard notation: whole & half = hollow, quarter & eighth = filled
const durationFill = { '1': false, '2': false, '4': true, '8': true };

const accidentalSymbols = { sharp: '♯', flat: '♭', natural: '♮' };

const NOTE_LETTERS = [
  ['E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'],
];

export default function ScoreCanvas({
  notes = [],
  selectedIds = null,
  onSelect = undefined,
  onAddNote = undefined,
  onDelete = undefined,
  tool = 'select',
  zoom = 1,
  activeMeasure = null,
  activeIssueMeasure = null,
  measureStart: measureStartProp = undefined,
  activeMeasureVariant = 'default',
  selectedMeasures = undefined,
  showNoteNames = false,
}) {
  // Visible window: explicit measureStart wins; otherwise follow the focus measure
  const focusMeasure = activeIssueMeasure ?? activeMeasure;
  const measureStart = measureStartProp ?? (focusMeasure ? Math.max(1, Math.floor((focusMeasure - 1) / 4) * 4 + 1) : 1);

  // Highlight tone: practice/editor share the canvas, so tone is explicit
  const activeFill =
    activeMeasureVariant === 'practice' ? 'hsl(var(--practice-current) / 0.18)'
      : 'hsl(var(--primary) / 0.08)';

  const width = STAFF_LEFT + MEASURES * MEASURE_W + 20;
  const height = STAVES[STAVES.length - 1].top + 70;
  const z = zoom || 1;
  const selSet = selectedIds instanceof Set ? selectedIds : (selectedIds != null ? new Set([selectedIds]) : null);

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
      onAddNote({ staff, measure, x, step, duration: '4', type: 'note' });
    } else if (tool === 'rest' && onAddNote) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const ox = (e.clientX - rect.left) * width / rect.width;
      const oy = (e.clientY - rect.top) * height / rect.height;
      const staff = oy < (STAVES[0].top + STAVES[1].top) / 2 ? 0 : 1;
      let measure = Math.floor((ox - STAFF_LEFT) / MEASURE_W);
      measure = Math.max(0, Math.min(MEASURES - 1, measure));
      let x = Math.round(ox - STAFF_LEFT - measure * MEASURE_W);
      x = Math.max(10, Math.min(MEASURE_W - 16, x));
      onAddNote({ staff, measure, x, step: 4, duration: '4', type: 'rest' });
    } else {
      onSelect?.(null, e.shiftKey);
    }
  };

  return (
    <div className="flex justify-center">
      <div style={{ transform: `scale(${z})`, transformOrigin: 'top center' }}>
        <svg width={width} height={height} onClick={handleBackgroundClick} className="select-none">
          {STAVES.map((st, si) => (
            <g key={si}>
              {/* Selected section (practice range) — restrained, sits under the playhead */}
              {selectedMeasures && Array.from({ length: MEASURES }).map((_, mi) => {
                const measureNum = measureStart + mi;
                if (measureNum < selectedMeasures.from || measureNum > selectedMeasures.to) return null;
                return (
                  <rect
                    key={`sel-${si}-${mi}`}
                    x={STAFF_LEFT + mi * MEASURE_W}
                    y={st.top - 4}
                    width={MEASURE_W}
                    height={4 * LINE_GAP + 8}
                    fill="hsl(var(--selection) / 0.8)"
                    rx={2}
                  />
                );
              })}
              {/* Active measure highlight */}
              {activeMeasure != null && Array.from({ length: MEASURES }).map((_, mi) => {
                const measureNum = measureStart + mi;
                if (measureNum !== activeMeasure) return null;
                return (
                  <rect
                    key={`hl-${si}-${mi}`}
                    x={STAFF_LEFT + mi * MEASURE_W}
                    y={st.top - 4}
                    width={MEASURE_W}
                    height={4 * LINE_GAP + 8}
                    fill={activeFill}
                    rx={2}
                  />
                );
              })}
              {/* Issue measure highlight */}
              {activeIssueMeasure != null && Array.from({ length: MEASURES }).map((_, mi) => {
                const measureNum = measureStart + mi;
                if (measureNum !== activeIssueMeasure) return null;
                return (
                  <rect
                    key={`iss-${si}-${mi}`}
                    x={STAFF_LEFT + mi * MEASURE_W}
                    y={st.top - 4}
                    width={MEASURE_W}
                    height={4 * LINE_GAP + 8}
                    fill="hsl(var(--numis-accent))"
                    stroke="hsl(var(--numis-primary) / 0.4)"
                    strokeWidth={1}
                    rx={2}
                  />
                );
              })}
              {Array.from({ length: 5 }).map((_, li) => (
                <line key={li} x1={STAFF_LEFT} x2={STAFF_LEFT + MEASURES * MEASURE_W} y1={st.top + li * LINE_GAP} y2={st.top + li * LINE_GAP} stroke="hsl(var(--border))" strokeWidth={1} />
              ))}
              {Array.from({ length: MEASURES + 1 }).map((_, mi) => (
                <line key={mi} x1={STAFF_LEFT + mi * MEASURE_W} x2={STAFF_LEFT + mi * MEASURE_W} y1={st.top} y2={st.top + 4 * LINE_GAP} stroke="hsl(var(--foreground))" strokeWidth={mi === 0 || mi === MEASURES ? 1.5 : 0.75} />
              ))}
              {/* Measure number labels */}
              {Array.from({ length: MEASURES }).map((_, mi) => {
                const measureNum = measureStart + mi;
                if (mi === 0 || measureNum % 4 === 1) {
                  return <text key={`mn-${si}-${mi}`} x={STAFF_LEFT + mi * MEASURE_W + 2} y={st.top - 6} fontSize="9" fill="hsl(var(--muted-foreground))">{measureNum}</text>;
                }
                return null;
              })}
              <text x={STAFF_LEFT - 26} y={st.top + 30} fontSize="20" fill="hsl(var(--muted-foreground))">{si === 0 ? '𝄞' : '𝄢'}</text>
            </g>
          ))}

          {/* Ties and slurs between notes */}
          {notes.filter((n) => n.type !== 'rest').map((n) => {
            if (n.tieTo) {
              const target = notes.find((t) => t.id === n.tieTo);
              if (!target) return null;
              const x1 = STAFF_LEFT + n.measure * MEASURE_W + n.x;
              const y1 = noteY(n.staff, n.step);
              const x2 = STAFF_LEFT + target.measure * MEASURE_W + target.x;
              const y2 = noteY(target.staff, target.step);
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 12;
              return <path key={`tie-${n.id}`} d={`M ${x1} ${y1 - 4} Q ${midX} ${midY} ${x2} ${y2 - 4}`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.2} />;
            }
            return null;
          })}
          {notes.filter((n) => n.type !== 'rest').map((n) => {
            if (n.slurTo) {
              const target = notes.find((t) => t.id === n.slurTo);
              if (!target) return null;
              const x1 = STAFF_LEFT + n.measure * MEASURE_W + n.x;
              const y1 = noteY(n.staff, n.step);
              const x2 = STAFF_LEFT + target.measure * MEASURE_W + target.x;
              const y2 = noteY(target.staff, target.step);
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 18;
              return <path key={`slur-${n.id}`} d={`M ${x1} ${y1 - 6} Q ${midX} ${midY} ${x2} ${y2 - 6}`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} />;
            }
            return null;
          })}

          {notes.map((n) => {
            const x = STAFF_LEFT + n.measure * MEASURE_W + n.x;
            const y = noteY(n.staff, n.step);
            const isSel = selSet ? selSet.has(n.id) : false;
            const isRest = n.type === 'rest';
            const stemUp = n.step >= 4;
            const isWhole = n.duration === '1';
            const fill = isRest ? 'none' : durationFill[n.duration] ? 'hsl(var(--foreground))' : 'hsl(var(--card))';
            return (
              <g
                key={n.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool === 'delete' && onDelete) onDelete(n.id);
                  else onSelect?.(n.id, e.shiftKey);
                }}
                style={{ cursor: tool === 'delete' ? 'not-allowed' : 'pointer' }}
              >
                {isSel && (
                  <rect x={x - 9} y={y - 14} width={18} height={28} rx={3} fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth={1} />
                )}
                {/* Accidental symbol */}
                {n.accidental && !isRest && (
                  <text x={x - 12} y={y + 4} fontSize="14" fill="hsl(var(--foreground))">{accidentalSymbols[n.accidental] || ''}</text>
                )}
                {isRest ? (
                  <text x={x - 5} y={y + 5} fontSize="16" fill="hsl(var(--foreground))">𝄽</text>
                ) : (
                  <>
                    <ellipse cx={x} cy={y} rx={NOTE_R + 0.5} ry={NOTE_R} fill={fill} stroke="hsl(var(--foreground))" strokeWidth={1.2} transform={`rotate(-18 ${x} ${y})`} />
                    {/* Stem only for half, quarter, eighth — not whole */}
                    {!isWhole && (
                      <line x1={x + (stemUp ? NOTE_R : -NOTE_R)} x2={x + (stemUp ? NOTE_R : -NOTE_R)} y1={y} y2={y + (stemUp ? -26 : 26)} stroke="hsl(var(--foreground))" strokeWidth={1.2} />
                    )}
                    {n.duration === '8' && !isWhole && (
                      <path d={`M ${x + (stemUp ? NOTE_R : -NOTE_R)} ${y + (stemUp ? -26 : 26)} q 10 4 6 14`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.2} />
                    )}
                    {n.dotted && (
                      <circle cx={x + (stemUp ? -8 : 8)} cy={y} r={1.5} fill="hsl(var(--foreground))" />
                    )}
                    {/* Fingering */}
                    {n.finger && n.finger !== '—' && (
                      <text x={x - 3} y={y + (stemUp ? 16 : -10)} fontSize="9" fill="hsl(var(--muted-foreground))">{n.finger}</text>
                    )}
                    {showNoteNames && (
                      <text x={x - 3} y={y - 12} fontSize="8" fill="hsl(var(--muted-foreground))">
                        {(NOTE_LETTERS[n.staff] || NOTE_LETTERS[0])[n.step] || ''}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}