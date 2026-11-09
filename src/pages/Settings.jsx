import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '@/components/patterns/PageHeader';
import AppPage from '@/components/patterns/AppPage';

const items = [
  { to: '/settings/account', label: 'Account' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/notifications', label: 'Notifications' },
  { to: '/settings/plan', label: 'Plan & billing' },
  { to: '/settings/privacy', label: 'Data & privacy' },
];

export default function Settings() {
  return (
    <AppPage size="standard">
      <PageHeader title="Settings" />
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <nav className="shrink-0 md:w-48">
          <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible">
            {items.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded-control px-3 py-2 type-body-small transition-colors ${
                      isActive ? 'bg-neutral-muted font-semibold text-ink-primary shadow-xs' : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
                    }`
                  }
                >
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </AppPage>
  );
}