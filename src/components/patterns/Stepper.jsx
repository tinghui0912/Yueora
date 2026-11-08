import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stepper — Reusable progress stepper for multi-step flows.
 * Owns step badge, connector, active typography, and accessibility semantics.
 */
export function Stepper({ steps = [], current = 1, onStepClick, className }) {
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
            <React.Fragment key={label || i}>
              <li
                className={cn(
                  'flex items-center gap-2',
                  isClickable && 'cursor-pointer hover:opacity-85'
                )}
                onClick={() => isClickable && onStepClick(stepNum)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Number / Check Badge */}
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-base',
                    isCompleted && 'bg-brand text-white shadow-xs',
                    isCurrent && 'border-2 border-brand bg-brand/10 text-brand font-bold',
                    isUpcoming && 'border border-line-subtle bg-surface-canvas/80 text-ink-tertiary'
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
                    isUpcoming && 'text-ink-secondary/60'
                  )}
                >
                  {label}
                </span>
              </li>

              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 min-w-[1rem] max-w-[2.5rem] transition-colors duration-base',
                    stepNum < current ? 'bg-brand/60' : 'bg-line-subtle'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
