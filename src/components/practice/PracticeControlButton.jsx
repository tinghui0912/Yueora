import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PracticeControlButton — Domain control toggle button for PracticeSession.
 * Follows Numis control toggle grammar: border-brand bg-neutral-muted text-ink-primary with text-brand icon when active.
 *
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean, icon?: React.ElementType }} props
 */
export function PracticeControlButton({
  active = false,
  onClick,
  className = '',
  children,
  icon: Icon = null,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-control-md items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand border shadow-control',
        active
          ? 'border-brand bg-neutral-muted font-semibold text-ink-primary'
          : 'border-line-subtle bg-transparent text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary',
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn('icon-xs shrink-0', active ? 'text-brand' : 'text-current')} aria-hidden="true" />}
      {children}
    </button>
  );
}

export default PracticeControlButton;
