import { useState } from 'react';
import { Trash2, FolderPlus, Folder, Pencil, Check, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

const librarySections = [
  { key: 'all', label: 'All music' },
  { key: 'mine', label: 'Mine' },
  { key: 'shared', label: 'Shared with me' },
  { key: 'saved', label: 'Saved' },
  { key: 'favorites', label: 'Favorites' },
];

export default function LibrarySubRail({ active, onSelect, folders, onCreateFolder, onRenameFolder, onDeleteFolder }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const submitCreate = () => {
    if (newName.trim()) onCreateFolder(newName.trim());
    setNewName('');
    setCreating(false);
  };
  const submitRename = (id) => {
    if (editName.trim()) onRenameFolder(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="hidden w-52 shrink-0 border-r border-line-subrail bg-surface-subrail lg:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden px-3 py-5">
        <p className="px-2.5 type-caption font-semibold uppercase tracking-wider text-ink-tertiary">Collections</p>
        <div className="mt-2 space-y-0.5">
          {librarySections.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cn(
                'flex w-full min-w-0 items-center rounded-control px-2.5 py-1.5 text-left type-body-small transition-colors',
                active === item.key
                  ? 'bg-brand-soft font-semibold text-ink-primary'
                  : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
              )}
            >
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between px-2.5">
          <p className="type-caption font-semibold uppercase tracking-wider text-ink-tertiary">Folders</p>
          <IconButton
            icon={FolderPlus}
            size="xs"
            tone="quiet"
            label="New folder"
            onClick={() => setCreating((c) => !c)}
          />
        </div>

        <div className="mt-2 space-y-0.5">
          {creating && (
            <div className="grid grid-cols-[minmax(0,1fr)_28px_28px] items-center gap-1 px-1 py-0.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
                placeholder="Folder name"
                className="h-control-xs w-full min-w-0 rounded-control border border-line-subtle bg-surface-panel px-2 type-caption text-ink-primary outline-none focus:border-brand"
              />
              <IconButton
                icon={Check}
                size="xs"
                tone="quiet"
                className="text-brand hover:bg-neutral-hover"
                label="Confirm folder"
                onClick={submitCreate}
              />
              <IconButton
                icon={X}
                size="xs"
                tone="quiet"
                className="text-ink-secondary hover:bg-neutral-hover"
                label="Cancel"
                onClick={() => setCreating(false)}
              />
            </div>
          )}
          {folders.map((f) => (
            <div key={f.id} className="group relative flex min-w-0 items-center rounded-control">
              {editingId === f.id ? (
                <div className="grid grid-cols-[minmax(0,1fr)_28px_28px] items-center gap-1 px-1 py-0.5 w-full">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitRename(f.id)}
                    className="h-control-xs w-full min-w-0 rounded-control border border-line-subtle bg-surface-panel px-2 type-caption text-ink-primary outline-none focus:border-brand"
                  />
                  <IconButton
                    icon={Check}
                    size="xs"
                    tone="quiet"
                    className="text-brand hover:bg-neutral-hover"
                    label="Confirm rename"
                    onClick={() => submitRename(f.id)}
                  />
                  <IconButton
                    icon={X}
                    size="xs"
                    tone="quiet"
                    className="text-ink-secondary hover:bg-neutral-hover"
                    label="Cancel"
                    onClick={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelect(`folder:${f.id}`)}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 rounded-control px-2.5 py-1.5 pr-14 text-left type-body-small transition-colors',
                      active === `folder:${f.id}`
                        ? 'bg-brand-soft font-semibold text-ink-primary'
                        : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
                    )}
                  >
                    <Folder className={cn('icon-sm shrink-0 transition-colors', active === `folder:${f.id}` ? 'text-brand' : 'opacity-70')} />
                    <span className="truncate min-w-0">{f.name}</span>
                  </button>
                  <div className="absolute right-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 bg-surface-subrail rounded-control">
                    <IconButton
                      icon={Pencil}
                      size="xs"
                      tone="quiet"
                      label="Rename folder"
                      onClick={() => { setEditingId(f.id); setEditName(f.name); }}
                    />
                    <IconButton
                      icon={Trash2}
                      size="xs"
                      tone="quiet"
                      className="hover:text-destructive"
                      label="Delete folder"
                      onClick={() => onDeleteFolder(f.id)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
