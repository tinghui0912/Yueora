/**
 * Notification Semantics
 * Shared non-visual domain logic for notifications:
 * - Recipient scoping (defaults to current user 'you')
 * - Category tab filtering (exact category matching per product design)
 * - Temporal grouping (Today vs Earlier)
 */

/**
 * Checks whether a notification timestamp represents recent activity ("Today").
 * Recognizes strings like 'just now', 'now', '2m', '1h', '2m ago', '1h ago', '1 hour ago', etc.
 *
 * @param {string} [time]
 * @returns {boolean}
 */
export function isRecentNotificationTime(time) {
  if (!time || typeof time !== 'string') return false;
  const t = time.trim().toLowerCase();
  if (t === 'just now' || t === 'now') return true;
  if (/^\d+\s*m(?:in|ins|inute|inutes)?(?:\s+ago)?$/.test(t)) return true;
  if (/^\d+\s*h(?:r|rs|our|ours)?(?:\s+ago)?$/.test(t)) return true;
  return false;
}

/**
 * Filters notifications addressed to a specific recipient or broadcast to all.
 *
 * @param {Array<Object>} items
 * @param {string} [recipientId='you']
 * @returns {Array<Object>}
 */
export function filterNotificationsForRecipient(items, recipientId = 'you') {
  if (!Array.isArray(items)) return [];
  return items.filter((n) => !n.recipientId || n.recipientId === recipientId);
}

/**
 * Filters a notification list by the active tab key.
 * - 'all': returns all items
 * - 'unread': returns unread items (handles either n.unread === true or n.read === false)
 * - others: matches exact n.category === tab (pre-regression truth)
 *
 * @param {Array<Object>} items
 * @param {string} tab
 * @returns {Array<Object>}
 */
export function filterNotificationsByTab(items, tab) {
  if (!Array.isArray(items)) return [];
  if (tab === 'all') return items;
  if (tab === 'unread') return items.filter((n) => n.unread || n.read === false);
  return items.filter((n) => n.category === tab);
}
