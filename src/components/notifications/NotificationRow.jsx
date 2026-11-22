import React from 'react';
import { Sparkles, Music, Users, Disc3, MessageCircle, Shield, CreditCard, Inbox } from 'lucide-react';

const categoryIcon = {
  practice: Music,
  sharing: Users,
  performances: Disc3,
  comments: MessageCircle,
  security: Shield,
  billing: CreditCard,
  imports: Inbox,
};

/**
 * NotificationRow: Compound domain component for an interactive notification row.
 * Encapsulates interactive hover, read/unread states, and visual icon surround.
 */
export default function NotificationRow({ item, onOpen, onNavigate }) {
  const Icon = categoryIcon[item.category] || Sparkles;

  const handleClick = () => {
    onOpen?.(item.id);
    if (item.href && onNavigate) {
      onNavigate(item.href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-neutral-hover transition-colors"
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${
          item.unread
            ? 'border border-line-subtle bg-surface-canvas text-brand'
            : 'bg-neutral-muted text-ink-primary'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`type-body-small ${item.unread ? 'font-medium text-ink-primary' : 'text-ink-secondary'}`}>
            {item.title}
          </span>
          <span className="shrink-0 type-metadata text-ink-tertiary">{item.time}</span>
        </span>
        <span className="mt-0.5 block truncate type-body-small text-ink-secondary">{item.body}</span>
      </span>
      {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
    </button>
  );
}
