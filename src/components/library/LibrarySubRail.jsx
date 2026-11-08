import { useState } from 'react';
import { Trash2, FolderPlus, Folder, Pencil, Check, X } from 'lucide-react';

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
    <div className="hidden w-[200px] shrink-0 border-r border-line-subtle bg-surface-canvas/50 lg:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-5">
        <p className="px-2.5 text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Collections</p>
        <div className="mt-2 space-y-0.5">
          {librarySections.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center rounded-control px-2.5 py-1.5 text-left text-sm transition-colors ${
                active === item.key
                  ? 'bg-brand/10 font-semibold text-brand'
                  : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between px-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Folders</p>
          <button
            onClick={() => setCreating((c) => !c)}
            className="flex h-7 w-7 items-center justify-center rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            aria-label="New folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 space-y-0.5">
          {creating && (
            <div className="flex items-center gap-1 px-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
                placeholder="Folder name"
                className="h-8 w-full rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 text-sm outline-none focus:border-brand"
              />
              <button onClick={submitCreate} className="flex h-7 w-7 items-center justify-center rounded text-brand hover:bg-brand/10" aria-label="Confirm folder"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => setCreating(false)} className="flex h-7 w-7 items-center justify-center rounded text-ink-secondary hover:bg-surface-paper" aria-label="Cancel"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          {folders.map((f) => (
            <div key={f.id} className="group flex items-center">
              {editingId === f.id ? (
                <div className="flex w-full items-center gap-1 px-1">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitRename(f.id)}
                    className="h-8 w-full rounded-control border border-surface-paper-edge bg-surface-paper px-2.5 text-sm outline-none focus:border-brand"
                  />
                  <button onClick={() => submitRename(f.id)} className="flex h-7 w-7 items-center justify-center rounded text-brand hover:bg-brand/10" aria-label="Confirm rename"><Check className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setEditingId(null)} className="flex h-7 w-7 items-center justify-center rounded text-ink-secondary hover:bg-surface-paper" aria-label="Cancel"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelect(`folder:${f.id}`)}
                    className={`flex flex-1 items-center gap-2 rounded-control px-2.5 py-1.5 text-left text-sm transition-colors ${
                      active === `folder:${f.id}`
                        ? 'bg-brand/10 font-semibold text-brand'
                        : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
                    }`}
                  >
                    <Folder className="h-4 w-4 opacity-70" />
                    <span className="truncate">{f.name}</span>
                  </button>
                  <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      onClick={() => { setEditingId(f.id); setEditName(f.name); }}
                      className="flex h-7 w-7 items-center justify-center rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
                      aria-label="Rename folder"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFolder(f.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-ink-secondary hover:text-destructive hover:bg-surface-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
                      aria-label="Delete folder"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
