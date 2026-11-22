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

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'sharing', label: 'Scores' },
  { key: 'performances', label: 'Performances' },
  { key: 'comments', label: 'Comments' },
  { key: 'imports', label: 'Imports' },
  { key: 'system', label: 'System' },
];

function isRecentNotificationTime(time) {
  if (!time) return false;
  return /^(just now|\d+[mh]|\d+\s*[mh]\s*ago)$/i.test(time.trim());
}

export default function Notifications() {
  const navigate = useNavigate();
  const items = usePrototypeStore((s) => s.notifications);
  const markRead = usePrototypeStore((s) => s.markNotificationRead);
  const markAllRead = usePrototypeStore((s) => s.markAllNotificationsRead);

  const [tab, setTab] = useState('all');

  // Notifications can be addressed to a specific person; only yours are listed.
  const mine = useMemo(() => items.filter((n) => !n.recipientId || n.recipientId === 'you'), [items]);

  const filtered = useMemo(() => {
    if (tab === 'all') return mine;
    if (tab === 'unread') return mine.filter((n) => n.unread);
    if (tab === 'system') {
      return mine.filter((n) => n.category === 'system' || n.category === 'security' || n.category === 'billing');
    }
    return mine.filter((n) => n.category === tab);
  }, [mine, tab]);

  const unreadCount = useMemo(() => mine.filter((n) => n.unread).length, [mine]);

  const groups = useMemo(() => {
    const today = [];
    const earlier = [];
    filtered.forEach((n) => {
      if (isRecentNotificationTime(n.time)) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });
    return { today, earlier };
  }, [filtered]);

  return (
    <AppPage size="standard">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread`}
        primaryAction={
          unreadCount > 0 ? (
            <Button intent="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck className="mr-1.5 icon-xs" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <FilterTabs aria-label="Notification filters" className="mt-5">
        {filters.map((t) => (
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
      <h2 className="mb-2 type-caption text-ink-tertiary">{label}</h2>
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
