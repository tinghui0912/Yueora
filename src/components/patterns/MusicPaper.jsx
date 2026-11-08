import { forwardRef } from 'react';

/**
 * MusicPaper: Archival tactile paper surface primitive.
 * Reflects physical sheet music rather than flat digital SaaS cards.
 */
/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   children?: React.ReactNode;
 *   className?: string;
 *   interactive?: boolean;
 *   tone?: 'natural' | 'warm' | 'white';
 *   elevation?: 'flat' | 'paper' | 'raised';
 *   bordered?: boolean;
 *   as?: any;
 * }} MusicPaperProps
 */

/** @type {React.ForwardRefExoticComponent<MusicPaperProps & React.RefAttributes<any>>} */
const MusicPaper = forwardRef(function MusicPaper(
  {
    children = null,
    className = '',
    interactive = false,
    tone = 'natural', // 'natural' | 'warm' | 'white'
    elevation = 'paper', // 'flat' | 'paper' | 'raised'
    bordered = true,
    as: Component = 'div',
    ...props
  },
  ref
) {
  const toneClasses = {
    natural: 'bg-surface-paper text-ink-primary',
    warm: 'bg-surface-paper-warm text-ink-primary',
    white: 'bg-surface-panel text-ink-primary',
  }[tone] || 'bg-surface-paper text-ink-primary';

  const elevationClasses = {
    flat: '',
    paper: interactive ? 'shadow-paper hover:shadow-paper-hover' : 'shadow-paper',
    raised: 'shadow-raised',
  }[elevation];

  const borderClass = bordered ? 'border border-surface-paper-edge' : '';
  const interactiveClass = interactive
    ? 'transition-[transform,box-shadow,border-color] duration-fast ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
    : '';

  return (
    <Component
      ref={ref}
      className={`relative rounded-container ${toneClasses} ${borderClass} ${elevationClasses} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

export default MusicPaper;
