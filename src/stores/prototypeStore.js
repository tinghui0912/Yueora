import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  scores as seedScores,
  folders as seedFolders,
  imports as seedImports,
  practiceHistory as seedPracticeHistory,
  practiceProgress as seedPracticeProgress,
  notifications as seedNotifications,
  plans as seedPlans,
  currentPlan as seedCurrentPlan,
  billingHistory as seedBillingHistory,
} from '@/lib/mockData';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ---- Recognition issues seed (per import) ----
const recognitionIssuesSeed = {
  'imp-prelude': [
    { id: 'i1', measure: 7, type: 'Missing accidental', detail: 'A sharp not detected on the second beat.', confidence: 'low', resolved: false },
    { id: 'i2', measure: 14, type: 'Wrong rhythm', detail: 'Recognized as a quarter note, looks like an eighth.', confidence: 'medium', resolved: false },
    { id: 'i3', measure: 22, type: 'Extra note', detail: 'An extra note detected between the chord.', confidence: 'low', resolved: false },
  ],
};

// ---- Sharing seed (per score) ----
function defaultSharing(score) {
  const people = [{ id: 'you', name: 'You', email: 'you@example.com', role: 'Owner' }];
  if (score.ownership !== 'shared') {
    people.push({ id: 'alice', name: 'Alice', email: 'alice@example.com', role: 'Can edit' });
    people.push({ id: 'bob', name: 'Bob', email: 'bob@example.com', role: 'Can view' });
  }
  return {
    scoreId: score.id,
    title: score.title,
    people,
    link: { access: 'Off', download: false, practice: false, expiration: 'Never', enabled: false },
  };
}

// ---- Account / security seed ----
const accountSeed = {
  avatar: null,
  email: 'you@example.com',
  passkeys: [],
  sessions: [
    { id: 's1', device: 'MacBook Pro', browser: 'Chrome', location: 'Current session', current: true },
    { id: 's2', device: 'iPhone 15', browser: 'Safari', location: 'San Francisco', current: false },
  ],
};

const subscriptionSeed = {
  plan: 'pro',
  status: 'active',
  renewal: 'Sep 15, 2026',
  cancelAt: null,
  pendingPlan: null,
  payment: { method: 'Visa', last4: '4242' },
  usage: { scores: 8, imports: 14, storage: '1.2 GB' },
};

const preferencesSeed = {
  metronome: true,
  countIn: true,
  autoScroll: true,
  notationSize: 70,
  tempo: 90,
  pageFit: 'width',
  appearance: 'system',
  language: 'English',
};

const notificationPrefsSeed = {
  imports: { inApp: true, email: true },
  sharing: { inApp: true, email: true },
  security: { inApp: true, email: true },
  billing: { inApp: true, email: false },
  practice: { inApp: true, email: false },
  updates: { inApp: false, email: false },
};

// ---- Permission helpers ----
export function getPermissions(score) {
  if (!score) return {};
  const o = score.ownership;
  if (o === 'mine') return { canEdit: true, canShare: true, canDelete: true, canPractice: true, canDownload: true };
  if (o === 'shared') {
    const canEdit = score.permission === 'Can edit';
    return { canEdit, canShare: false, canDelete: false, canPractice: true, canDownload: canEdit };
  }
  if (o === 'saved') {
    return { canEdit: false, canShare: false, canDelete: false, canPractice: score.linkPermission !== 'Can view only', canDownload: score.linkPermission !== 'Can view only' };
  }
  return {};
}

// ---- Store ----
export const usePrototypeStore = create(
  persist(
    (set, get) => ({
      // ---- State ----
      scores: clone(seedScores),
      folders: clone(seedFolders),
      imports: clone(seedImports),
      recognitionIssues: clone(recognitionIssuesSeed),
      practiceSessions: clone(seedPracticeHistory),
      practiceProgress: clone(seedPracticeProgress),
      sharing: {},
      notifications: clone(seedNotifications),
      subscription: clone(subscriptionSeed),
      billingHistory: clone(seedBillingHistory),
      account: clone(accountSeed),
      preferences: clone(preferencesSeed),
      notificationPrefs: clone(notificationPrefsSeed),
      plans: seedPlans,

      // ---- Selectors ----
      getScore: (id) => get().scores.find((s) => s.id === id),
      getImport: (id) => get().imports.find((i) => i.id === id),
      getSharing: (scoreId) => {
        const st = get();
        const score = st.scores.find((s) => s.id === scoreId);
        if (!score) return null;
        return st.sharing[scoreId] || defaultSharing(score);
      },
      getRecognitionIssues: (importId) => get().recognitionIssues[importId] || [],
      liveScores: () => get().scores.filter((s) => s.ownership !== 'trash'),

      // ---- Score actions ----
      toggleScoreFavorite: (id) =>
        set((st) => ({ scores: st.scores.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)) })),

      moveOwnedScoreToTrash: (id) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            s.id === id && s.ownership === 'mine'
              ? { ...s, ownership: 'trash', deletedAt: new Date().toISOString().slice(0, 10) }
              : s
          ),
        })),

      restoreScore: (id) =>
        set((st) => ({
          scores: st.scores.map((s) => (s.id === id ? { ...s, ownership: 'mine', deletedAt: undefined } : s)),
        })),

      deleteScoreForever: (id) =>
        set((st) => ({ scores: st.scores.filter((s) => s.id !== id) })),

      emptyTrash: () =>
        set((st) => ({ scores: st.scores.filter((s) => s.ownership !== 'trash') })),

      leaveSharedScore: (id) =>
        set((st) => ({ scores: st.scores.filter((s) => s.id !== id) })),

      removeSavedScore: (id) =>
        set((st) => ({ scores: st.scores.filter((s) => s.id !== id) })),

      duplicateScore: (id) =>
        set((st) => {
          const score = st.scores.find((s) => s.id === id);
          if (!score) return {};
          const copy = {
            ...clone(score),
            id: `${score.id}-copy-${Date.now()}`,
            title: `${score.title} (copy)`,
            ownership: 'mine',
            favorite: false,
            created: new Date().toISOString().slice(0, 10),
            lastPlayed: 'never',
            lastMeasure: 1,
            folderIds: [],
          };
          return { scores: [copy, ...st.scores] };
        }),

      moveScoreToFolder: (scoreId, folderId) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            s.id === scoreId ? { ...s, folderIds: [...new Set([...s.folderIds, folderId])] } : s
          ),
        })),

      moveScoresToFolder: (scoreIds, folderId) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            scoreIds.includes(s.id) ? { ...s, folderIds: [...new Set([...s.folderIds, folderId])] } : s
          ),
        })),

      favoriteScores: (scoreIds) =>
        set((st) => ({
          scores: st.scores.map((s) => (scoreIds.includes(s.id) ? { ...s, favorite: true } : s)),
        })),

      bulkTrashOwned: (scoreIds) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            scoreIds.includes(s.id) && s.ownership === 'mine'
              ? { ...s, ownership: 'trash', deletedAt: new Date().toISOString().slice(0, 10) }
              : s
          ),
        })),

      bulkLeaveShared: (scoreIds) =>
        set((st) => ({ scores: st.scores.filter((s) => !scoreIds.includes(s.id) || s.ownership !== 'shared') })),

      bulkRemoveSaved: (scoreIds) =>
        set((st) => ({ scores: st.scores.filter((s) => !scoreIds.includes(s.id) || s.ownership !== 'saved') })),

      saveSharedScoreToLibrary: (scoreId) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            s.id === scoreId ? { ...s, ownership: 'saved', favorite: false, folderIds: [], created: new Date().toISOString().slice(0, 10) } : s
          ),
        })),

      updateScoreLastPlayed: (scoreId, measure) =>
        set((st) => ({
          scores: st.scores.map((s) => (s.id === scoreId ? { ...s, lastPlayed: 'today', lastMeasure: measure || s.lastMeasure } : s)),
        })),

      // ---- Folder actions ----
      createFolder: (name) =>
        set((st) => {
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `folder-${Date.now()}`;
          if (st.folders.some((f) => f.id === id)) return {};
          return { folders: [...st.folders, { id, name }] };
        }),

      renameFolder: (id, name) =>
        set((st) => ({ folders: st.folders.map((f) => (f.id === id ? { ...f, name } : f)) })),

      deleteFolder: (id) =>
        set((st) => ({
          folders: st.folders.filter((f) => f.id !== id),
          scores: st.scores.map((s) => ({ ...s, folderIds: s.folderIds.filter((fid) => fid !== id) })),
        })),

      // ---- Import actions ----
      createImport: ({ title, composer, instrument, pages, source, folder }) =>
        set((st) => {
          const importId = `imp-${Date.now()}`;
          const scoreId = `score-${Date.now()}`;
          const folderIds = folder ? [folder] : [];
          const newScore = {
            id: scoreId,
            title: title || 'Untitled',
            composer: composer || 'Unknown',
            instrument: instrument || 'Piano',
            tags: [],
            ownership: 'mine',
            favorite: false,
            folderIds,
            lastPlayed: 'never',
            lastMeasure: 1,
            tempo: 80,
            pages: pages || 1,
            measures: 32,
            difficultSections: [],
            created: new Date().toISOString().slice(0, 10),
            source: source || 'PDF',
          };
          const newImport = {
            id: importId,
            scoreId,
            title: title || 'Untitled',
            status: 'processing',
            progress: 0,
            started: 'just now',
            pages: pages || 1,
            source: source || 'PDF',
            issues: 0,
          };
          return {
            scores: [newScore, ...st.scores],
            imports: [newImport, ...st.imports],
            sharing: { ...st.sharing, [scoreId]: defaultSharing(newScore) },
          };
        }),

      advanceImportProgress: () =>
        set((st) => ({
          imports: st.imports.map((i) => {
            if (i.status !== 'processing') return i;
            const next = Math.min(100, i.progress + Math.floor(5 + Math.random() * 9));
            if (next >= 100) return { ...i, progress: 100, status: 'needs_review', issues: 3 };
            return { ...i, progress: next };
          }),
        })),

      retryImport: (id) =>
        set((st) => ({
          imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 0, failure: undefined } : i)),
        })),

      replaceImportSource: (id) =>
        set((st) => ({
          imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 0, failure: undefined } : i)),
        })),

      removeImport: (id) =>
        set((st) => ({ imports: st.imports.filter((i) => i.id !== id) })),

      completeImport: (id) =>
        set((st) => ({
          imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'completed', issues: 0 } : i)),
        })),

      // ---- Recognition issue actions ----
      resolveRecognitionIssue: (importId, issueId) =>
        set((st) => {
          const issues = st.recognitionIssues[importId];
          if (!issues) return {};
          return {
            recognitionIssues: {
              ...st.recognitionIssues,
              [importId]: issues.map((i) => (i.id === issueId ? { ...i, resolved: !i.resolved } : i)),
            },
          };
        }),

      // ---- Practice session actions ----
      addPracticeSession: (session) =>
        set((st) => {
          const id = session.id || `s-${Date.now()}`;
          const newSession = {
            id,
            scoreId: session.scoreId,
            date: 'Today',
            duration: session.duration || '12 min',
            mode: session.mode || 'Follow',
            input: session.input || 'Microphone',
            range: session.range || 'Whole score',
            insight: session.insight || 'Nice session.',
            accuracy: session.accuracy,
            trickyFrom: session.trickyFrom,
            trickyTo: session.trickyTo,
          };
          return { practiceSessions: [newSession, ...st.practiceSessions] };
        }),

      // ---- Sharing actions ----
      invitePerson: (scoreId, email, role) =>
        set((st) => {
          const sharing = st.sharing[scoreId] || defaultSharing(st.scores.find((s) => s.id === scoreId) || {});
          if (!sharing) return {};
          const person = { id: `pending-${Date.now()}`, name: email, email, role: 'Invitation pending', pendingRole: role || 'Can view' };
          return {
            sharing: { ...st.sharing, [scoreId]: { ...sharing, people: [...sharing.people, person] } },
          };
        }),

      changeMemberRole: (scoreId, personId, role) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return {
            sharing: {
              ...st.sharing,
              [scoreId]: {
                ...sharing,
                people: sharing.people.map((p) => (p.id === personId ? { ...p, role: p.role === 'Invitation pending' ? 'Invitation pending' : role, pendingRole: p.role === 'Invitation pending' ? role : p.pendingRole } : p)),
              },
            },
          };
        }),

      removeMember: (scoreId, personId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return {
            sharing: { ...st.sharing, [scoreId]: { ...sharing, people: sharing.people.filter((p) => p.id !== personId) } },
          };
        }),

      resendInvitation: (scoreId, personId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return {
            sharing: {
              ...st.sharing,
              [scoreId]: { ...sharing, people: sharing.people.map((p) => (p.id === personId ? { ...p, resentAt: Date.now() } : p)) },
            },
          };
        }),

      revokeInvitation: (scoreId, personId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return {
            sharing: { ...st.sharing, [scoreId]: { ...sharing, people: sharing.people.filter((p) => p.id !== personId) } },
          };
        }),

      setLinkAccess: (scoreId, access) =>
        set((st) => {
          const sharing = st.sharing[scoreId] || defaultSharing(st.scores.find((s) => s.id === scoreId) || {});
          if (!sharing) return {};
          const enabled = access !== 'Off';
          return {
            sharing: {
              ...st.sharing,
              [scoreId]: { ...sharing, link: { ...sharing.link, access, enabled, edit: access === 'Can edit' } },
            },
          };
        }),

      setLinkDownload: (scoreId, val) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, download: val } } } };
        }),

      setLinkPractice: (scoreId, val) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, practice: val } } } };
        }),

      setLinkExpiration: (scoreId, expiration) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, expiration } } } };
        }),

      disableLink: (scoreId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, access: 'Off', enabled: false } } } };
        }),

      regenerateLink: (scoreId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, token: `tok-${Date.now()}` } } } };
        }),

      // ---- Notification actions ----
      markNotificationRead: (id) =>
        set((st) => ({ notifications: st.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) })),

      markAllNotificationsRead: () =>
        set((st) => ({ notifications: st.notifications.map((n) => ({ ...n, unread: false })) })),

      // ---- Subscription actions ----
      upgradeToPro: () =>
        set((st) => ({
          subscription: { ...st.subscription, plan: 'pro', status: 'active', cancelAt: null, pendingPlan: null },
        })),

      cancelSubscription: () =>
        set((st) => ({
          subscription: { ...st.subscription, status: 'cancelling', cancelAt: st.subscription.renewal, pendingPlan: 'free' },
        })),

      resumeSubscription: () =>
        set((st) => ({
          subscription: { ...st.subscription, status: 'active', cancelAt: null, pendingPlan: null },
        })),

      downgradeToFree: () =>
        set((st) => ({
          subscription: { ...st.subscription, status: 'cancelling', cancelAt: st.subscription.renewal, pendingPlan: 'free' },
        })),

      updatePayment: (method, last4) =>
        set((st) => ({ subscription: { ...st.subscription, payment: { method, last4 } } })),

      // ---- Account actions ----
      setAvatar: (avatar) => set((st) => ({ account: { ...st.account, avatar } })),
      updateEmail: (email) => set((st) => ({ account: { ...st.account, email } })),
      addPasskey: (name) =>
        set((st) => ({
          account: { ...st.account, passkeys: [...st.account.passkeys, { id: `pk-${Date.now()}`, name: name || 'Passkey', addedAt: 'Today' }] },
        })),
      removePasskey: (id) =>
        set((st) => ({ account: { ...st.account, passkeys: st.account.passkeys.filter((p) => p.id !== id) } })),
      signOutSession: (id) =>
        set((st) => ({ account: { ...st.account, sessions: st.account.sessions.filter((s) => s.id !== id) } })),
      signOutAllOther: () =>
        set((st) => ({ account: { ...st.account, sessions: st.account.sessions.filter((s) => s.current) } })),

      // ---- Preferences & notifications ----
      updatePreferences: (partial) =>
        set((st) => ({ preferences: { ...st.preferences, ...partial } })),
      toggleNotificationPref: (cat, channel) =>
        set((st) => ({
          notificationPrefs: {
            ...st.notificationPrefs,
            [cat]: { ...st.notificationPrefs[cat], [channel]: !st.notificationPrefs[cat][channel] },
          },
        })),

      // ---- Reset ----
      resetPrototype: () =>
        set(() => ({
          scores: clone(seedScores),
          folders: clone(seedFolders),
          imports: clone(seedImports),
          recognitionIssues: clone(recognitionIssuesSeed),
          practiceSessions: clone(seedPracticeHistory),
          practiceProgress: clone(seedPracticeProgress),
          sharing: {},
          notifications: clone(seedNotifications),
          subscription: clone(subscriptionSeed),
          billingHistory: clone(seedBillingHistory),
          account: clone(accountSeed),
          preferences: clone(preferencesSeed),
          notificationPrefs: clone(notificationPrefsSeed),
          plans: seedPlans,
        })),
    }),
    { name: 'yueora-prototype' }
  )
);