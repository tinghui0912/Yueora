import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Inbox } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import Logo from '@/components/brand/Logo';
import { RepertoireGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';

const navItemBase = 'group relative flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-[background-color,color] duration-fast';

export default function Sidebar() {
  const navigate = useNavigate();
  const imports = usePrototypeStore((s) => s.imports);
  const activeImports = imports.filter((i) => i.status === 'processing' || i.status === 'needs_review').length;

  return (
    <div className="flex h-full flex-col px-4 py-5 select-none">
      {/* Brand Header */}
      <div className="px-2 pt-1">
        <NavLink to="/library" aria-label="Yueora Repertoire" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
          <Logo variant="full" size="md" />
        </NavLink>
      </div>

      {/* Add score - refined paper action */}
      <div className="mt-6 px-1">
        <button
          onClick={() => navigate('/add-score')}
          className="flex w-full items-center justify-center gap-2 rounded-control border border-surface-paper-edge bg-surface-paper px-3 py-2 text-sm font-medium text-ink-primary shadow-paper transition-all hover:border-line-strong hover:bg-surface-paper-warm active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Plus className="h-4 w-4 text-brand" />
          <span>Add sheet or file</span>
        </button>
      </div>

      {/* Primary musical spaces */}
      <div className="mt-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Spaces</p>
        <nav className="mt-2 space-y-1">
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
              }`
            }
          >
            <RepertoireGlyph className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            <span>Repertoire</span>
          </NavLink>
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
              }`
            }
          >
            <PracticeGlyph className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            <span>Practice</span>
          </NavLink>
          <NavLink
            to="/performances"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
              }`
            }
          >
            <MemoryGlyph className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            <span>Preserved Takes</span>
          </NavLink>
        </nav>
      </div>

      {/* Studio / Preparation */}
      <div className="mt-6 border-t border-line-subtle pt-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Studio</p>
        <div className="mt-2 space-y-1">
          <NavLink
            to="/imports"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-ink-secondary hover:bg-surface-paper hover:text-ink-primary'
              }`
            }
          >
            <div className="relative">
              <Inbox className="h-4 w-4 shrink-0" />
              {activeImports > 0 && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />
              )}
            </div>
            <span>Recognition Queue</span>
          </NavLink>
        </div>
      </div>

      {/* Brand motto / warmth */}
      <div className="mt-auto px-3 text-xs text-ink-secondary/80">
        <p className="font-display italic">A personal musical journey.</p>
      </div>
    </div>
  );
}
