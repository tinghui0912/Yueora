import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BackLink — Reusable back navigation primitive.
 * Consistently owns arrow icon sizing, typography, quiet motion, and focus ring.
 */
export function BackLink({ to = undefined, onClick = undefined, label = 'Back', className = '', children = null, ...props }) {
  const content = (
    <>
      <ArrowLeft className="icon-sm transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
      <span>{children || label}</span>
    </>
  );
  const classes = cn(
    'group inline-flex items-center gap-1.5 type-label text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-control px-1 py-0.5 -mx-1',
    className
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} {...props}>
        {content}
      </button>
    );
  }
  return (
    <Link to={to || '/library'} className={classes} {...props}>
      {content}
    </Link>
  );
}

export default BackLink;
