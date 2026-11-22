import fs from 'node:fs';
import path from 'node:path';
import {
  isRecentNotificationTime,
  filterNotificationsForRecipient,
  filterNotificationsByTab,
} from '../src/lib/notificationSemantics.js';

console.log('🧪 Running Yueora Product Semantics Regression Tests...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// 1. NOTIFICATIONS PRODUCT SEMANTICS
// -----------------------------------------------------------------------------
console.log('--- Notifications Product Semantics ---');

// 1.1 Recipient Filtering
const sampleNotifications = [
  { id: '1', recipientId: 'you', title: 'Your score was reviewed', read: false, time: '2m', category: 'comment' },
  { id: '2', recipientId: null, title: 'System maintenance', read: true, time: '1h', category: 'system' },
  { id: '3', recipientId: 'other-user', title: 'Private message for other', read: false, time: '5h', category: 'sharing' },
  { id: '4', recipientId: 'you', title: 'Performance uploaded', read: false, time: '1d', category: 'performances' },
  { id: '5', recipientId: 'you', title: 'Import complete', read: true, time: '2d', category: 'imports' },
];

const mine = filterNotificationsForRecipient(sampleNotifications, 'you');
assert(mine.length === 4, 'Recipient scoping excludes other prototype users (4 of 5 kept)');
assert(!mine.some((n) => n.recipientId === 'other-user'), 'No notification addressed to other-user is present');

// 1.2 Category Filters via filterNotificationsByTab
const unreadItems = filterNotificationsByTab(mine, 'unread');
assert(unreadItems.length === 2, 'Unread filter correctly identifies unread items (2 unread)');

const performanceItems = filterNotificationsByTab(mine, 'performances');
assert(performanceItems.length === 1 && performanceItems[0].id === '4', 'Performances filter matches performances category');

const importItems = filterNotificationsByTab(mine, 'imports');
assert(importItems.length === 1 && importItems[0].id === '5', 'Imports filter matches imports category');

const systemItems = filterNotificationsByTab(mine, 'system');
assert(systemItems.length === 1 && systemItems[0].id === '2', 'System filter matches exact system category (pre-regression truth)');

// 1.3 Today vs Earlier Time Grouping Helper
assert(isRecentNotificationTime('just now') === true, 'Time "just now" is grouped under Today');
assert(isRecentNotificationTime('2m') === true, 'Time "2m" is grouped under Today');
assert(isRecentNotificationTime('1h') === true, 'Time "1h" is grouped under Today');
assert(isRecentNotificationTime('5h') === true, 'Time "5h" is grouped under Today');
assert(isRecentNotificationTime('2m ago') === true, 'Time "2m ago" is grouped under Today');
assert(isRecentNotificationTime('1h ago') === true, 'Time "1h ago" is grouped under Today');
assert(isRecentNotificationTime('1d') === false, 'Time "1d" is grouped under Earlier');
assert(isRecentNotificationTime('2d') === false, 'Time "2d" is grouped under Earlier');
assert(isRecentNotificationTime('3d') === false, 'Time "3d" is grouped under Earlier');
assert(isRecentNotificationTime('1w') === false, 'Time "1w" is grouped under Earlier');
assert(isRecentNotificationTime('2024-01-01') === false, 'Date string is grouped under Earlier');

// 1.4 Notifications Source Code Contract
const notifCode = fs.readFileSync('src/pages/Notifications.jsx', 'utf8');
assert(notifCode.includes('filterNotificationsForRecipient'), 'Notifications imports and uses filterNotificationsForRecipient');
assert(notifCode.includes('filterNotificationsByTab'), 'Notifications imports and uses filterNotificationsByTab');
assert(notifCode.includes('size="standard"'), 'Notifications uses AppPage size="standard" (desktop width preserved)');
assert(!notifCode.includes('size="compact"'), 'Notifications does NOT use compact width');
assert(notifCode.includes('unreadCount'), 'Notifications displays dynamic unread count');
assert(notifCode.includes("key: 'sharing', label: 'Scores'"), 'Notifications preserves Scores filter tab');
assert(notifCode.includes("key: 'performances', label: 'Performances'"), 'Notifications preserves Performances filter tab');
assert(notifCode.includes("key: 'comments', label: 'Comments'"), 'Notifications preserves Comments filter tab');
assert(notifCode.includes("key: 'imports', label: 'Imports'"), 'Notifications preserves Imports filter tab');
assert(notifCode.includes("key: 'system', label: 'System'"), 'Notifications preserves System filter tab');

// -----------------------------------------------------------------------------
// 2. PERFORMANCES ROUTING CONTRACT
// -----------------------------------------------------------------------------
console.log('--- Performances Routing Contract ---');
const perfCode = fs.readFileSync('src/pages/Performances.jsx', 'utf8');
assert(perfCode.includes('to="/practice"'), 'Performances empty state links to /practice');
assert(!perfCode.includes('to="/library"'), 'Performances empty state does NOT link to /library');

// -----------------------------------------------------------------------------
// 3. LIBRARY PRODUCT STRUCTURE & RESUME MODULE
// -----------------------------------------------------------------------------
console.log('--- Library Product Structure & Resume Module ---');
const libCode = fs.readFileSync('src/pages/Library.jsx', 'utf8');
assert(libCode.includes('<LibrarySubRail'), 'Library renders LibrarySubRail for collection navigation');
assert(libCode.includes('continueScore'), 'Library contains continueScore / Resume module');
assert(libCode.includes('Pick up where you left off'), 'Library contains "Pick up where you left off" heading');
assert(libCode.includes('Resume playing'), 'Library contains "Resume playing" action');

// -----------------------------------------------------------------------------
// 4. LANDING RESPONSIVE CONTENT ORDER
// -----------------------------------------------------------------------------
console.log('--- Landing Responsive Content Order ---');
const landingCode = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
const journeyIdx = landingCode.indexOf('journeySteps.map');
const stepsColIdx = landingCode.lastIndexOf('lg:col-span-5', journeyIdx);
const visualColIdx = landingCode.indexOf('lg:col-span-7', journeyIdx);
assert(stepsColIdx !== -1 && visualColIdx !== -1 && stepsColIdx < visualColIdx, 'Landing journey steps list (col-span-5) precedes dynamic preview (col-span-7)');

// -----------------------------------------------------------------------------
// 5. PRACTICE SESSION CONTROL TOGGLE SEMANTICS
// -----------------------------------------------------------------------------
console.log('--- Practice Session Control Toggle Semantics ---');
const practiceCode = fs.readFileSync('src/pages/PracticeSession.jsx', 'utf8');
assert(practiceCode.includes('<Toggle') && practiceCode.includes('aria-label="Loop playback"'), 'PracticeSession uses canonical Toggle for stateful controls');
assert(!practiceCode.includes('<Button intent="primary" onClick={() => setLoop'), 'Loop toggle does NOT use dominant Button intent="primary"');

const pcbCode = fs.readFileSync('src/components/practice/PracticeControlButton.jsx', 'utf8');
assert(pcbCode.includes("from '@/components/ui/toggle'"), 'PracticeControlButton wraps canonical Toggle');
assert(!pcbCode.includes('<button'), 'PracticeControlButton does NOT use raw <button>');
assert(!pcbCode.includes('border-brand bg-neutral-muted'), 'PracticeControlButton does NOT invent custom visual styling');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================ PRODUCT SEMANTICS SUMMARY ================');
console.log(`Total tests:  ${totalTests}`);
console.log(`Passed:       ${passedTests}`);
console.log(`Failed:       ${failedTests}`);
console.log('===========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ All product semantics tests passed successfully.\n');
  process.exit(0);
}
