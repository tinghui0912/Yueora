import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageHeader — Application Surface page title.
 * Used by Library, Imports, Notifications, Practice History, Practice Progress, Settings.
 * Not for Marketing pages.
 */
export default function PageHeader({ title, description, primaryAction, secondaryAction, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="type-page-title text-2xl text-ink-primary sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 type-body-small text-ink-secondary">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex shrink-0 items-center gap-2">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}