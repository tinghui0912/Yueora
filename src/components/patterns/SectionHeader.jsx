import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SectionHeader — unified section title with optional description and action.
 * Used by Settings, Score Detail, Practice Progress, Sharing.
 */
export function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="type-section-title text-ink-primary">{title}</h2>
        {description && <p className="mt-0.5 type-body-small text-ink-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default SectionHeader;