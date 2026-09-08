import { NavLink, Outlet } from 'react-router-dom';

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
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="font-display text-2xl font-medium">Settings</h1>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <nav className="shrink-0 md:w-48">
          <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible">
            {items.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                      isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
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
    </div>
  );
}