import { NavLink, Outlet } from 'react-router-dom';
import AppPage from '@/components/patterns/AppPage';
import Surface from '@/components/patterns/Surface';

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
    <AppPage size="standard" className="space-y-6" data-qa="settings-page">
      <div>
        <h1 className="type-page-title text-ink-primary">Settings</h1>
        <p className="mt-1 type-body-small text-ink-secondary">
          Manage your personal profile, credentials, musical preferences, and workspace plan.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="shrink-0 md:w-52" aria-label="Settings navigation">
          <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible no-scrollbar">
            {items.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded-control px-3.5 py-2 type-body-small transition-colors ${
                      isActive
                        ? 'bg-brand-soft font-semibold text-ink-primary'
                        : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
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
          <Surface tone="panel" padding="md" className="space-y-6" data-qa="settings-card">
            <Outlet />
          </Surface>
        </div>
      </div>
    </AppPage>
  );
}
