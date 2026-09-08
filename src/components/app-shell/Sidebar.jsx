import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Library as LibraryIcon, Music2, Inbox } from 'lucide-react';
import { imports } from '@/lib/mockData';

const navItem = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors';

export default function Sidebar() {
  const navigate = useNavigate();
  const activeImports = imports.filter((i) => i.status === 'processing' || i.status === 'needs_review').length;

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="px-2">
        <span className="font-display text-2xl tracking-tight text-foreground">Yueora</span>
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
      </nav>

      <div className="mt-6 border-t border-border pt-4">
        <NavLink
          to="/imports"
          className={({ isActive }) =>
            `${navItem} ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`
          }
        >
          <div className="relative">
            <Inbox className="h-4 w-4" />
            {activeImports > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />}
          </div>
          Imports
        </NavLink>
      </div>

      <div className="mt-auto px-2 text-xs text-muted-foreground">
        <p>Play what you love.</p>
      </div>
    </div>
  );
}