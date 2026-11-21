import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Users, Music, Sparkles, Shield, CreditCard, Inbox, Disc3, MessageCircle } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Button } from '@/components/ui/button';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import StateMessage from '@/components/patterns/StateMessage';
import { FilterTabs, FilterTab } from '@/components/patterns/FilterTabs';

const categoryIcon = {
  practice: Music,
  sharing: Users,
  performances: Disc3,
  comments: MessageCircle,
  imports: Inbox,
  security: Shield,
  billing: CreditCard,
  system: Sparkles,
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'sharing', label: 'Scores' },
  { key: 'performances', label: 'Performances' },
  { key: 'comments', label: 'Comments' },
  { key: 'imports', label: 'Imports' },
  { key: 'system', label: 'System' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const items = usePrototypeStore((s) => s.notifications);
  const markRead = usePrototypeStore((s) => s.markNotificationRead);
  const markAllRead = usePrototypeStore((s) => s.markAllNotificationsRead);
  const [filter, setFilter] = useState('all');

  // Notifications can be addressed to a specific person; only yours are listed.
  const mine = useMemo(() => items.filter((n) => !n.recipientId || n.recipientId === 'you'), [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return mine;
    if (filter === 'unread') return mine.filter((n) => n.unread);
    return mine.filter((n) => n.category === filter);
  }, [mine, filter]);

  const unreadCount = mine.filter((n) => n.unread).length;

  const groups = useMemo(() => {
    const today = filtered.filter((n) => ['just now', '2m', '1h', '5h'].includes(n.time));
    const earlier = filtered.filter((n) => !['just now', '2m', '1h', '5h'].includes(n.time));
    return { today, earlier };
  }, [filtered]);

  return (
    <AppPage size="standard">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread`}
        primaryAction={unreadCount > 0 ? <Button intent="quiet" size="sm" onClick={markAllRead}><CheckCheck className="mr-1.5" /> Mark all read</Button> : undefined}
      />

      <FilterTabs className="mt-5">
        {filters.map((t) => (
          <FilterTab
            key={t.key}
            active={filter === t.key}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </FilterTab>
        ))}
      </FilterTabs>

      {filtered.length === 0 ? (
        <StateMessage
          tone="neutral"
          icon={Bell}
          title="You're all caught up"
          description="When something happens — a score is ready, an invitation is accepted — it'll show up here."
        />
      ) : (
        <div className="mt-5 space-y-6">
          {groups.today.length > 0 && <Group label="Today" items={groups.today} onOpen={(id) => { markRead(id); }} navigate={navigate} />}
          {groups.earlier.length > 0 && <Group label="Earlier" items={groups.earlier} onOpen={(id) => { markRead(id); }} navigate={navigate} />}
        </div>
      )}
    </AppPage>
  );
}

function Group({ label, items, onOpen, navigate }) {
  return (
    <div>
      <h2 className="mb-2 type-body-small font-medium text-ink-tertiary">{label}</h2>
      <ul className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
        {items.map((n) => {
          const Icon = categoryIcon[n.category] || Sparkles;
          return (
            <li key={n.id}>
              <button onClick={() => { onOpen(n.id); navigate(n.href); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-neutral-hover transition-colors">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${n.unread ? 'border border-line-subtle bg-surface-canvas text-brand' : 'bg-neutral-muted text-ink-secondary'}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className={`type-body-small ${n.unread ? 'font-medium text-ink-primary' : 'text-ink-secondary'}`}>{n.title}</span><span className="shrink-0 type-metadata text-ink-tertiary">{n.time}</span></span>
                  <span className="mt-0.5 block truncate type-body-small text-ink-secondary">{n.body}</span>
                </span>
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}