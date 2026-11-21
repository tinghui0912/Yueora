import { NavLink } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { RepertoireGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';

const navTabBase = 'flex flex-col items-center justify-center gap-1 min-h-12 py-1.5 type-mobile-nav font-medium transition-colors select-none min-w-0';

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-center border-t border-line-subtle/50 bg-surface-panel/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile navigation"
      data-qa="mobile-navigation"
    >
      <NavLink
        to="/practice"
        data-qa="mobile-nav-slot"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-medium' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <PracticeGlyph className="h-5 w-5" />
        <span className="truncate">Practice</span>
      </NavLink>

      <NavLink
        to="/library"
        data-qa="mobile-nav-slot"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-medium' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <RepertoireGlyph className="h-5 w-5" />
        <span className="truncate">Repertoire</span>
      </NavLink>

      <NavLink
        to="/add-score"
        data-qa="mobile-nav-slot"
        className="flex flex-col items-center justify-center min-h-12 py-1 select-none min-w-0"
        aria-label="Add score"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand text-brand-foreground shadow hover:bg-brand/90 transition-transform">
          <Plus className="h-4 w-4" />
        </span>
      </NavLink>

      <NavLink
        to="/performances"
        data-qa="mobile-nav-slot"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-medium' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <MemoryGlyph className="h-5 w-5" />
        <span className="truncate">Takes</span>
      </NavLink>

      <NavLink
        to="/settings"
        data-qa="mobile-nav-slot"
        className={({ isActive }) =>
          `${navTabBase} ${isActive ? 'text-brand font-medium' : 'text-ink-secondary hover:text-ink-primary'}`
        }
      >
        <Settings className="h-5 w-5" />
        <span className="truncate">Settings</span>
      </NavLink>
    </nav>
  );
}
