import React from 'react';
import { Surface } from '@/components/patterns/Surface';
import { cn } from '@/lib/utils';

/**
 * @typedef {{
 *   title: string;
 *   value: React.ReactNode;
 *   unit?: string;
 *   subtitle?: string;
 *   icon?: React.ComponentType<{ className?: string }>;
 *   iconClassName?: string;
 *   className?: string;
 *   'data-qa'?: string;
 *   [key: string]: any;
 * }} PracticeStatCardProps
 */

/**
 * PracticeStatCard
 * Metric display card matching NumisCollection StatCard visual grammar and hover feedback.
 * Features soft warm elevation on hover (hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5),
 * cursor-default (non-link), and zero geometric transform.
 * Non-actionable metric card that owns its reference hover grammar directly rather than using Surface interactive.
 * @param {PracticeStatCardProps} props
 */
export default function PracticeStatCard({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  iconClassName = '',
  className = '',
  'data-qa': dataQa = 'practice-stat-card',
  ...props
}) {
  return (
    <Surface
      tone="panel"
      padding="md"
      className={cn(
        'flex items-start justify-between cursor-default select-none hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300',
        className
      )}
      data-qa={dataQa}
      {...props}
    >
      <div>
        <p className="type-stat-label text-ink-tertiary" data-qa="practice-stat-label">
          {title}
        </p>
        <p className="type-metric text-ink-primary mt-1.5" data-qa="practice-stat-metric">
          {value}
          {unit && (
            <>
              {' '}
              <span className="type-card-metadata text-ink-secondary font-normal">{unit}</span>
            </>
          )}
        </p>
        {subtitle && (
          <p className="type-card-metadata text-ink-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nav bg-brand-soft text-brand"
          data-qa="practice-stat-icon"
        >
          <Icon className={cn('icon-md text-brand', iconClassName)} />
        </div>
      )}
    </Surface>
  );
}
