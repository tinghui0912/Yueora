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
  const initials = (user?.full_name || user?.email || 'You').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <button
        onClick={() => setSearchOpen(true)}
        className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 md:max-w-md"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search your music…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:inline">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground">
              <Bell className="h-5 w-5" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-sm font-semibold">Activity</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => navigate(n.href)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')} className="justify-center text-sm font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => navigate('/help')}
          className="hidden h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground md:flex"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 items-center gap-1.5 rounded-md pl-1 pr-1.5 hover:bg-accent/60">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.full_name || 'Account'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/account')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/plan')}>
              <CreditCard className="mr-2 h-4 w-4" /> Plan & billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')}>
              <LifeBuoy className="mr-2 h-4 w-4" /> Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}