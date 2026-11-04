import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex min-h-0 flex-1 md:flex-row">
        <aside className="hidden w-[220px] shrink-0 border-r border-line-subtle bg-surface-panel md:sticky md:top-0 md:h-dvh md:block">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}