import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Inbox, Bell, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import Logo from '@/components/brand/Logo';
import { RepertoireGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';
import { SidebarNavItem } from './SidebarNavItem';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SearchTrigger from './SearchTrigger';
import SearchPalette from './SearchPalette';
import { CountBadge } from '@/components/patterns/CountBadge';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const imports = usePrototypeStore((s) => s.imports);
  const notifications = usePrototypeStore((s) => s.notifications);

  const activeImports = imports.filter((i) => i.status === 'processing' || i.status === 'needs_review').length;
  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const initials = (user?.full_name || user?.email || 'You').slice(0, 1).toUpperCase();

  // Global ⌘K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-full flex-col p-6 select-none" data-qa="desktop-sidebar">
      {/* Brand Header */}
      <div>
        <NavLink
          to="/practice"
          aria-label="Yueora Practice"
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
        >
          <Logo variant="full" size="sidebar" />
        </NavLink>
        <p data-qa="sidebar-descriptor" className="mt-1 type-sidebar-descriptor text-ink-tertiary">
          Musical sanctuary
        </p>
      </div>

      {/* Quick Search Palette Trigger */}
      <div className="mt-6">
        <SearchTrigger
          label="Search score or piece"
          shortcut="⌘K"
          onClick={() => setSearchOpen(true)}
          className="w-full"
        />
      </div>

      {/* Primary Action Button */}
      <div className="mt-3">
        <Button
          intent="secondary"
          size="md"
          className="w-full justify-center"
          onClick={() => navigate('/add-score')}
        >
          <Plus className="text-brand icon-sm" />
          <span>Add score</span>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="mt-6 space-y-1">
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
        <SidebarNavItem
          to="/imports"
          icon={Inbox}
          label="Recognition"
          badge={
            activeImports > 0 ? (
              <CountBadge tone="informational">{activeImports}</CountBadge>
            ) : null
          }
        />
        <SidebarNavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          badge={
            unreadNotifications > 0 ? (
              <CountBadge tone="attention">{unreadNotifications}</CountBadge>
            ) : null
          }
        />
      </nav>

      {/* Spacer to push utilities and profile to bottom */}
      <div className="flex-1 min-h-6" />

      {/* Secondary Utilities */}
      <div className="space-y-1 border-t border-line-subtle/50 pt-4">
        <SidebarNavItem
          to="/help"
          icon={HelpCircle}
          label="Help &amp; Guides"
        />
        <SidebarNavItem
          to="/settings"
          icon={Settings}
          label="Settings"
        />
      </div>

      {/* User Profile Footer Row */}
      <div className="mt-4 flex items-center justify-between p-2">
        <NavLink
          to="/settings/account"
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
        >
          <Avatar className="h-8 w-8 border border-line-subtle/50 shrink-0">
            <AvatarFallback className="bg-brand-soft text-brand text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate type-body-small font-medium text-ink-primary">
              {user?.full_name || 'Musician'}
            </p>
            <p className="truncate type-metadata text-ink-secondary/70">
              {user?.email || 'Account'}
            </p>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 p-1.5 text-ink-secondary hover:text-danger hover:bg-danger/10 rounded-control transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="icon-sm" />
        </button>
      </div>

      {/* Search Palette Modal Dialog */}
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
