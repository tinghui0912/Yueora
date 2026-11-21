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
 * Composes a single accessible Link with brand/10 -> brand/5 gradient, brand/10 border,
 * 32px direct brand icon (no icon box), 16px Playfair title, 14px description,
 * and ArrowRight translating right on hover.
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
        'group flex items-center justify-between rounded-container p-6 border border-brand/10 bg-gradient-to-br from-brand/10 to-brand/5 hover:border-brand/30 transition-all select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
        className
      )}
      data-qa={dataQa}
      {...props}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <Icon className="h-8 w-8 shrink-0 text-brand" data-qa="practice-quick-link-icon" />
        )}
        <div className="min-w-0">
          <p
            className="truncate font-heading text-base font-semibold text-ink-primary"
            data-qa="practice-quick-link-title"
          >
            {title}
          </p>
          <p
            className="truncate text-sm text-ink-tertiary font-body mt-0.5"
            data-qa="practice-quick-link-description"
          >
            {description}
          </p>
        </div>
      </div>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-brand group-hover:translate-x-1 transition-transform"
        data-qa="practice-quick-link-arrow"
      />
    </Link>
  );
}
