// Mock domain data for Yueora. UI never sees API DTOs — this stands in for the
// repository layer until real adapters are wired. Brand: "Play what you love."

export const folders = [
  { id: 'piano', name: 'Piano' },
  { id: 'recital', name: 'Recital' },
  { id: 'movies', name: 'Movie themes' },
];

export const scores = [
  {
    id: 'moonlight', title: 'Moonlight Sonata', composer: 'Beethoven', instrument: 'Piano',
    tags: ['Classical', 'Romantic'], ownership: 'mine', favorite: true, folderIds: ['piano', 'recital'],
    lastPlayed: 'yesterday', lastMeasure: 36, tempo: 60, pages: 3, measures: 48,
    difficultSections: [{ from: 34, to: 38, label: 'Measures 34–38', note: 'This section felt trickier last time.' }],
    created: '2026-08-12', source: 'PDF',
  },
  {
    id: 'etude10-4', title: 'Étude Op. 10 No. 4', composer: 'Chopin', instrument: 'Piano',
    tags: ['Classical', 'Étude'], ownership: 'mine', favorite: false, folderIds: ['piano'],
    lastPlayed: '3 days ago', lastMeasure: 1, tempo: 132, pages: 5, measures: 64,
    difficultSections: [], created: '2026-08-20', source: 'PDF',
  },
  {
    id: 'prelude-c', title: 'Prelude in C', composer: 'J. S. Bach', instrument: 'Piano',
    tags: ['Baroque'], ownership: 'mine', favorite: true, folderIds: ['piano'],
    lastPlayed: '2 days ago', lastMeasure: 1, tempo: 84, pages: 2, measures: 35,
    difficultSections: [], created: '2026-07-30', source: 'MusicXML',
  },
  {
    id: 'clair-de-lune', title: 'Clair de Lune', composer: 'Debussy', instrument: 'Piano',
    tags: ['Impressionist'], ownership: 'mine', favorite: false, folderIds: ['recital'],
    lastPlayed: 'last week', lastMeasure: 1, tempo: 66, pages: 4, measures: 52,
    difficultSections: [], created: '2026-06-18', source: 'PDF',
  },
  {
    id: 'nocturne-eb', title: 'Nocturne in E♭', composer: 'Chopin', instrument: 'Piano',
    tags: ['Classical', 'Romantic'], ownership: 'shared', sharedBy: 'Alice', permission: 'Can edit',
    favorite: false, folderIds: [], lastPlayed: 'never', lastMeasure: 1, tempo: 76, pages: 3, measures: 40,
    difficultSections: [], created: '2026-08-25', source: 'Shared',
  },
  {
    id: 'invention-13', title: 'Two-Part Invention No. 13', composer: 'J. S. Bach', instrument: 'Piano',
    tags: ['Baroque'], ownership: 'shared', sharedBy: 'Alice', permission: 'Can view',
    favorite: false, folderIds: [], lastPlayed: '5 days ago', lastMeasure: 1, tempo: 92, pages: 2, measures: 28,
    difficultSections: [], created: '2026-08-22', source: 'Shared',
  },
  {
    id: 'gymnopedie-1', title: 'Gymnopédie No. 1', composer: 'Satie', instrument: 'Piano',
    tags: ['Classical'], ownership: 'saved', favorite: true, folderIds: ['recital'],
    savedPermission: { canPractice: true, canDownload: true },
    lastPlayed: 'never', lastMeasure: 1, tempo: 52, pages: 2, measures: 39,
    difficultSections: [], created: '2026-08-28', source: 'Saved link',
  },
  {
    id: 'arabesque', title: 'Arabesque No. 1', composer: 'Debussy', instrument: 'Piano',
    tags: ['Impressionist'], ownership: 'mine', favorite: false, folderIds: ['piano'],
    lastPlayed: 'last week', lastMeasure: 1, tempo: 72, pages: 3, measures: 44,
    difficultSections: [], created: '2026-05-02', source: 'PDF',
  },
  {
    id: 'interstellar', title: 'Interstellar Main Theme', composer: 'Zimmer', instrument: 'Piano',
    tags: ['Film', 'Modern'], ownership: 'mine', favorite: true, folderIds: ['movies'],
    lastPlayed: '4 days ago', lastMeasure: 12, tempo: 56, pages: 2, measures: 30,
    difficultSections: [{ from: 20, to: 24, label: 'Measures 20–24', note: 'The left-hand arpeggios were a bit unsteady.' }],
    created: '2026-08-30', source: 'Photo',
  },
  {
    id: 'trash-1', title: 'Forgotten Waltz', composer: 'Unknown', instrument: 'Piano',
    tags: ['Draft'], ownership: 'trash', favorite: false, folderIds: [],
    lastPlayed: null, lastMeasure: 1, tempo: 120, pages: 1, measures: 16,
    difficultSections: [], created: '2026-04-10', source: 'PDF', deletedAt: '2026-09-01',
  },
];

export function getScore(id) {
  return scores.find((s) => s.id === id);
}

export function liveScores() {
  return scores.filter((s) => s.ownership !== 'trash');
}

// ---------- Practice Home ----------
export const practiceHome = {
  continuePractice: { scoreId: 'moonlight', title: 'Moonlight Sonata', composer: 'Beethoven', lastPlayed: 'yesterday', measure: 36 },
  recentlyLoved: [
    { scoreId: 'interstellar', title: 'Interstellar Main Theme', composer: 'Zimmer', reason: 'Favorited' },
    { scoreId: 'gymnopedie-1', title: 'Gymnopédie No. 1', composer: 'Satie', reason: 'Saved last week' },
    { scoreId: 'prelude-c', title: 'Prelude in C', composer: 'J. S. Bach', reason: 'Played 2 days ago' },
  ],
  havenPlayed: [
    { scoreId: 'clair-de-lune', title: 'Clair de Lune', composer: 'Debussy', lastPlayed: 'last week' },
    { scoreId: 'arabesque', title: 'Arabesque No. 1', composer: 'Debussy', lastPlayed: 'last week' },
  ],
  trickySection: { scoreId: 'moonlight', title: 'Moonlight Sonata', from: 34, to: 38, label: 'Measures 34–38', note: 'This section felt trickier last time.' },
  thisWeek: { minutes: 62, sessions: 5, pieces: 3, marks: [true, true, false, true, true, false, false] },
};

// ---------- Practice History ----------
export const practiceHistory = [
  { id: 's1', scoreId: 'moonlight', date: 'Sep 8', duration: '18 min', mode: 'Follow', input: 'Microphone', range: 'Measures 32–48', insight: 'Measures 34–38 were the trickiest part.' },
  { id: 's2', scoreId: 'interstellar', date: 'Sep 8', duration: '9 min', mode: 'Performance', input: 'MIDI', range: 'Whole score', insight: 'Tempo held steady throughout.' },
  { id: 's3', scoreId: 'prelude-c', date: 'Sep 7', duration: '12 min', mode: 'Follow', input: 'Microphone', range: 'Whole score', insight: 'Felt smoother than last time.' },
  { id: 's4', scoreId: 'etude10-4', date: 'Sep 5', duration: '22 min', mode: 'Performance', input: 'MIDI', range: 'Measures 1–32', insight: 'A few missed notes in the run.' },
  { id: 's5', scoreId: 'clair-de-lune', date: 'Sep 1', duration: '15 min', mode: 'Follow', input: 'Microphone', range: 'Whole score', insight: 'Nice, relaxed session.' },
];

// ---------- Performances (explicitly kept recordings) ----------
export const practicePerformances = [
  {
    id: 'perf-interstellar', sessionId: 's2', scoreId: 'interstellar', scoreTitle: 'Interstellar Main Theme',
    createdAt: 'Sep 8', duration: '4:22', durationSec: 262, mediaKind: 'video',
    tempo: { mode: 'score', bpm: 56 },
    range: { kind: 'full', startMeasure: 1, endMeasure: 30 },
    rangeLabel: 'Full score', mockMediaUrl: 'mock://video/perf-interstellar', reportId: 's2',
  },
  {
    id: 'perf-etude', sessionId: 's4', scoreId: 'etude10-4', scoreTitle: 'Étude Op. 10 No. 4',
    createdAt: 'Sep 5', duration: '3:10', durationSec: 190, mediaKind: 'audio',
    tempo: { mode: 'fixed', bpm: 120 },
    range: { kind: 'section', startGroupId: 'g1-1', endGroupId: 'g32-2', startMeasure: 1, endMeasure: 32 },
    rangeLabel: 'Measures 1–32', mockMediaUrl: 'mock://audio/perf-etude', reportId: 's4',
  },
];

// ---------- Practice Progress ----------
export const practiceProgress = {
  weeklyMinutes: [42, 38, 55, 62, 48, 60, 62],
  piecesPlayed: 6,
  sessions: 18,
  tempoTrend: [
    { label: 'Moonlight', scoreId: 'moonlight', values: [54, 56, 58, 60] },
    { label: 'Interstellar', scoreId: 'interstellar', values: [50, 52, 54, 56] },
  ],
  recurringTricky: [
    { scoreId: 'moonlight', label: 'Measures 34–38', note: 'Showing up across sessions — getting steadier.' },
    { scoreId: 'interstellar', label: 'Measures 20–24', note: 'Left-hand arpeggios still a little unsteady.' },
  ],
  smoother: [
    { scoreId: 'prelude-c', title: 'Prelude in C', note: 'Fewer missed notes than two weeks ago.' },
    { scoreId: 'clair-de-lune', title: 'Clair de Lune', note: 'Tempo is more even now.' },
  ],
};

// ---------- Notifications ----------
export const notifications = [
  { id: 'n1', category: 'imports', title: 'Your score is ready to review', body: 'Prelude in C — recognition finished', time: '2m', unread: true, href: '/imports/imp-prelude' },
  { id: 'n2', category: 'sharing', title: 'Alice accepted your invitation', body: 'Nocturne in E♭ — Can edit', time: '1h', unread: true, href: '/score/nocturne-eb' },
  { id: 'n3', category: 'imports', title: 'Recognition finished', body: 'Prelude in C is ready to practice', time: '5h', unread: false, href: '/imports/imp-prelude' },
  { id: 'n4', category: 'sharing', title: 'Ben invited you to view', body: 'Clair de Lune — Can view', time: '1d', unread: false, href: '/invite/clair' },
  { id: 'n5', category: 'security', title: 'New sign-in on Chrome', body: 'If this was you, no action is needed.', time: '1d', unread: false, href: '/settings/security' },
  { id: 'n6', category: 'billing', title: 'Pro renewal in 7 days', body: 'Your plan renews on Nov 15.', time: '2d', unread: false, href: '/settings/plan' },
  { id: 'n7', category: 'practice', title: 'Feel like playing something today?', body: 'It’s been a few days since Moonlight Sonata.', time: '3d', unread: false, href: '/practice' },
];

// ---------- Imports ----------
export const imports = [
  { id: 'imp-moonlight', scoreId: 'moonlight', title: 'Moonlight Sonata', status: 'processing', progress: 62, started: '3 minutes ago', pages: 3, source: 'PDF', issues: 0 },
  { id: 'imp-prelude', scoreId: 'prelude-c', title: 'Prelude in C', status: 'needs_review', progress: 100, started: '12 minutes ago', pages: 2, source: 'PDF', issues: 3 },
  { id: 'imp-etude', scoreId: 'etude10-4', title: 'Étude Op. 10 No. 4', status: 'failed', progress: 0, started: '1 hour ago', pages: 5, source: 'PDF', issues: 0, failure: 'Could not detect staff lines on page 2. Try a higher-contrast scan or rotate the page.' },
  { id: 'imp-clair', scoreId: 'clair-de-lune', title: 'Clair de Lune', status: 'completed', progress: 100, started: 'yesterday', pages: 4, source: 'PDF', issues: 0 },
];

export function getImport(id) {
  return imports.find((i) => i.id === id);
}

// ---------- Recognition Review ----------
export function getRecognitionIssues(importId) {
  const imp = getImport(importId) || imports[1];
  return {
    importId: imp.id,
    scoreId: imp.scoreId,
    title: imp.title,
    issues: [
      { id: 'i1', measure: 7, type: 'Missing accidental', detail: 'A sharp not detected on the second beat.', confidence: 'low', resolved: false },
      { id: 'i2', measure: 14, type: 'Wrong rhythm', detail: 'Recognized as a quarter note, looks like an eighth.', confidence: 'medium', resolved: false },
      { id: 'i3', measure: 22, type: 'Extra note', detail: 'An extra note detected between the chord.', confidence: 'low', resolved: false },
    ],
  };
}

// ---------- Sharing ----------
export function getSharing(scoreId) {
  const score = getScore(scoreId);
  return {
    title: score?.title ?? 'Score',
    people: [
      { id: 'you', name: 'You', email: '', role: 'Owner' },
      { id: 'alice', name: 'Alice', email: 'alice@example.com', role: 'Can edit' },
      { id: 'bob', name: 'Bob', email: 'bob@example.com', role: 'Can view' },
      { id: 'pending1', name: 'charlie@example.com', email: 'charlie@example.com', role: 'Invitation pending' },
    ],
    link: { access: 'Can view', download: true, practice: true, edit: false, expiration: 'Never', enabled: true },
  };
}

// ---------- Shared Score (external) ----------
export function getSharedScore(token) {
  let status = 'valid';
  if (token?.includes('expired')) status = 'expired';
  else if (token?.includes('revoked')) status = 'revoked';
  else if (token?.includes('invalid')) status = 'invalid';
  else if (token?.includes('removed')) status = 'removed';
  const score = getScore(token) || scores.find((s) => s.ownership === 'mine') || scores[0];
  return { score, sharedBy: 'Alice', canPractice: true, canDownload: true, canEdit: false, status };
}

// ---------- Invitations ----------
export function getInvite(token) {
  const score = getScore(token) || scores.find((s) => s.ownership === 'shared') || scores[0];
  let status = 'valid';
  if (token?.includes('expired')) status = 'expired';
  else if (token?.includes('revoked')) status = 'revoked';
  else if (token?.includes('accepted')) status = 'already_accepted';
  else if (token?.includes('wrong')) status = 'wrong_account';
  return { score, invitedBy: 'Alice', invitedEmail: 'alice@example.com', permission: 'Can edit', status };
}

// ---------- Plans ----------
export const plans = {
  free: {
    id: 'free', name: 'Free', priceMonthly: 0, priceYearly: 0,
    scores: '5 scores', imports: '10 imports / month', analytics: false,
    storage: '500 MB', sharing: 'View only', export: false, practice: true,
  },
  pro: {
    id: 'pro', name: 'Pro', priceMonthly: 6, priceYearly: 60,
    scores: 'Unlimited', imports: 'Unlimited', analytics: true,
    storage: '10 GB', sharing: 'View & edit', export: true, practice: true,
  },
};

export const currentPlan = {
  plan: 'pro', renewal: 'Nov 15, 2026', payment: 'Visa ending 4242',
  usage: { scores: 8, scoreLimit: 'Unlimited', imports: 14, importLimit: 'Unlimited', storage: '1.2 GB', storageLimit: '10 GB' },
};

export const billingHistory = [
  { id: 'b1', date: 'Aug 15, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'INV-2026-08' },
  { id: 'b2', date: 'Jul 15, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'INV-2026-07' },
  { id: 'b3', date: 'Jun 15, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'INV-2026-06' },
];

// ---------- Practice Summary ----------
export function buildSummary(scoreId) {
  const score = getScore(scoreId);
  const hero = ['That felt smoother.', 'Nice session.', 'Good to be back at this one.', 'That came together nicely.'];
  const h = hero[(scoreId || '').length % hero.length];
  return {
    scoreId,
    title: score?.title ?? 'Score',
    composer: score?.composer ?? '',
    hero: h,
    insight: 'Measures 34–38 were still the trickiest part today.',
    trickySection: { from: 34, to: 38, label: 'Measures 34–38' },
    accuracy: 88,
    timing: 'Steady',
    duration: '12:42',
    tempo: '60 BPM',
    missing: 3,
    unexpected: 2,
    compared: { accuracy: '+4%', errors: -7, tempo: '+8 BPM' },
  };
}

// ---------- Help articles ----------
export const helpCategories = [
  'Getting started', 'Adding music', 'Recognition & editing', 'Practice', 'Library', 'Sharing', 'Account & billing', 'Privacy',
];

export const helpArticles = [
  { slug: 'add-first-score', category: 'Getting started', title: 'Add your first score', updated: 'Sep 1, 2026', excerpt: 'Bring in a PDF, photos, or MusicXML and turn it into something playable.',
    body: ['Yueora is built around the music you actually want to play. To start, add a score from anywhere using the Add score button.', 'You can upload a PDF, capture pages with your camera, or import a MusicXML file. After a short recognition step, your score becomes interactive.', 'You can leave the page while recognition runs — we’ll let you know when it’s ready to review.'], related: ['supported-formats', 'review-recognition'] },
  { slug: 'tour-practice', category: 'Getting started', title: 'A quick tour of Practice', updated: 'Sep 1, 2026', excerpt: 'Practice is about picking up where you left off — not assignments.',
    body: ['Practice Home asks a simple question: what do you feel like playing today?', 'You’ll see where you left off, music you’ve enjoyed recently, and a section that felt tricky last time — offered as an invitation, never a task.', 'There are no streaks to protect and no overdue items. Come back whenever you like.'], related: ['practice-setup', 'practice-feedback'] },
  { slug: 'supported-formats', category: 'Adding music', title: 'Supported file formats', updated: 'Aug 28, 2026', excerpt: 'PDF, PNG, JPG, and MusicXML. Multi-page PDFs are split automatically.',
    body: ['Yueora accepts PDF, PNG, and JPG images, plus MusicXML for scores you already have in a digital format.', 'Multi-page PDFs are split into pages automatically. For photos, try to keep pages flat and evenly lit for the best recognition.'], related: ['add-first-score', 'fix-recognition-errors'] },
  { slug: 'fix-recognition-errors', category: 'Recognition & editing', title: 'Fixing recognition errors', updated: 'Aug 30, 2026', excerpt: 'Review what was recognized, then correct anything that’s off in the editor.',
    body: ['After recognition, scores that need a look go to Needs review. The review screen shows the original scan next to the recognized score, with any uncertain spots highlighted.', 'You can confirm it looks good, or open the editor to fix specific notes. The editor is designed for quick corrections, not full engraving.'], related: ['review-recognition', 'editor-basics'] },
  { slug: 'review-recognition', category: 'Recognition & editing', title: 'Reviewing recognition', updated: 'Aug 30, 2026', excerpt: 'Confirm the recognized score looks right before you practice.',
    body: ['Review and editing are different tasks. Review asks: did the system get this mostly right? Editor asks: what specifically do I want to change?', 'In review, each issue links to its measure. Confirm to finish, or jump into the editor to fix it.'], related: ['fix-recognition-errors', 'editor-basics'] },
  { slug: 'editor-basics', category: 'Recognition & editing', title: 'Editor basics', updated: 'Aug 30, 2026', excerpt: 'Select, add, and correct notes without leaving the score.',
    body: ['The editor opens full-screen with a tool rail, the score canvas, and an inspector for the selected note.', 'Select a note to change its pitch, duration, stem, or fingering. You can also add rests, ties, and slurs, and undo or redo as you go.'], related: ['fix-recognition-errors'] },
  { slug: 'practice-setup', category: 'Practice', title: 'Setting up a practice session', updated: 'Sep 2, 2026', excerpt: 'Choose a mode, input, range, and tempo before you start.',
    body: ['Before a session you pick a mode (follow notes or performance), an input (microphone or MIDI), a range, and a tempo.', 'You can slow the playback speed without changing the score’s original tempo, and turn on a metronome and count-in.'], related: ['practice-feedback', 'tour-practice'] },
  { slug: 'practice-feedback', category: 'Practice', title: 'How feedback works', updated: 'Sep 2, 2026', excerpt: 'Feedback is calm and informational — never a grade.',
    body: ['During a session, Yueora can show whether a note matched, what’s coming next, and where things felt uncertain.', 'You won’t see a failing score or a judgment. Afterward, the summary leads with how it felt, then offers details if you want them.'], related: ['practice-setup', 'practice-summary'] },
  { slug: 'practice-summary', category: 'Practice', title: 'Reading your practice summary', updated: 'Sep 2, 2026', excerpt: 'The summary leads with a feeling, then the details.',
    body: ['Each summary opens with a short, human line about the session, then highlights the trickiest part and invites you to try it again.', 'Accuracy, timing, and tempo are there as information — not a grade. You can compare with last time, replay, or head back.'], related: ['practice-feedback'] },
  { slug: 'organize-library', category: 'Library', title: 'Organize your library', updated: 'Aug 25, 2026', excerpt: 'Folders, favorites, and ownership views keep things tidy.',
    body: ['Your library separates All music, Mine, Shared with me, Saved, and Favorites. Folders live inside the library for finer grouping.', 'You can create, rename, and delete folders, and move scores between them. Deleting a folder never deletes the scores inside.'], related: ['trash-and-restore', 'sharing-basics'] },
  { slug: 'trash-and-restore', category: 'Library', title: 'Trash and restoring scores', updated: 'Aug 25, 2026', excerpt: 'Deleted scores go to Trash, where you can restore or remove them for good.',
    body: ['When you remove a score you own, it moves to Trash. From there you can restore it or delete it permanently.', 'Shared and saved scores use “Leave” and “Remove from library” instead — they don’t go to Trash.'], related: ['organize-library'] },
  { slug: 'sharing-basics', category: 'Sharing', title: 'Sharing a score', updated: 'Aug 20, 2026', excerpt: 'Invite people by email, or turn on a link with the permissions you choose.',
    body: ['Sharing has two parts: People (named access with roles) and General access (a link anyone with the URL can use).', 'You can allow viewing, editing, downloading, and practicing, and set an expiration. Pending invitations show as pending until accepted.'], related: ['invite-accept', 'shared-score-access'] },
  { slug: 'invite-accept', category: 'Sharing', title: 'Accepting an invitation', updated: 'Aug 20, 2026', excerpt: 'Invitations are tied to an email — use the matching account to accept.',
    body: ['An invitation is sent to a specific email address. To accept, sign in with that account.', 'If you’re signed in with a different email, you’ll be asked to switch accounts. You can also decline an invitation.'], related: ['sharing-basics', 'shared-score-access'] },
  { slug: 'shared-score-access', category: 'Sharing', title: 'Opening a shared score link', updated: 'Aug 20, 2026', excerpt: 'Public links let people view, and sometimes practice or download.',
    body: ['A shared score link opens a public view of the score. Depending on permissions, you may be able to practice or download.', 'To save it to your own library, sign in or create an account. If a link has expired or been revoked, you’ll see a clear message.'], related: ['sharing-basics'] },
  { slug: 'change-plan', category: 'Account & billing', title: 'Change your plan', updated: 'Sep 1, 2026', excerpt: 'Upgrade, downgrade, or cancel from Settings → Plan & billing.',
    body: ['Free includes a small library and monthly imports. Pro removes those limits and adds analytics, editing sharing, and export.', 'You can change or cancel your plan anytime. Changes take effect at your next renewal.'], related: ['export-data', 'billing-history'] },
  { slug: 'billing-history', category: 'Account & billing', title: 'Billing history and invoices', updated: 'Sep 1, 2026', excerpt: 'View past payments and download invoices.',
    body: ['Your billing history lists each payment with its invoice number. You can download any invoice for your records.'], related: ['change-plan'] },
  { slug: 'export-data', category: 'Privacy', title: 'Export or delete your data', updated: 'Aug 22, 2026', excerpt: 'Download a copy of your data, or permanently delete your account.',
    body: ['In Settings → Data & Privacy you can export everything Yueora holds for you, or delete your account entirely.', 'Account deletion is permanent and can’t be undone. You’ll be asked to confirm by typing a phrase.'], related: ['change-plan'] },
];

export function getHelpArticle(slug) {
  return helpArticles.find((a) => a.slug === slug);
}

// ---------- Notes generator (editor canvas) ----------
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
export function generateNotes(scoreId) {
  let s = hashStr(scoreId || 'score');
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const durations = ['1', '2', '4', '8'];
  const notes = [];
  let id = 0;
  for (let staff = 0; staff < 2; staff++) {
    for (let measure = 0; measure < 4; measure++) {
      let x = 14 + rnd() * 16;
      const measureW = 168;
      while (x < measureW - 16) {
        const step = Math.floor(rnd() * 9);
        const duration = durations[Math.floor(rnd() * 4)];
        notes.push({ id: `n${id++}`, staff, measure, x, step, duration });
        const w = duration === '1' ? 56 : duration === '2' ? 40 : duration === '4' ? 26 : 18;
        x += w + 6 + rnd() * 8;
      }
    }
  }
  return notes;
}