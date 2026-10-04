import { NavLink, useNavigate } from 'react-router-dom';
import { Library as LibraryIcon, Plus, Music2 } from 'lucide-react';

const base = 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium';

export default function MobileNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line-subtle bg-surface-panel md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <NavLink
        to="/library"
        className={({ isActive }) => `${base} ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <LibraryIcon className="h-5 w-5" /> Library
      </NavLink>
      <button
        onClick={() => navigate('/add-score')}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-semibold text-primary"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Plus className="h-5 w-5" />
        </span>
      </button>
      <NavLink
        to="/practice"
        className={({ isActive }) => `${base} ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Music2 className="h-5 w-5" /> Practice
      </NavLink>
    </nav>
  );
}