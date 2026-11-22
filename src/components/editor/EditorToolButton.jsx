import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * InspectorMobileTrigger — Mobile bottom trigger for editor note inspector.
 */
export function InspectorMobileTrigger({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-t border-line-subtle bg-surface-panel px-4 py-2.5 lg:hidden hover:bg-neutral-hover transition-colors"
    >
      <span className="type-body-small font-medium text-ink-primary">{label}</span>
      <ChevronRight className="icon-sm text-ink-secondary" aria-hidden="true" />
    </button>
  );
}

/**
 * EditorToolButton — Domain tool button for editor rail and mobile toolbar.
 */
export function EditorToolButton({
  tool,
  active = false,
  onClick,
  vertical = false,
  className = '',
}) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'transition-colors',
        vertical
          ? 'flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-control'
          : 'flex shrink-0 items-center gap-1.5 rounded-control px-2.5 py-1.5 type-body-small font-medium',
        active
          ? 'bg-neutral-muted font-semibold text-ink-primary'
          : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary',
        className
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-brand')} aria-hidden="true" />
      <span className={vertical ? 'type-caption' : ''}>{tool.label}</span>
    </button>
  );
}

export default EditorToolButton;
