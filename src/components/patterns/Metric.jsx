import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Metric — label, value, optional context.
 * Used by Practice Summary, Practice Progress.
 * Not a dashboard KPI card — flat, editorial.
 */
export default function Metric({ label, value, context, className }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="type-caption text-ink-tertiary">{label}</span>
      <span className="type-metric mt-1 text-ink-primary">{value}</span>
      {context && <span className="mt-0.5 type-metadata text-ink-tertiary">{context}</span>}
    </div>
  );
}