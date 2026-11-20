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
          'group relative flex items-center justify-between rounded-control px-3 py-2 type-body-small font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-fast select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          isActive
            ? 'bg-neutral-muted font-semibold text-ink-primary'
            : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary',
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
                  'icon-sm shrink-0 transition-[color,transform] duration-fast group-hover:scale-105',
                  isActive ? 'text-accent' : 'text-ink-secondary group-hover:text-ink-primary'
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
