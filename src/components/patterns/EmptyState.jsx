import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * @typedef {{
 *   icon?: React.ComponentType<{ className?: string }>;
 *   title?: string;
 *   description?: string;
 *   action?: React.ReactNode;
 *   onAdd?: () => void;
 *   className?: string;
 *   'data-qa'?: string;
 *   [key: string]: any;
 * }} EmptyStateProps
 */

/**
 * EmptyState
 * Calm, centered empty-state display directly bound to NumisCollection EmptyState specimen.
 * Features 96px soft brand circle, 48px brand icon, 20px Playfair title, and optional action.
 * Entrance motion: initial opacity 0, scale 0.95 -> animate opacity 1, scale 1 (honors prefers-reduced-motion).
 * @param {EmptyStateProps} props
 */
export default function EmptyState({
  icon: Icon,
  title = '',
  description = '',
  action = null,
  onAdd = undefined,
  className = '',
  'data-qa': dataQa = 'empty-state',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.25 },
      };

  return (
    <motion.div
      {...motionProps}
      className={cn('flex flex-col items-center justify-center py-20 text-center', className)}
      data-qa={dataQa}
      {...props}
    >
      {Icon && (
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand/5"
          data-qa="empty-state-icon-surround"
        >
          <Icon className="h-12 w-12 text-brand/40" data-qa="empty-state-icon" />
        </div>
      )}
      {title && (
        <h3 className="mb-2 font-heading text-xl font-semibold text-ink-primary" data-qa="empty-state-title">
          {title}
        </h3>
      )}
      {description && (
        <p
          className={cn('max-w-md type-body text-ink-tertiary', (action || onAdd) ? 'mb-6' : '')}
          data-qa="empty-state-description"
        >
          {description}
        </p>
      )}
      {(action || onAdd) && (
        <div data-qa="empty-state-action">
          {action}
        </div>
      )}
    </motion.div>
  );
}
