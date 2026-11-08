import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function Field({
  id,
  htmlFor,
  label,
  description,
  error,
  required = false,
  className,
  children,
}) {
  const targetId = htmlFor || id;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor={targetId}
            className="type-label text-ink-primary font-medium flex items-center gap-1 cursor-pointer select-none"
          >
            {label}
            {required && <span className="text-danger" aria-hidden="true">*</span>}
          </Label>
        </div>
      )}

      {children}

      {description && !error && (
        <p className="type-metadata text-ink-secondary">{description}</p>
      )}

      {error && (
        <p className="type-metadata font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Field;
