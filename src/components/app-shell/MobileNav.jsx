import { NavLink, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RepertoireGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';

const navTabBase = 'flex flex-1 flex-col items-center justify-center gap-1 min-h-12 py-1.5 text-xs font-medium transition-colors select-none';

export default function MobileNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line-subtle bg-surface-panel/95 backdrop-blur-md lg:hidden shadow-overlay"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile navigation"
    >
      <NavLink
        to="/practice"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-semibold' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <PracticeGlyph className="h-5 w-5" />
        <span>Practice</span>
      </NavLink>

      <NavLink
        to="/library"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-semibold' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <RepertoireGlyph className="h-5 w-5" />
        <span>Repertoire</span>
      </NavLink>

      <button
        type="button"
        onClick={() => navigate('/add-score')}
        className="flex flex-col items-center justify-center py-1 select-none"
        aria-label="Add sheet or file"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-fill text-brand-fill-foreground shadow-raised transition-transform active:scale-[0.98]">
          <Plus className="h-4 w-4" />
        </span>
      </button>

      <NavLink
        to="/performances"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-semibold' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <MemoryGlyph className="h-5 w-5" />
        <span>Takes</span>
      </NavLink>
    </nav>
  );
}
