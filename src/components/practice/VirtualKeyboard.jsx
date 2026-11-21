const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];

/**
 * A visual guide only — never a connected device.
 */
export default function VirtualKeyboard({ current, showNames }) {
  return (
    <div className="mt-4">
      <div className="relative flex overflow-hidden rounded-control border border-line-subtle bg-surface-panel" aria-hidden="true">
        {WHITE_KEYS.map((k, i) => (
          <div
            key={`w-${i}`}
            className={`relative flex h-16 flex-1 items-end justify-center border-r border-line-subtle pb-1 last:border-r-0 ${k === current ? 'bg-practice-current/20' : ''}`}
          >
            {(showNames || k === current) && (
              <span className={`text-xs ${k === current ? 'font-semibold text-practice-current' : 'text-ink-secondary/70'}`}>{k}</span>
            )}
          </div>
        ))}
        {BLACK_AFTER.map((i) => (
          <div
            key={`b-${i}`}
            className="absolute top-0 h-10 w-[4.2%] rounded-b-sm bg-ink-primary"
            style={{ left: `${((i + 1) / WHITE_KEYS.length) * 100}%`, transform: 'translateX(-50%)' }}
          />
        ))}
      </div>
      <p className="mt-1 type-metadata text-ink-tertiary">Visual guide · not a connected keyboard</p>
    </div>
  );
}