import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stepper — Reusable progress stepper for multi-step flows.
 * Owns step badge, connector, active typography, and accessibility semantics.
 */
export function Stepper({ steps = [], current = 1, onStepClick = undefined, className = '' }) {
  return (
    <nav aria-label="Step progress" className={cn('w-full select-none', className)}>
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const label = typeof step === 'string' ? step : step.label;
          const isCompleted = stepNum < current;
          const isCurrent = stepNum === current;
          const isUpcoming = stepNum > current;
          const isClickable = Boolean(onStepClick && isCompleted);

          return (
            <li
              key={label || i}
              className={cn(
                'flex items-center gap-2 sm:gap-3',
                i < steps.length - 1 && 'flex-1'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(stepNum)}
                  className="group flex shrink-0 items-center gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas text-left cursor-pointer transition-opacity hover:opacity-85"
                  aria-label={`Go back to step ${stepNum}: ${label}`}
                >
                  {/* Number / Check Badge */}
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-base',
                      isCompleted && 'bg-brand text-brand-foreground',
                      isCurrent && 'border-2 border-brand bg-surface-panel text-brand font-bold',
                      isUpcoming && 'border border-line-subtle bg-surface-canvas text-ink-tertiary'
                    )}
                  >
                    {isCompleted ? <Check className="icon-xs stroke-[2.5]" aria-hidden="true" /> : stepNum}
                  </span>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'type-label whitespace-nowrap transition-colors duration-base',
                      isCurrent && 'font-semibold text-ink-primary',
                      isCompleted && 'font-medium text-ink-secondary',
                      isUpcoming && 'text-ink-tertiary'
                    )}
                  >
                    {label}
                  </span>
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  {/* Number / Check Badge */}
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-base',
                      isCompleted && 'bg-brand text-brand-foreground',
                      isCurrent && 'border-2 border-brand bg-surface-panel text-brand font-bold',
                      isUpcoming && 'border border-line-subtle bg-surface-canvas text-ink-tertiary'
                    )}
                  >
                    {isCompleted ? <Check className="icon-xs stroke-[2.5]" aria-hidden="true" /> : stepNum}
                  </span>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'type-label whitespace-nowrap transition-colors duration-base',
                      isCurrent && 'font-semibold text-ink-primary',
                      isCompleted && 'font-medium text-ink-secondary',
                      isUpcoming && 'text-ink-tertiary'
                    )}
                  >
                    {label}
                  </span>
                </div>
              )}

              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 min-w-[1rem] max-w-[2.5rem] transition-colors duration-base',
                    stepNum < current ? 'bg-brand' : 'bg-line-subtle'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
