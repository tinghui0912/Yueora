import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @typedef {'toggle' | 'radio' | 'action'} ChoiceCardMode
 */

/**
 * @typedef {Object} ChoiceCardSemanticProps
 * @property {React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>} [icon]
 * @property {React.ReactNode} title
 * @property {React.ReactNode} [description]
 * @property {boolean} [selected]
 * @property {React.ReactNode} [badge]
 * @property {ChoiceCardMode} [mode]
 * @property {string} [role]
 * @property {string} [className]
 *
 * @typedef {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> & ChoiceCardSemanticProps} ChoiceCardProps
 */

/**
 * ChoiceCard — Interactive selection card for source choices, options, and modes.
 * Owns border, selected highlight, icon sizing, typography, hover, and focus ring.
 *
 * @param {ChoiceCardProps} props
 */
export function ChoiceCard({
  icon: Icon = undefined,
  title,
  description = undefined,
  selected = false,
  onClick = undefined,
  badge = null,
  disabled = false,
  mode = 'toggle',
  role = undefined,
  className = '',
  ...props
}) {
  const resolvedRole = role || (mode === 'radio' ? 'radio' : undefined);
  const isRadio = resolvedRole === 'radio' || mode === 'radio';
  const isAction = mode === 'action';

  // Semantics:
  // action: normal button, no aria-pressed, no aria-checked
  // toggle: aria-pressed={selected}, no aria-checked
  // radio: role="radio", aria-checked={selected}, no aria-pressed
  const ariaChecked = isRadio ? selected : undefined;
  const ariaPressed = !isRadio && !isAction ? selected : undefined;

  return (
    <button
      type="button"
      role={resolvedRole}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-2.5 rounded-container border p-5 text-left transition-[color,background-color,border-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 select-none',
        selected
          ? 'border-brand bg-brand-soft text-ink-primary shadow-xs ring-1 ring-brand/30'
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
                : 'border border-line-subtle bg-surface-canvas text-brand group-hover:bg-brand-soft'
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
