/**
 * Bespoke Yueora Musical Glyphs.
 * Subtle, precise, and resonant — crafted to give Yueora its own product grammar
 * rather than relying exclusively on generic software icon libraries.
 */

export function RepertoireGlyph({ className = "h-4 w-4", ...props }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Back sheet */}
      <path d="M6 3.5h7.5a1.5 1.5 0 0 1 1.5 1.5v10" strokeOpacity="0.45" />
      {/* Front music folio */}
      <rect x="3.5" y="5.5" width="10.5" height="11.5" rx="1.5" />
      {/* Staff hint lines */}
      <line x1="6" y1="9" x2="11.5" y2="9" />
      <line x1="6" y1="11.5" x2="11.5" y2="11.5" />
      <line x1="6" y1="14" x2="9.5" y2="14" />
    </svg>
  );
}

export function PracticeGlyph({ className = "h-4 w-4", ...props }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Gentle metronome frame / poise */}
      <path d="M6 16.5l3.2-11.5a1 1 0 0 1 1.6 0l3.2 11.5" />
      <path d="M4.5 16.5h11" />
      {/* Oscillating pendulum wand with weighted bob */}
      <line x1="10" y1="13.5" x2="13.5" y2="7.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12.5" cy="9.2" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MemoryGlyph({ className = "h-4 w-4", ...props }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Preserved musical take / vinyl disc & resonant sound arc */}
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3" strokeOpacity="0.6" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
      {/* Gentle needle / moment groove */}
      <path d="M14.5 5.5l-2.2 2.2" strokeOpacity="0.75" />
    </svg>
  );
}

export function ScoreSheetGlyph({ className = "h-4 w-4", ...props }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4.5 3.5A1.5 1.5 0 0 1 6 2h6l4.5 4.5v10a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4.5 16.5v-13z" />
      <path d="M12 2v4.5h4.5" />
      {/* Music note on page */}
      <circle cx="8.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <path d="M10 13V8.5a2 2 0 0 1 2-1" />
    </svg>
  );
}

export function PhraseGlyph({ className = "h-4 w-4", ...props }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Musical legato phrasing slur */}
      <path d="M3 11c3.5-5 10.5-5 14 0" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="5" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
