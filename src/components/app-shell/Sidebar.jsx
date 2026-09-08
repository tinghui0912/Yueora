import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Library as LibraryIcon, Music2, FolderPlus, Inbox } from 'lucide-react';
import { folders } from '@/lib/mockData';

const navItem =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors';

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="px-2">
        <span className="font-display text-2xl tracking-tight text-foreground">NoteVerse</span>
      </div>

      <button
        onClick={() => navigate('/add-score')}
        className="mt-6 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Add score
      </button>

      <nav className="mt-7 space-y-1">
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `${navItem} ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'}`
          }
        >
          <LibraryIcon className="h-4 w-4" /> Library
        </NavLink>
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            `${navItem} ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'}`
          }
        >
          <Music2 className="h-4 w-4" /> Practice
        </NavLink>
        <NavLink
          to="/imports"
          className={({ isActive }) =>
            `${navItem} ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'}`
          }
        >
          <Inbox className="h-4 w-4" /> Imports
        </NavLink>
      </nav>

      <div className="mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folders</p>
        <div className="mt-2 space-y-1">
          {folders.map((f) => (
            <NavLink
              key={f.id}
              to={`/library?folder=${encodeURIComponent(f.name)}`}
              className={`${navItem} text-muted-foreground hover:bg-accent/60 hover:text-foreground`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              {f.name}
            </NavLink>
          ))}
          <button className={`${navItem} w-full text-muted-foreground hover:text-foreground`}>
            <FolderPlus className="h-4 w-4" /> New folder
          </button>
        </div>
      </div>

      <div className="mt-auto px-2 text-xs text-muted-foreground">
        <p>Personal library + practice</p>
      </div>
    </div>
  );
}