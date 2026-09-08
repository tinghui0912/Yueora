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
    <div className="hidden w-[200px] shrink-0 border-r border-border bg-background lg:block">
      <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
        <p className="px-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Library</p>
        <div className="mt-2 space-y-0.5">
          {librarySections.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                active === item.key ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between px-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folders</p>
          <button onClick={() => setCreating((c) => !c)} className="text-muted-foreground hover:text-foreground" aria-label="New folder">
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
                className="h-8 w-full rounded-md border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              />
              <button onClick={submitCreate} className="rounded p-1 text-primary hover:bg-accent"><Check className="h-4 w-4" /></button>
              <button onClick={() => setCreating(false)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
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
                    className="h-8 w-full rounded-md border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                  />
                  <button onClick={() => submitRename(f.id)} className="rounded p-1 text-primary hover:bg-accent"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingId(null)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelect(`folder:${f.id}`)}
                    className={`flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                      active === `folder:${f.id}` ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5" /> {f.name}
                  </button>
                  <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => { setEditingId(f.id); setEditName(f.name); }} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Rename folder"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDeleteFolder(f.id)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Delete folder"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-border pt-3">
          <button
            onClick={() => onSelect('trash')}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
              active === 'trash' ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </button>
        </div>
      </div>
    </div>
  );
}