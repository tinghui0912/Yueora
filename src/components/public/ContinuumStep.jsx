import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ContinuumStep — Interactive step item for the life continuum bar on the landing page.
 */
export function ContinuumStep({
  step,
  tag,
  title,
  summary,
  description = null,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-container p-5 transition-all duration-300',
        active
          ? 'bg-surface-panel border border-line-subtle'
          : 'border border-transparent hover:bg-neutral-hover'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="type-caption font-mono text-ink-primary">
          {step}
        </span>
        <span className="type-caption rounded-full bg-surface-canvas px-3 py-0.5 text-ink-tertiary border border-line-subtle/50">
          {tag}
        </span>
      </div>
      <h3 className="mt-2 type-subsection text-ink-primary">
        {title}
      </h3>
      <p className="mt-1 type-body-small text-ink-secondary">
        {summary}
      </p>
      {active && description && (
        <p className="mt-3 border-t border-line-subtle pt-2.5 type-body-small italic font-serif text-ink-secondary">
          {description}
        </p>
      )}
    </button>
  );
}

export default ContinuumStep;
