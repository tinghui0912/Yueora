/**
 * Yueora brand mark.
 *
 * A Y whose two arms open like a phrase and whose descender lands on a note
 * head, crossed by a single staff line. One SVG source for every surface —
 * pages never draw their own copy.
 */
export function LogoMark({ className = 'h-7 w-7', strokeWidth = 2.6 }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* staff line — the music under the letter */}
      <line x1="3.5" y1="13" x2="36.5" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.34" />
      {/* the arms of the Y */}
      <path
        d="M10.6 6.4c1.9 6.1 5.2 10.4 9.4 13.6M29.4 6.4c-1.9 6.1-5.2 10.4-9.4 13.6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* descender, ending on a note head */}
      <path d="M20 20v8.2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <ellipse cx="20" cy="29.6" rx="4.1" ry="3" transform="rotate(-20 20 29.6)" fill="currentColor" />
    </svg>
  );
}

const SIZES = {
  sm: { mark: 'h-5 w-5', word: 'text-base', gap: 'gap-1.5' },
  md: { mark: 'h-7 w-7', word: 'text-xl', gap: 'gap-2' },
  lg: { mark: 'h-9 w-9', word: 'text-2xl', gap: 'gap-2.5' },
};

/**
 * variant: 'full' (mark + wordmark), 'compact' (smaller mark + wordmark), or
 * 'mark' (the symbol alone). size: sm | md | lg. tone: default | inverse —
 * inverse is for dark backgrounds.
 */
export default function Logo({ variant = 'full', size = 'md', tone = 'default', className = '', label }) {
  const s = SIZES[size] || SIZES.md;
  const color = tone === 'inverse' ? 'text-primary-foreground' : 'text-brand';
  const wordColor = tone === 'inverse' ? 'text-primary-foreground' : 'text-ink-primary';

  if (variant === 'mark') {
    return (
      <span className={`inline-flex ${color} ${className}`} role="img" aria-label={label || 'Yueora'}>
        <LogoMark className={s.mark} />
      </span>
    );
  }

  const compact = variant === 'compact';
  return (
    <span
      className={`inline-flex items-center ${compact ? 'gap-1.5' : s.gap} ${color} ${className}`}
      aria-label={label || 'Yueora'}
    >
      <LogoMark className={compact ? 'h-[1.15em] w-[1.15em]' : s.mark} strokeWidth={compact ? 3 : 2.6} />
      <span
        className={`font-display font-medium leading-none tracking-tight ${wordColor} ${compact ? 'text-[0.95em]' : s.word}`}
      >
        Yueora
      </span>
    </span>
  );
}