import React from 'react';
import { cn } from '@/lib/utils';

/**
 * RepertoireGrid — Semantic responsive grid for music score collections.
 * 4-column desktop layout (1440px) matching NumisCollection collection page density.
 */
export function RepertoireGrid({ className = '', children = null, ...props }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default RepertoireGrid;
