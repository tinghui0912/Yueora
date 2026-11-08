import React from 'react';
import { cn } from '@/lib/utils';

export function SidebarSectionLabel({ children, className }) {
  return (
    <p className={cn('type-caption text-ink-secondary/70 px-3 tracking-wider font-semibold uppercase select-none', className)}>
      {children}
    </p>
  );
}

export default SidebarSectionLabel;
