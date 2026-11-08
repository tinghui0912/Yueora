import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ChoiceCard — Interactive selection card for source choices, options, and modes.
 * Owns border, selected highlight, icon sizing, typography, hover, and focus ring.
 */
export function ChoiceCard({
  icon: Icon,
  title,
  description,
  selected = false,
  onClick,
  badge,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-2.5 rounded-container border p-5 text-left transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 select-none',
        selected
          ? 'border-brand bg-brand/5 shadow-xs ring-1 ring-brand/20'
          : 'border-surface-paper-edge bg-surface-panel hover:bg-surface-paper/70 hover:border-line-strong/80 hover:shadow-xs',
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between gap-2">
        {Icon && (
          <div
            className={cn(
              'flex h-control-md w-control-md shrink-0 items-center justify-center rounded-control transition-colors duration-base',
              selected
                ? 'bg-brand text-white shadow-xs'
                : 'border border-line-subtle bg-surface-canvas text-brand group-hover:bg-brand/10'
            )}
          >
            <Icon className="icon-md" aria-hidden="true" />
          </div>
        )}

        {badge && <div>{badge}</div>}
      </div>

      <div className="min-w-0">
        <h3 className="type-subsection text-ink-primary font-medium">{title}</h3>
        {description && (
          <p className="mt-1 type-body-small text-ink-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

export default ChoiceCard;
