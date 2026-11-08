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
  onClick,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-9 items-center justify-between gap-2.5 rounded-control border border-surface-paper-edge bg-surface-paper/70 px-3 text-sm text-ink-secondary transition-all duration-base hover:border-line-strong hover:bg-surface-paper hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 sm:w-52 select-none shadow-xs',
        className
      )}
      aria-label={`${label} or command (${shortcut})`}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Search className="h-4 w-4 shrink-0 text-ink-secondary transition-colors group-hover:text-ink-primary" aria-hidden="true" />
        <span className="truncate type-body-small text-ink-secondary group-hover:text-ink-primary font-normal">{label}</span>
      </div>

      {shortcut && (
        <kbd className="hidden shrink-0 rounded border border-surface-paper-edge bg-surface-canvas/90 px-1.5 py-0.5 text-xs font-mono font-medium text-ink-secondary/70 sm:inline select-none">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

export default SearchTrigger;
