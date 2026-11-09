import { forwardRef } from 'react';

/**
 * MusicPaper: Archival tactile paper surface primitive.
 * Strictly reserved ONLY for literal sheet music scores, musical notation, and score canvas rendering.
 * Generic application cards, lists, recommendations, stats, and empty states MUST use standard surface-panel.
 */
/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   children?: React.ReactNode;
 *   className?: string;
 *   interactive?: boolean;
 *   elevation?: 'flat' | 'paper' | 'raised';
 *   bordered?: boolean;
 *   as?: React.ElementType;
 * }} MusicPaperProps
 */

/** @type {React.ForwardRefExoticComponent<MusicPaperProps & React.RefAttributes<HTMLDivElement>>} */
const MusicPaper = forwardRef(function MusicPaper(
  {
    children = null,
    className = '',
    interactive = false,
    elevation = 'paper', // 'flat' | 'paper' | 'raised'
    bordered = true,
    as: Component = 'div',
    ...props
  },
  ref
) {
  const elevationClasses = {
    flat: '',
    paper: interactive ? 'shadow-paper hover:shadow-paper-hover' : 'shadow-paper',
    raised: 'shadow-raised',
  }[elevation] || '';

  const borderClass = bordered ? 'border border-surface-paper-edge' : '';
  const interactiveClass = interactive
    ? 'transition-[transform,box-shadow,border-color] duration-fast ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
    : '';

  return (
    <Component
      ref={ref}
      className={`relative rounded-container bg-surface-paper text-ink-primary ${borderClass} ${elevationClasses} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

export default MusicPaper;
