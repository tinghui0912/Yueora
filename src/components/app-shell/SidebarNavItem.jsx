import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function SidebarNavItem({
  to,
  icon: Icon,
  label,
  badge,
  end = false,
  className,
  onClick,
  ...props
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center justify-between rounded-control px-3 py-2 type-body-small font-medium transition-all duration-fast select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          isActive
            ? 'bg-brand/10 text-brand font-semibold shadow-xs'
            : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary',
          className
        )
      }
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="h-4 w-4 shrink-0 transition-transform duration-fast group-hover:scale-105" aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </div>
      {badge && <div>{badge}</div>}
    </NavLink>
  );
}

export default SidebarNavItem;
