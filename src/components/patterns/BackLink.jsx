import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BackLink — Reusable back navigation primitive.
 * Consistently owns arrow icon sizing, typography, quiet motion, and focus ring.
 */
export function BackLink({ to = '/library', label = 'Back', className = '', ...props }) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-1.5 type-label text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-control px-1 py-0.5 -mx-1',
        className
      )}
      {...props}
    >
      <ArrowLeft className="icon-sm transition-transform duration-150 group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </Link>
  );
}

export default BackLink;
