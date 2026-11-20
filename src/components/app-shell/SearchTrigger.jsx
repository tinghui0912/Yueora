import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchTrigger — Standard application search / command palette trigger.
 * Owns hit area, keyboard shortcut presentation, hover, and focus states.
 */
export function SearchTrigger({
  label = 'Search',
  shortcut = '⌘K',
  onClick = undefined,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-control-md min-h-control-md w-full sm:w-52 xl:w-56 2xl:w-60 items-center justify-between gap-2.5 rounded-control border border-line-subtle bg-neutral-muted/60 px-3 type-body-small text-ink-secondary transition-[color,background-color,border-color] duration-base hover:border-line-strong hover:bg-neutral-hover hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 select-none',
        className
      )}
      aria-label={`${label} or command (${shortcut})`}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Search className="icon-md shrink-0 text-ink-secondary transition-colors group-hover:text-ink-primary" aria-hidden="true" />
        <span className="truncate type-body-small text-ink-secondary group-hover:text-ink-primary font-normal">{label}</span>
      </div>

      {shortcut && (
        <kbd className="hidden shrink-0 rounded border border-line-subtle bg-surface-panel px-1.5 py-0.5 type-caption font-mono font-medium text-ink-secondary/70 sm:inline select-none">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

export default SearchTrigger;
