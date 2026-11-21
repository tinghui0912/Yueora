import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   className?: string;
 *   children?: React.ReactNode;
 * }} FilterTabsProps
 */

/**
 * FilterTabs — Canonical page-level category & filter tabs.
 * Owns resting, hover, and active states centrally.
 * Used by Library, Notifications, and collection pages.
 * @param {FilterTabsProps} props
 */
export function FilterTabs({ className = '', children, ...props }) {
  return (
    <div
      role="tablist"
      data-qa="filter-tabs"
      className={cn('flex flex-wrap items-center gap-1 select-none', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * @typedef {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   active?: boolean;
 *   className?: string;
 *   children?: React.ReactNode;
 *   icon?: React.ComponentType<{ className?: string }>;
 * }} FilterTabProps
 */

/** @type {React.ForwardRefExoticComponent<FilterTabProps & React.RefAttributes<HTMLButtonElement>>} */
export const FilterTab = React.forwardRef(function FilterTab(
  {
    active = false,
    className = '',
    children,
    icon: Icon,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={active}
      data-qa="filter-tab"
      data-active={active ? 'true' : 'false'}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-control px-3.5 py-1.5 type-body-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        active
          ? 'bg-brand-soft font-medium text-ink-primary shadow-none'
          : 'bg-transparent text-ink-tertiary hover:bg-brand-soft/70 hover:text-ink-primary',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="icon-xs shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
});

export default FilterTabs;
