import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function SidebarNavItem({
  to,
  icon: Icon,
  label,
  badge = null,
  end = false,
  className = '',
  onClick = undefined,
  ...props
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center justify-between rounded-nav px-4 py-3 type-body-small font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          isActive
            ? 'bg-nav-active font-medium text-brand'
            : 'text-ink-tertiary hover:text-ink-primary',
          className
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-brand' : 'text-ink-tertiary group-hover:text-ink-primary'
                )}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{label}</span>
          </div>
          {badge && <div>{badge}</div>}
        </>
      )}
    </NavLink>
  );
}

export default SidebarNavItem;
