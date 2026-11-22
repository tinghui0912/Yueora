import React from 'react';
import { FolderInput } from 'lucide-react';

/**
 * FolderOptionRow — Domain item for folder selection dialogs and menus.
 */
export function FolderOptionRow({ name, onClick, icon: Icon = FolderInput }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-control border border-line-subtle px-3 py-2 text-left type-body-small hover:bg-neutral-hover transition-colors"
    >
      <Icon className="h-4 w-4 text-ink-secondary shrink-0" aria-hidden="true" />
      <span className="font-medium text-ink-primary truncate">{name}</span>
    </button>
  );
}

export default FolderOptionRow;
