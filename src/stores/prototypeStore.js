import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  scores as seedScores,
  folders as seedFolders,
  imports as seedImports,
  practiceHistory as seedPracticeHistory,
  practicePerformances as seedPracticePerformances,
  notifications as seedNotifications,
  plans as seedPlans,
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
  if (score && score.ownership !== 'shared') {
    people.push({ id: 'alice', name: 'Alice', email: 'alice@example.com', role: 'Can edit' });
    people.push({ id: 'bob', name: 'Bob', email: 'bob@example.com', role: 'Can view' });
  }
  return {
    scoreId: score ? score.id : null,
    title: score ? score.title : 'Score',
    people,
    link: { access: 'Off', download: false, practice: false, expiration: 'Never', enabled: false, token: null, createdAt: null, expiresAt: null },
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
  renewal: 'Nov 15, 2026',
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
    // Saving a shared score must never broaden access: permissions are inherited
    // from the share link at save time, and a missing permission means denied.
    const saved = score.savedPermission || {};
    return {
      canEdit: false,
      canShare: false,
      canDelete: false,
      canPractice: saved.canPractice === true,
      canDownload: saved.canDownload === true,
    };
  }
  return {};
}

// ---- Token generator ----
function genToken() {
  return `tok-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Expiration calculator ----
function computeExpiresAt(expiration) {
  if (expiration === 'Never' || !expiration) return null;
  const now = new Date();
  if (expiration === '24 hours') return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  if (expiration === '7 days') return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (expiration === '30 days') return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

// ---- Generate mock recognition issues for a new import ----
function generateRecognitionIssues(importId) {
  const templates = [
    { measure: 7, type: 'Missing accidental', detail: 'A sharp not detected on the second beat.', confidence: 'low' },
    { measure: 14, type: 'Wrong rhythm', detail: 'Recognized as a quarter note, looks like an eighth.', confidence: 'medium' },
    { measure: 22, type: 'Extra note', detail: 'An extra note detected between the chord.', confidence: 'low' },
  ];
  return templates.map((t, i) => ({ id: `iss-${importId}-${i}`, ...t, resolved: false }));
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
      practicePerformances: clone(seedPracticePerformances),
      // Remembered technical readiness — what Setup has already prepared.
      preflight: { modelReady: false, micGranted: false, midiConnected: false, cameraGranted: false },
      sharing: {},
      invitations: [],
      revokedShareTokens: [],
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
      getUnresolvedIssueCount: (importId) => {
        const issues = get().recognitionIssues[importId] || [];
        return issues.filter((i) => !i.resolved).length;
      },
      liveScores: () => get().scores.filter((s) => s.ownership !== 'trash'),
      getShareByToken: (token) => {
        const st = get();
        if (!token) return null;
        if ((st.revokedShareTokens || []).includes(token)) {
          return { revoked: true, score: null, sharing: null };
        }
        for (const [scoreId, sharing] of Object.entries(st.sharing)) {
          if (sharing.link && sharing.link.token === token) {
            const score = st.scores.find((s) => s.id === scoreId);
            return { score, sharing };
          }
        }
        return null;
      },
      getInvitation: (token) => get().invitations.find((i) => i.token === token),
      getScoreOrDraft: (id) => {
        const st = get();
        const score = st.scores.find((s) => s.id === id);
        if (score) return score;
        const imp = st.imports.find((i) => i.scoreId === id);
        if (imp && imp.pendingScore) {
          const ps = imp.pendingScore;
          return {
            id: imp.scoreId,
            title: ps.title || imp.title || 'Untitled',
            composer: ps.composer || 'Unknown',
            instrument: ps.instrument || 'Piano',
            tags: ps.tags || [],
            ownership: 'mine',
            favorite: false,
            folderIds: ps.folderIds || [],
            lastPlayed: 'never',
            lastMeasure: 1,
            tempo: 80,
            pages: ps.pages || imp.pages || 1,
            measures: 32,
            difficultSections: [],
            created: new Date().toISOString().slice(0, 10),
            source: ps.source || imp.source || 'PDF',
            currentVersion: 'Current version',
            versionRestoredAt: null,
            _pending: true,
          };
        }
        return null;
      },

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

      saveSharedScoreToLibrary: (scoreId, permissions = {}) =>
        set((st) => {
          const score = st.scores.find((s) => s.id === scoreId);
          if (!score) return {};
          // Don't change ownership if already mine
          if (score.ownership === 'mine') return {};
          // If already saved, no-op
          if (score.ownership === 'saved') return {};
          return {
            scores: st.scores.map((s) =>
              s.id === scoreId ? {
                ...s,
                ownership: 'saved',
                favorite: false,
                folderIds: [],
                created: new Date().toISOString().slice(0, 10),
                // Inherit exactly what the link granted — never more.
                savedPermission: {
                  canPractice: permissions.canPractice === true,
                  canDownload: permissions.canDownload === true,
                },
                sourceShareToken: permissions.shareToken || null,
              } : s
            ),
          };
        }),

      updateScoreLastPlayed: (scoreId, measure) =>
        set((st) => ({
          scores: st.scores.map((s) => (s.id === scoreId ? { ...s, lastPlayed: 'today', lastMeasure: measure || s.lastMeasure } : s)),
        })),

      // ---- Version restore ----
      restoreVersion: (scoreId, versionLabel) =>
        set((st) => ({
          scores: st.scores.map((s) =>
            s.id === scoreId ? { ...s, currentVersion: versionLabel, versionRestoredAt: new Date().toISOString().slice(0, 10) } : s
          ),
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
      // Creates an import with pendingScore — does NOT create a score yet.
      createImport: ({ title, composer, instrument, pages, source, folder }) =>
        set((st) => {
          const importId = `imp-${Date.now()}`;
          const scoreId = `score-${Date.now()}`;
          const folderIds = folder ? [folder] : [];
          const pendingScore = {
            title: title || 'Untitled',
            composer: composer || 'Unknown',
            instrument: instrument || 'Piano',
            tags: [],
            folderIds,
            pages: pages || 1,
            source: source || 'PDF',
          };
          const newImport = {
            id: importId,
            scoreId, // stable from creation — used by Editor and completeImport
            pendingScore,
            title: title || 'Untitled',
            status: 'processing',
            progress: 0,
            started: 'just now',
            pages: pages || 1,
            source: source || 'PDF',
          };
          return {
            imports: [newImport, ...st.imports],
          };
        }),

      // Advances processing imports; when reaching 100, generates recognition issues and sets needs_review.
      advanceImportProgress: () =>
        set((st) => {
          let newRecognitionIssues = { ...st.recognitionIssues };
          const imports = st.imports.map((i) => {
            if (i.status !== 'processing') return i;
            const next = Math.min(100, i.progress + Math.floor(5 + Math.random() * 9));
            if (next >= 100) {
              // Generate recognition issues for this import
              const isMusicXML = i.source === 'Import MusicXML' || i.source === 'MusicXML';
              const issues = isMusicXML ? [] : generateRecognitionIssues(i.id);
              if (issues.length > 0) newRecognitionIssues[i.id] = issues;
              return { ...i, progress: 100, status: 'needs_review' };
            }
            return { ...i, progress: next };
          });
          return { imports, recognitionIssues: newRecognitionIssues };
        }),

      retryImport: (id) =>
        set((st) => ({
          imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 0, failure: undefined } : i)),
        })),

      replaceImportSource: (id) =>
        set((st) => ({
          imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 0, failure: undefined } : i)),
        })),

      removeImport: (id) =>
        set((st) => ({
          imports: st.imports.filter((i) => i.id !== id),
          recognitionIssues: Object.fromEntries(Object.entries(st.recognitionIssues).filter(([k]) => k !== id)),
        })),

      // Completes the import: creates the real score from pendingScore, writes scoreId to import.
      completeImport: (id) =>
        set((st) => {
          const imp = st.imports.find((i) => i.id === id);
          if (!imp) return {};
          // Already completed? Don't duplicate.
          if (imp.status === 'completed' && imp.scoreId) return {};
          const ps = imp.pendingScore || {};
          const scoreId = imp.scoreId;
          const newScore = {
            id: scoreId,
            title: ps.title || imp.title || 'Untitled',
            composer: ps.composer || 'Unknown',
            instrument: ps.instrument || 'Piano',
            tags: ps.tags || [],
            ownership: 'mine',
            favorite: false,
            folderIds: ps.folderIds || [],
            lastPlayed: 'never',
            lastMeasure: 1,
            tempo: 80,
            pages: ps.pages || imp.pages || 1,
            measures: 32,
            difficultSections: [],
            created: new Date().toISOString().slice(0, 10),
            source: ps.source || imp.source || 'PDF',
            currentVersion: 'Current version',
            versionRestoredAt: null,
          };
          // Mark all recognition issues as resolved/archived
          const issues = st.recognitionIssues[id] || [];
          const archivedIssues = issues.map((i) => ({ ...i, resolved: true }));
          return {
            scores: [newScore, ...st.scores],
            imports: st.imports.map((i) => (i.id === id ? { ...i, status: 'completed', scoreId } : i)),
            sharing: { ...st.sharing, [scoreId]: defaultSharing(newScore) },
            recognitionIssues: { ...st.recognitionIssues, [id]: archivedIssues },
            notifications: [
              { id: `n-${Date.now()}`, category: 'imports', title: 'Import complete', body: `${newScore.title} is ready in your library.`, time: 'just now', unread: true, href: `/score/${scoreId}` },
              ...st.notifications,
            ],
          };
        }),

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
            durationSec: session.durationSec ?? null,
            mode: session.mode || 'Follow',
            input: session.input || 'Microphone',
            recordingMode: session.recordingMode || 'off',
            mediaKind: session.mediaKind || null,
            tempoBpm: session.tempoBpm ?? null,
            skippedGroups: session.skippedGroups || 0,
            rangeDetail: session.rangeDetail || null,
            range: session.range || 'Whole score',
            insight: session.insight || 'Nice session.',
            accuracy: session.accuracy,
            trickyFrom: session.trickyFrom,
            trickyTo: session.trickyTo,
          };
          return { practiceSessions: [newSession, ...st.practiceSessions] };
        }),

      // ---- Performances (explicitly kept media) ----
      // Saving is an explicit act: a session can exist with a recording and still
      // never appear in Performances until the user keeps it.
      savePerformance: (performance) =>
        set((st) => {
          const existing = st.practicePerformances.find(
            (p) => p.sessionId && p.sessionId === performance.sessionId
          );
          const record = {
            ...performance,
            id: existing?.id || performance.id || `perf-${Date.now()}`,
          };
          return {
            practicePerformances: existing
              ? st.practicePerformances.map((p) => (p.id === existing.id ? { ...p, ...record } : p))
              : [record, ...st.practicePerformances],
          };
        }),

      deletePerformance: (id) =>
        set((st) => ({ practicePerformances: st.practicePerformances.filter((p) => p.id !== id) })),

      setPreflight: (partial) =>
        set((st) => ({ preflight: { ...st.preflight, ...partial } })),

      // ---- Sharing actions ----
      invitePerson: (scoreId, email, role) =>
        set((st) => {
          const score = st.scores.find((s) => s.id === scoreId);
          const sharing = st.sharing[scoreId] || (score ? defaultSharing(score) : null);
          if (!sharing) return {};
          const personId = `pending-${Date.now()}`;
          const person = { id: personId, name: email, email, role: 'Invitation pending', pendingRole: role || 'Can view' };
          // Also create an invitation record
          const invitation = {
            token: `inv-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            scoreId,
            invitedBy: 'You',
            invitedEmail: email,
            permission: role || 'Can view',
            status: 'pending',
            personId,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          return {
            sharing: { ...st.sharing, [scoreId]: { ...sharing, people: [...sharing.people, person] } },
            invitations: [...st.invitations, invitation],
            notifications: [
              { id: `n-${Date.now()}`, category: 'sharing', title: 'Invitation sent', body: `${email} has been invited to ${score?.title || 'this score'}.`, time: 'just now', unread: true, href: `/score/${scoreId}` },
              ...st.notifications,
            ],
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
          // Also update invitation status
          const person = sharing.people.find((p) => p.id === personId);
          const invitations = person
            ? st.invitations.map((inv) => (inv.scoreId === scoreId && inv.invitedEmail === person.email ? { ...inv, status: 'revoked' } : inv))
            : st.invitations;
          return {
            sharing: { ...st.sharing, [scoreId]: { ...sharing, people: sharing.people.filter((p) => p.id !== personId) } },
            invitations,
          };
        }),

      setLinkAccess: (scoreId, access) =>
        set((st) => {
          const score = st.scores.find((s) => s.id === scoreId);
          const sharing = st.sharing[scoreId] || (score ? defaultSharing(score) : null);
          if (!sharing) return {};
          const enabled = access !== 'Off';
          const now = new Date().toISOString();
          // Generate token when enabling for the first time
          const token = enabled && !sharing.link.token ? genToken() : sharing.link.token;
          return {
            sharing: {
              ...st.sharing,
              [scoreId]: {
                ...sharing,
                link: {
                  ...sharing.link,
                  access,
                  enabled,
                  edit: access === 'Can edit',
                  token: enabled ? token : sharing.link.token,
                  createdAt: enabled && !sharing.link.createdAt ? now : sharing.link.createdAt,
                },
              },
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
          return { sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, expiration, expiresAt: computeExpiresAt(expiration) } } } };
        }),

      disableLink: (scoreId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          const oldToken = sharing.link.token;
          return {
            revokedShareTokens: oldToken ? [...(st.revokedShareTokens || []), oldToken] : (st.revokedShareTokens || []),
            sharing: { ...st.sharing, [scoreId]: { ...sharing, link: { ...sharing.link, access: 'Off', enabled: false, token: null } } },
          };
        }),

      regenerateLink: (scoreId) =>
        set((st) => {
          const sharing = st.sharing[scoreId];
          if (!sharing) return {};
          const oldToken = sharing.link.token;
          return {
            revokedShareTokens: oldToken ? [...(st.revokedShareTokens || []), oldToken] : (st.revokedShareTokens || []),
            sharing: {
              ...st.sharing,
              [scoreId]: { ...sharing, link: { ...sharing.link, token: genToken(), createdAt: new Date().toISOString() } },
            },
          };
        }),

      // ---- Invitation actions ----
      acceptInvitation: (token) =>
        set((st) => {
          const invitation = st.invitations.find((i) => i.token === token);
          if (!invitation || invitation.status !== 'pending') return {};
          const score = st.scores.find((s) => s.id === invitation.scoreId);
          let scores = st.scores;
          let sharing = st.sharing;
          let sharedScoreId = invitation.scoreId;
          if (score) {
            // Create a separate shared copy — don't modify the owner's original
            sharedScoreId = `${score.id}-shared-${invitation.personId}`;
            if (!st.scores.some((s) => s.id === sharedScoreId)) {
              const sharedScore = {
                ...clone(score),
                id: sharedScoreId,
                sourceScoreId: score.id,
                ownership: 'shared',
                sharedBy: invitation.invitedBy,
                permission: invitation.permission,
                favorite: false,
                folderIds: [],
                created: new Date().toISOString().slice(0, 10),
              };
              scores = [sharedScore, ...st.scores];
            }
            // Convert pending person to actual member in sharing
            const scoreSharing = st.sharing[invitation.scoreId];
            if (scoreSharing) {
              sharing = {
                ...st.sharing,
                [invitation.scoreId]: {
                  ...scoreSharing,
                  people: scoreSharing.people.map((p) =>
                    p.id === invitation.personId
                      ? { ...p, role: invitation.permission, pendingRole: undefined }
                      : p
                  ),
                },
              };
            }
          }
          return {
            scores,
            sharing,
            invitations: st.invitations.map((i) => (i.token === token ? { ...i, status: 'accepted', sharedScoreId } : i)),
            notifications: [
              { id: `n-${Date.now()}`, category: 'sharing', title: 'Invitation accepted', body: `${score?.title || 'Score'} — ${invitation.permission}`, time: 'just now', unread: true, href: `/score/${sharedScoreId}` },
              ...st.notifications,
            ],
          };
        }),

      declineInvitation: (token) =>
        set((st) => ({
          invitations: st.invitations.map((i) => (i.token === token ? { ...i, status: 'declined' } : i)),
        })),

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
          practicePerformances: clone(seedPracticePerformances),
          preflight: { modelReady: false, micGranted: false, midiConnected: false, cameraGranted: false },
          sharing: {},
          invitations: [],
          revokedShareTokens: [],
          notifications: clone(seedNotifications),
          subscription: clone(subscriptionSeed),
          billingHistory: clone(seedBillingHistory),
          account: clone(accountSeed),
          preferences: clone(preferencesSeed),
          notificationPrefs: clone(notificationPrefsSeed),
          plans: seedPlans,
        })),
    }),
    {
      name: 'yueora-prototype',
      version: 5,
      migrate: (persistedState, version) => {
        // Merge any missing keys from defaults
        const merged = { ...persistedState };
        if (!merged.invitations) merged.invitations = [];
        if (!merged.revokedShareTokens) merged.revokedShareTokens = [];
        if (!merged.sharing) merged.sharing = {};
        if (!Array.isArray(merged.practicePerformances)) merged.practicePerformances = clone(seedPracticePerformances);
        if (!merged.preflight) merged.preflight = { modelReady: false, micGranted: false, midiConnected: false, cameraGranted: false };
        if (merged.subscription && merged.subscription.renewal === 'Sep 15, 2026') {
          merged.subscription.renewal = 'Nov 15, 2026';
        }
        // Normalize the seed saved score (it was saved from a fully-permitted link).
        // User-saved scores without recorded permissions stay denied by default.
        if (Array.isArray(merged.scores)) {
          merged.scores = merged.scores.map((s) =>
            s.id === 'gymnopedie-1' && !s.savedPermission
              ? { ...s, savedPermission: { canPractice: true, canDownload: true } }
              : s
          );
        }
        // Ensure sharing links have token field
        if (merged.sharing) {
          for (const [sid, sh] of Object.entries(merged.sharing)) {
            if (sh.link && !sh.link.token) {
              sh.link.token = null;
              sh.link.createdAt = null;
              sh.link.expiresAt = null;
            }
          }
        }
        return merged;
      },
    }
  )
);