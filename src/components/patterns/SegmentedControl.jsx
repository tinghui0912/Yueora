import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

const SegmentedControlContext = createContext(null);

/**
 * @typedef {{
 *   value?: string;
 *   onValueChange?: (value: string) => void;
 *   children?: React.ReactNode;
 *   className?: string;
 *   'aria-label'?: string;
 *   [key: string]: any;
 * }} SegmentedControlProps
 */

/**
 * SegmentedControl
 * Compact, tactile view/mode switch matching NumisCollection application visual grammar.
 * ~44px height container, 12px overlay radius, 12px overlay item radius, standard shadow active card surface.
 * Implements pressed button group semantics (role="group" + aria-pressed).
 * @param {SegmentedControlProps} props
 */
export function SegmentedControl({
  value,
  onValueChange,
  children,
  className = '',
  'aria-label': ariaLabel = '',
  ...props
}) {
  return (
    <SegmentedControlContext.Provider value={{ value, onValueChange }}>
      <div
        role="group"
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-1 rounded-overlay bg-neutral-muted/50 p-1 w-fit select-none',
          className
        )}
        data-qa="segmented-control"
        {...props}
      >
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}

/**
 * @typedef {{
 *   value: string;
 *   children?: React.ReactNode;
 *   className?: string;
 *   onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
 *   disabled?: boolean;
 *   [key: string]: any;
 * }} SegmentedControlItemProps
 */

/**
 * @param {SegmentedControlItemProps} props
 */
export function SegmentedControlItem({
  value,
  children,
  className = '',
  onClick = undefined,
  disabled = false,
  ...props
}) {
  const context = useContext(SegmentedControlContext);
  const isSelected = context ? context.value === value : false;

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    context?.onValueChange?.(value);
  };

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={handleClick}
      data-state={isSelected ? 'active' : 'inactive'}
      data-qa="segmented-control-item"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-overlay px-4 py-2 type-label font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-surface-panel text-ink-primary shadow'
          : 'text-ink-tertiary hover:text-ink-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default SegmentedControl;
