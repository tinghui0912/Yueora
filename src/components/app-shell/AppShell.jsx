import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Search, Bell, User, Settings as SettingsIcon, HelpCircle, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import SearchPalette from './SearchPalette';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function AppShell() {
  const { user, logout } = useAuth();
  const account = usePrototypeStore((s) => s.account);
  const notifications = usePrototypeStore((s) => s.notifications) || [];
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [searchOpen, setSearchOpen] = useState(false);

  const displayName = account?.displayName || user?.full_name || user?.email || 'You';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas" data-qa="authenticated-shell">
      {/* Mobile-only header with complete feature parity (md:hidden) */}
      <header
        className="flex h-14 items-center justify-between border-b border-line-subtle/50 bg-surface-panel px-4 md:hidden"
        data-qa="mobile-header"
      >
        <div className="flex items-center gap-2.5">
          <NavLink to="/practice" aria-label="Yueora home">
            <Logo variant="mark" size="sm" />
          </NavLink>
          <span className="type-sidebar-descriptor text-ink-tertiary">
            Yueora Sanctuary
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Search Trigger */}
          <IconButton
            icon={Search}
            size="sm"
            tone="quiet"
            label="Search repertoire"
            data-qa="mobile-search-trigger"
            onClick={() => setSearchOpen(true)}
          />

          {/* Mobile Notifications with unread indicator */}
          <NavLink
            to="/notifications"
            data-qa="mobile-notifications-link"
            className="relative flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary transition-colors"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          >
            <Bell className="icon-sm" />
            {unreadCount > 0 && (
              <span
                data-qa="mobile-notification-badge"
                className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-brand"
              />
            )}
          </NavLink>

          {/* Mobile Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-qa="mobile-account-trigger"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Account menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-brand type-body-small font-semibold text-brand-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="type-body-small font-semibold text-ink-primary truncate">{displayName}</p>
                <p className="type-metadata text-ink-secondary truncate">{account?.email || user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-line-subtle" />
              <DropdownMenuItem asChild>
                <NavLink to="/settings/account" className="flex items-center gap-2 cursor-pointer">
                  <User className="icon-xs" />
                  <span>Account</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/settings/preferences" className="flex items-center gap-2 cursor-pointer">
                  <SettingsIcon className="icon-xs" />
                  <span>Preferences</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/help" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="icon-xs" />
                  <span>Help &amp; Guides</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-line-subtle" />
              <DropdownMenuItem
                onClick={logout}
                data-qa="mobile-signout-button"
                className="flex items-center gap-2 text-danger hover:text-danger cursor-pointer"
              >
                <LogOut className="icon-xs" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main layout: 256px (w-64) sidebar + directly adjacent main content */}
      <div className="flex min-h-0 flex-1 md:flex-row">
        <aside
          className="hidden w-64 shrink-0 border-r border-line-subtle/50 bg-surface-panel md:sticky md:top-0 md:h-dvh md:block"
          aria-label="Application sidebar"
          data-qa="desktop-sidebar"
        >
          <Sidebar />
        </aside>

        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
