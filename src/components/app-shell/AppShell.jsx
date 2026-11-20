import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AppShell() {
  const { user } = useAuth();
  const initials = (user?.full_name || user?.email || 'You').slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas" data-qa="authenticated-shell">
      {/* Mobile-only minimal header (lg:hidden) */}
      <header className="flex h-14 items-center justify-between border-b border-line-subtle bg-surface-panel px-4 lg:hidden">
        <NavLink to="/practice" aria-label="Yueora home">
          <Logo variant="mark" size="sm" />
        </NavLink>
        <span className="type-caption font-serif italic text-ink-secondary">
          Yueora Sanctuary
        </span>
        <NavLink to="/settings/account" aria-label="Account">
          <Avatar className="h-7 w-7 border border-line-subtle">
            <AvatarFallback className="bg-brand type-caption font-semibold text-brand-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </NavLink>
      </header>

      {/* Main layout: 256px (w-64) sidebar + directly adjacent main content */}
      <div className="flex min-h-0 flex-1 lg:flex-row">
        <aside
          className="hidden w-64 shrink-0 border-r border-line-subtle bg-surface-panel lg:sticky lg:top-0 lg:h-dvh lg:block"
          aria-label="Application sidebar"
        >
          <Sidebar />
        </aside>

        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0"
        >
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}