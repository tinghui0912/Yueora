import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SearchPalette from './SearchPalette';
import SearchTrigger from './SearchTrigger';
import { IconButton } from '@/components/ui/icon-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifications = usePrototypeStore((s) => s.notifications);
  const markNotificationRead = usePrototypeStore((s) => s.markNotificationRead);
  const initials = (user?.full_name || user?.email || 'You').slice(0, 1).toUpperCase();
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-subtle bg-surface-canvas/90 px-4 backdrop-blur-md md:px-6">
      {/* Calm, standardized command trigger */}
      <div className="flex items-center gap-3">
        <SearchTrigger
          label="Search"
          shortcut="⌘K"
          onClick={() => setSearchOpen(true)}
        />
      </div>

      {/* Right utility actions - standardized primitives */}
      <div className="flex items-center gap-1.5">
        {/* Activity notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative inline-flex">
              <IconButton
                icon={Bell}
                size="md"
                tone="quiet"
                label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
              />
              {unreadCount > 0 && (
                <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-surface-canvas" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-line-subtle bg-surface-panel shadow-overlay">
            <DropdownMenuLabel className="type-caption text-ink-secondary/70">Activity</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-line-subtle" />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => { markNotificationRead(n.id); navigate(n.href); }}
                className="flex flex-col items-start gap-0.5 py-2 hover:bg-neutral-hover focus:bg-neutral-hover"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="type-body-small font-medium text-ink-primary">{n.title}</span>
                  <span className="type-metadata text-ink-secondary/70">{n.time}</span>
                </div>
                <span className="type-metadata text-ink-secondary leading-normal">{n.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={() => navigate('/notifications')} className="justify-center type-body-small font-medium text-brand hover:bg-neutral-hover focus:bg-neutral-hover">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <IconButton
          icon={HelpCircle}
          size="md"
          tone="quiet"
          label="Help & Knowledge Base"
          onClick={() => navigate('/help')}
          className="hidden sm:inline-flex"
        />

        <div className="mx-1 h-4 w-px bg-line-subtle" aria-hidden="true" />

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-control-md items-center gap-1.5 rounded-control px-1.5 transition-colors hover:bg-neutral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
              <Avatar className="h-8 w-8 border border-line-subtle">
                <AvatarFallback className="bg-brand text-xs font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="icon-sm text-ink-tertiary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-line-subtle bg-surface-panel shadow-overlay">
            <div className="px-3 py-2">
              <p className="type-body-small font-medium text-ink-primary">{user?.full_name || 'Musician'}</p>
              <p className="type-metadata text-ink-secondary/70 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={() => navigate('/settings/account')} className="type-body-small text-ink-primary hover:bg-neutral-hover focus:bg-neutral-hover">
              <User className="mr-2 h-4 w-4 text-ink-secondary" /> Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/preferences')} className="type-body-small text-ink-primary hover:bg-neutral-hover focus:bg-neutral-hover">
              <Settings className="mr-2 h-4 w-4 text-ink-secondary" /> Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={logout} className="type-body-small text-danger hover:bg-danger/10 focus:bg-danger/10">
              <LogOut className="mr-2 h-4 w-4 text-danger" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
