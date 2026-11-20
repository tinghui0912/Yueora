import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Inbox, Settings } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import Logo from '@/components/brand/Logo';
import { RepertoireGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarSectionLabel } from './SidebarSectionLabel';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const navigate = useNavigate();
  const imports = usePrototypeStore((s) => s.imports);
  const activeImports = imports.filter((i) => i.status === 'processing' || i.status === 'needs_review').length;

  return (
    <div className="flex h-full flex-col select-none">
      {/* Brand Header — Bounded with subtle bottom divider */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line-subtle">
        <NavLink
          to="/practice"
          aria-label="Yueora Practice"
          className="inline-flex items-center gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Logo variant="full" size="md" />
        </NavLink>
      </div>

      {/* Primary Action — Compact Action Area */}
      <div className="px-3 pt-3.5 pb-2">
        <Button
          intent="secondary"
          size="md"
          className="w-full justify-center"
          onClick={() => navigate('/add-score')}
        >
          <Plus className="icon-sm text-brand" />
          <span>Add sheet or file</span>
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {/* Spaces */}
        <div>
          <SidebarSectionLabel className="px-3 py-1">Spaces</SidebarSectionLabel>
          <nav className="mt-1 space-y-0.5">
            <SidebarNavItem
              to="/practice"
              icon={PracticeGlyph}
              label="Practice"
            />
            <SidebarNavItem
              to="/library"
              icon={RepertoireGlyph}
              label="Repertoire"
            />
            <SidebarNavItem
              to="/performances"
              icon={MemoryGlyph}
              label="Preserved Takes"
            />
          </nav>
        </div>

        {/* Studio / Preparation */}
        <div>
          <SidebarSectionLabel className="px-3 py-1">Studio</SidebarSectionLabel>
          <nav className="mt-1 space-y-0.5">
            <SidebarNavItem
              to="/imports"
              icon={Inbox}
              label="Recognition Queue"
              badge={
                activeImports > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 type-caption font-semibold text-white" aria-label={`${activeImports} active imports`}>
                    {activeImports}
                  </span>
                ) : null
              }
            />
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Region */}
      <div className="px-3 py-3 border-t border-line-subtle space-y-1">
        <SidebarNavItem
          to="/settings/account"
          icon={Settings}
          label="Settings"
        />
        <div className="px-3 pt-1">
          <p className="font-display italic text-xs text-ink-tertiary">
            A personal musical journey.
          </p>
        </div>
      </div>
    </div>
  );
}
