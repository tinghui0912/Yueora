import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <div className="flex min-h-0 flex-1 lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-line-subtle bg-surface-canvas/90 backdrop-blur-md lg:sticky lg:top-0 lg:h-dvh lg:flex lg:flex-col">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}