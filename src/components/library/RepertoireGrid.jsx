import React from 'react';
import { cn } from '@/lib/utils';

/**
 * RepertoireGrid — Semantic responsive grid for music score collections.
 * Accounts for 220px desktop sidebar + 200px subrail to prevent score cards
 * from becoming narrow or distorted across 768px, 1024px, 1280px, and 1440px viewports.
 */
export function RepertoireGrid({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default RepertoireGrid;
