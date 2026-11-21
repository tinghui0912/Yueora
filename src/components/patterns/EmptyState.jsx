import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @typedef {{
 *   icon?: React.ComponentType<{ className?: string }>;
 *   title?: string;
 *   description?: string;
 *   action?: React.ReactNode;
 *   className?: string;
 *   'data-qa'?: string;
 *   [key: string]: any;
 * }} EmptyStateProps
 */

/**
 * EmptyState
 * Calm, centered empty-state display matching NumisCollection visual grammar.
 * Features 96px soft brand circle, 48px brand icon, 20px Playfair title, and optional primary action.
 * @param {EmptyStateProps} props
 */
export default function EmptyState({
  icon: Icon,
  title = '',
  description = '',
  action = null,
  className = '',
  'data-qa': dataQa = 'empty-state',
  ...props
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-20 text-center', className)}
      data-qa={dataQa}
      {...props}
    >
      {Icon && (
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft/50"
          data-qa="empty-state-icon-surround"
        >
          <Icon className="h-12 w-12 text-brand/60" data-qa="empty-state-icon" />
        </div>
      )}
      {title && (
        <h3 className="mb-2 font-heading text-xl font-semibold text-ink-primary" data-qa="empty-state-title">
          {title}
        </h3>
      )}
      {description && (
        <p className="mb-6 max-w-md type-body text-ink-tertiary" data-qa="empty-state-description">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2" data-qa="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}
