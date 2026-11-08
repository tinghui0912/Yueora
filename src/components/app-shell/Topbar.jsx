import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown, LogOut, Settings, CreditCard, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SearchPalette from './SearchPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
      {/* Calm, compact command trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="group flex items-center gap-2 rounded-control border border-surface-paper-edge bg-surface-paper/70 px-2.5 py-1.5 text-[13px] text-ink-secondary transition-colors hover:border-line-strong hover:bg-surface-paper hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label="Quick search or jump (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-ink-secondary transition-colors group-hover:text-ink-primary" />
          <span className="font-normal">Search</span>
          <kbd className="hidden rounded border border-surface-paper-edge bg-surface-canvas px-1.5 py-0.5 text-xs font-medium text-ink-secondary/70 sm:inline">⌘K</kbd>
        </button>
      </div>

      {/* Right utility actions - quiet and recessed */}
      <div className="flex items-center gap-1.5">
        {/* Activity notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary transition-colors hover:bg-surface-paper hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-surface-canvas" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-surface-paper-edge bg-surface-panel shadow-overlay">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Activity</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-line-subtle" />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => { markNotificationRead(n.id); navigate(n.href); }}
                className="flex flex-col items-start gap-0.5 py-2 hover:bg-surface-paper focus:bg-surface-paper"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-ink-primary">{n.title}</span>
                  <span className="text-xs text-ink-secondary/70">{n.time}</span>
                </div>
                <span className="text-[13px] text-ink-secondary leading-normal">{n.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={() => navigate('/notifications')} className="justify-center text-sm font-medium text-brand hover:bg-surface-paper focus:bg-surface-paper">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <button
          onClick={() => navigate('/help')}
          className="hidden h-8 w-8 items-center justify-center rounded-control text-ink-secondary transition-colors hover:bg-surface-paper hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:flex"
          aria-label="Help & Knowledge Base"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-line-subtle" aria-hidden="true" />

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-control p-1 transition-colors hover:bg-surface-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
              <Avatar className="h-7 w-7 border border-surface-paper-edge">
                <AvatarFallback className="bg-brand text-xs font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-ink-tertiary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-surface-paper-edge bg-surface-panel shadow-overlay">
            <DropdownMenuLabel className="font-normal py-2">
              <p className="text-sm font-semibold text-ink-primary">{user?.full_name || 'Account'}</p>
              <p className="truncate text-[13px] text-ink-secondary/80">{user?.email || ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={() => navigate('/settings/account')} className="text-sm hover:bg-surface-paper focus:bg-surface-paper">
              <Settings className="mr-2 h-4 w-4 text-ink-secondary" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/plan')} className="text-sm hover:bg-surface-paper focus:bg-surface-paper">
              <CreditCard className="mr-2 h-4 w-4 text-ink-secondary" /> Plan & billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="text-sm hover:bg-surface-paper focus:bg-surface-paper">
              <LifeBuoy className="mr-2 h-4 w-4 text-ink-secondary" /> Help
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-line-subtle" />
            <DropdownMenuItem onClick={() => logout()} className="text-sm text-destructive hover:bg-surface-paper focus:bg-surface-paper">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
