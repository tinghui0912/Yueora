import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Inbox } from 'lucide-react';
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
    <div className="flex h-full flex-col px-4 py-5 select-none">
      {/* Brand Header */}
      <div className="px-2 pt-1">
        <NavLink to="/practice" aria-label="Yueora Practice" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
          <Logo variant="full" size="md" />
        </NavLink>
      </div>

      {/* Add score - refined secondary action */}
      <div className="mt-6 px-1">
        <Button
          intent="secondary"
          size="md"
          className="w-full justify-center"
          onClick={() => navigate('/add-score')}
        >
          <Plus className="text-brand" />
          <span>Add sheet or file</span>
        </Button>
      </div>

      {/* Primary musical spaces */}
      <div className="mt-6">
        <SidebarSectionLabel>Spaces</SidebarSectionLabel>
        <nav className="mt-2 space-y-1">
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
      <div className="mt-6 border-t border-line-subtle pt-4">
        <SidebarSectionLabel>Studio</SidebarSectionLabel>
        <div className="mt-2 space-y-1">
          <SidebarNavItem
            to="/imports"
            icon={Inbox}
            label="Recognition Queue"
            badge={
              activeImports > 0 ? (
                <span className="h-2 w-2 rounded-full bg-brand" aria-label={`${activeImports} active imports`} />
              ) : null
            }
          />
        </div>
      </div>

      {/* Brand motto / warmth */}
      <div className="mt-auto px-3 type-metadata text-ink-secondary/80">
        <p className="font-display italic">A personal musical journey.</p>
      </div>
    </div>
  );
}
