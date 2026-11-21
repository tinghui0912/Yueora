import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @typedef {{
 *   to: string;
 *   icon?: React.ComponentType<{ className?: string }>;
 *   title: string;
 *   description?: string;
 *   className?: string;
 *   'data-qa'?: string;
 *   [key: string]: any;
 * }} PracticeQuickLinkProps
 */

/**
 * PracticeQuickLink
 * Calm 2-column dashboard quick link matching NumisCollection Dashboard quick links.
 * Composes a single accessible Link with soft brand gradient, icon surround, and arrow translating on hover.
 * @param {PracticeQuickLinkProps} props
 */
export default function PracticeQuickLink({
  to,
  icon: Icon,
  title,
  description = '',
  className = '',
  'data-qa': dataQa = 'practice-quick-link',
  ...props
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center justify-between rounded-container border border-line-subtle/50 bg-gradient-to-br from-brand-soft/20 to-surface-panel p-6 hover:border-brand/30 transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
        className
      )}
      data-qa={dataQa}
      {...props}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-soft/50 text-brand">
            <Icon className="h-6 w-6 text-brand" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold text-ink-primary group-hover:text-brand transition-colors">
            {title}
          </p>
          <p className="truncate type-body-small text-ink-tertiary mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-brand group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
