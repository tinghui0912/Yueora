import React from 'react';
import { cn } from '@/lib/utils';

const toneStyles = {
  neutral: { icon: 'text-ink-tertiary', title: 'text-ink-primary', desc: 'text-ink-secondary' },
  brand: { icon: 'text-brand', title: 'text-ink-primary', desc: 'text-ink-secondary' },
  success: { icon: 'text-success', title: 'text-ink-primary', desc: 'text-ink-secondary' },
  warning: { icon: 'text-warning', title: 'text-ink-primary', desc: 'text-ink-secondary' },
  danger: { icon: 'text-danger', title: 'text-ink-primary', desc: 'text-ink-secondary' },
};

/**
 * StateMessage — unified empty / error / access denied / expired / revoked / not found / processing.
 * One component replaces EmptyState, ErrorState, ExpiredState, RevokedState, etc.
 */
export default function StateMessage({
  tone = 'neutral',
  icon: Icon = undefined,
  title,
  description = undefined,
  primaryAction = null,
  secondaryAction = null,
  className = '',
}) {
  const s = toneStyles[tone] || toneStyles.neutral;
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      {Icon && (
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-container bg-surface-canvas/60', s.icon)}>
          <Icon className="icon-xl" aria-hidden="true" />
        </div>
      )}
      <h2 className={cn('type-section-title', s.title)}>{title}</h2>
      {description && <p className={cn('mt-2 max-w-sm type-body-small', s.desc)}>{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}