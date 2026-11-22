import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Button } from '@/components/ui/button';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import EmptyState from '@/components/patterns/EmptyState';
import { FilterTabs, FilterTab } from '@/components/patterns/FilterTabs';
import NotificationRow from '@/components/notifications/NotificationRow';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'practice', label: 'Practice' },
  { key: 'sharing', label: 'Sharing' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const notifications = usePrototypeStore((s) => s.notifications);
  const markRead = usePrototypeStore((s) => s.markNotificationRead);
  const markAllRead = usePrototypeStore((s) => s.markAllNotificationsRead);

  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (tab === 'unread') return n.unread;
      if (tab === 'practice') return n.category === 'practice';
      if (tab === 'sharing') return n.category === 'sharing';
      return true;
    });
  }, [notifications, tab]);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const groups = useMemo(() => {
    const today = [];
    const earlier = [];
    filtered.forEach((n) => {
      if (n.time.includes('m ago') || n.time.includes('h ago') || n.time === 'Just now') {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });
    return { today, earlier };
  }, [filtered]);

  return (
    <AppPage size="compact" className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates on shared scores, practice goals, and activity."
        primaryAction={
          unreadCount > 0 && (
            <Button intent="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck className="mr-1.5 icon-xs" /> Mark all read
            </Button>
          )
        }
      />

      <FilterTabs aria-label="Notification filters">
        {tabs.map((t) => (
          <FilterTab
            key={t.key}
            active={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </FilterTab>
        ))}
      </FilterTabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="When something happens — a score is ready, an invitation is accepted — it'll show up here."
        />
      ) : (
        <div className="mt-5 space-y-6">
          {groups.today.length > 0 && (
            <Group
              label="Today"
              items={groups.today}
              onOpen={(id) => markRead(id)}
              navigate={navigate}
            />
          )}
          {groups.earlier.length > 0 && (
            <Group
              label="Earlier"
              items={groups.earlier}
              onOpen={(id) => markRead(id)}
              navigate={navigate}
            />
          )}
        </div>
      )}
    </AppPage>
  );
}

function Group({ label, items, onOpen, navigate }) {
  return (
    <div>
      <h2 className="mb-2 type-body-small font-medium text-ink-tertiary">{label}</h2>
      <ul className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel overflow-hidden">
        {items.map((n) => (
          <li key={n.id}>
            <NotificationRow
              item={n}
              onOpen={onOpen}
              onNavigate={navigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
