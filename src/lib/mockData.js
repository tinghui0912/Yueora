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
    // Editing, practising and downloading are granted separately.
    permissions: { practice: true, download: true },
    favorite: false, folderIds: [], lastPlayed: 'never', lastMeasure: 1, tempo: 76, pages: 3, measures: 40,
    difficultSections: [], created: '2026-08-25', source: 'Shared',
  },
  {
    id: 'invention-13', title: 'Two-Part Invention No. 13', composer: 'J. S. Bach', instrument: 'Piano',
    tags: ['Baroque'], ownership: 'shared', sharedBy: 'Alice', permission: 'Can view',
    // View only: no practising, no download, no editing.
    permissions: { practice: false, download: false },
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

// ---------- Team ----------
export const teamMembers = [
  { id: 'alice', name: 'Alice Chen', email: 'alice@example.com', role: 'Member' },
  { id: 'bob', name: 'Bob Ramirez', email: 'bob@example.com', role: 'Member' },
  { id: 'dana', name: 'Dana Okafor', email: 'dana@example.com', role: 'Member' },
];

const daysAgo = (n, hour = 18, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ---------- Practice Activity (lightweight, no scoring, no media) ----------
export const practiceActivities = [
  { id: 'act-moon', ownerId: 'you', scoreId: 'moonlight', scoreTitleSnapshot: 'Moonlight Sonata', mode: 'follow', startedAt: daysAgo(0, 9, 12), completedAt: daysAgo(0, 9, 30), durationSeconds: 1080, tempoBpm: null, rangeSummary: 'Measures 32–48' },
  { id: 'act-inter', ownerId: 'you', scoreId: 'interstellar', scoreTitleSnapshot: 'Interstellar Main Theme', mode: 'performance', startedAt: daysAgo(1, 20, 2), completedAt: daysAgo(1, 20, 7), durationSeconds: 262, tempoBpm: 56, rangeSummary: 'Full score' },
  { id: 'act-prelude', ownerId: 'you', scoreId: 'prelude-c', scoreTitleSnapshot: 'Prelude in C', mode: 'follow', startedAt: daysAgo(2, 19, 4), completedAt: daysAgo(2, 19, 16), durationSeconds: 720, tempoBpm: null, rangeSummary: 'Full score' },
  { id: 'act-etude', ownerId: 'you', scoreId: 'etude10-4', scoreTitleSnapshot: 'Étude Op. 10 No. 4', mode: 'performance', startedAt: daysAgo(5, 17, 30), completedAt: daysAgo(5, 17, 52), durationSeconds: 1320, tempoBpm: 120, rangeSummary: 'Measures 1–32' },
  { id: 'act-clair', ownerId: 'you', scoreId: 'clair-de-lune', scoreTitleSnapshot: 'Clair de Lune', mode: 'follow', startedAt: daysAgo(9, 21, 0), completedAt: daysAgo(9, 21, 15), durationSeconds: 900, tempoBpm: null, rangeSummary: 'Full score' },
];

// ---------- Saved Performances (only what the user chose to keep) ----------
export const savedPerformances = [
  {
    id: 'perf-clair-take-1',
    scoreId: 'clair-de-lune',
    scoreTitleSnapshot: 'Clair de Lune',
    ownerId: 'you',
    created: daysAgo(3, 19, 30),
    durationSeconds: 305,
    tempoBpm: 60,
    mediaType: 'audio',
    fileUri: 'mock://recordings/clair-de-lune-take-1.webm',
    rangeSummary: 'Full score',
    sharedWith: [],
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
  { id: 'n7', category: 'practice', title: 'Feel like playing something today?', body: 'Moonlight Sonata is waiting whenever you feel like playing.', time: '3d', unread: false, href: '/practice' },
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
  plus: {
    id: 'plus', name: 'Plus', priceMonthly: 3, priceYearly: 30,
    scores: '30 scores', imports: '50 imports / month', analytics: true,
    storage: '3 GB', sharing: 'View & edit', export: false, practice: true,
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

// Sample records only.
export const billingHistory = [
  { id: 'b1', date: 'Nov 11, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'YUE-2026-11' },
  { id: 'b2', date: 'Oct 11, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'YUE-2026-10' },
  { id: 'b3', date: 'Sep 11, 2026', amount: '$6.00', plan: 'Pro monthly', invoice: 'YUE-2026-09' },
];

// ---------- Help articles ----------
export const helpCategories = [
  'Getting started', 'Adding music', 'Recognition & editing', 'Practice', 'Performances', 'Library', 'Sharing', 'Account & billing', 'Account & security', 'Privacy',
];

export const helpArticles = [
  { slug: 'add-first-score', category: 'Getting started', title: 'Add your first score', updated: 'Nov 18, 2026', excerpt: 'Bring in a PDF, photos, or MusicXML and turn it into something playable.',
    body: ['Yueora is built around the music you actually want to play. To start, add a score from anywhere using the Add score button.', 'You can upload sheet music (PDF, images, or camera capture) for optical recognition, or import a digital MusicXML file for direct validation into interactive notation. Both sources consume one monthly import allowance.', 'You can leave the page while sheet recognition runs — we’ll let you know when it’s ready to review. Digital MusicXML scores validate immediately and are ready to play right away.'], related: ['supported-formats', 'review-recognition'] },
  { slug: 'tour-practice', category: 'Getting started', title: 'A quick tour of Practice', updated: 'Sep 1, 2026', excerpt: 'Practice is about picking up where you left off — not assignments.',
    body: ['Practice Home asks a simple question: what do you feel like playing today?', 'You’ll see where you left off, music you’ve enjoyed recently, and a section that felt tricky last time — offered as an invitation, never a task.', 'There are no streaks to protect and no overdue items. Come back whenever you like.'], related: ['practice-setup', 'practice-feedback'] },
  { slug: 'supported-formats', category: 'Adding music', title: 'Supported file formats', updated: 'Aug 28, 2026', excerpt: 'PDF, PNG, JPG, and MusicXML. Multi-page PDFs are split automatically.',
    body: ['Yueora accepts PDF, PNG, and JPG images, plus MusicXML for scores you already have in a digital format.', 'Multi-page PDFs are split into pages automatically. For photos, try to keep pages flat and evenly lit for the best recognition.'], related: ['add-first-score', 'fix-recognition-errors'] },
  { slug: 'queue-and-review', category: 'Recognition & editing', title: 'Understanding the Recognition Queue and review states', updated: 'Nov 18, 2026', excerpt: 'Track score processing stages from upload through review and interactive readiness.',
    body: ['When you import sheet music or photo scans (PDF, PNG, JPG, or Camera), it enters the Recognition Queue. Yueora processes staves, measure lines, clefs, and notes in the background so you never have to wait on the page. Digital MusicXML scores bypass optical recognition entirely and validate directly into your library.', 'Items in the queue progress through three primary states: Processing (analysis running), Needs review (high confidence with specific measures flagged for quick confirmation), and Completed (fully ready for Practice and Repertoire).', 'If a score needs review, click Review to inspect flagged measures alongside your original scan before saving to your library.'], related: ['review-recognition', 'recognition-failure'] },
  { slug: 'fix-recognition-errors', category: 'Recognition & editing', title: 'Fixing recognition errors', updated: 'Aug 30, 2026', excerpt: 'Review what was recognized, then correct anything that’s off in the editor.',
    body: ['After recognition, scores that need a look go to Needs review. The review screen shows the original scan next to the recognized score, with any uncertain spots highlighted.', 'You can confirm it looks good, or open the editor to fix specific notes. The editor is designed for quick corrections, not full engraving.'], related: ['review-recognition', 'editor-basics'] },
  { slug: 'recognition-failure', category: 'Recognition & editing', title: 'What to do when optical score recognition fails', updated: 'Nov 11, 2026', excerpt: 'How to diagnose and resolve low contrast, skewed scans, or staff detection failures.',
    body: ['If an import fails, the queue card displays a specific diagnosis explaining why recognition could not complete.', 'Common causes include low image contrast, camera glare, or pages photographed at an extreme angle where staff lines could not be accurately detected.', 'To resolve, retake the photo under even lighting, ensure all four corners of the page are flat and visible, or upload the score as a high-resolution PDF or digital MusicXML file.'], related: ['supported-formats', 'queue-and-review'] },
  { slug: 'review-recognition', category: 'Recognition & editing', title: 'Reviewing recognition', updated: 'Aug 30, 2026', excerpt: 'Confirm the recognized score looks right before you practice.',
    body: ['Review and editing are different tasks. Review asks: did the system get this mostly right? Editor asks: what specifically do I want to change?', 'In review, each issue links to its measure. Confirm to finish, or jump into the editor to fix it.'], related: ['fix-recognition-errors', 'editor-basics'] },
  { slug: 'editor-basics', category: 'Recognition & editing', title: 'Editor basics', updated: 'Aug 30, 2026', excerpt: 'Select, add, and correct notes without leaving the score.',
    body: ['The editor opens full-screen with a tool rail, the score canvas, and an inspector for the selected note.', 'Select a note to change its pitch, duration, stem, or fingering. You can also add rests, ties, and slurs, and undo or redo as you go.'], related: ['fix-recognition-errors'] },
  { slug: 'practice-setup', category: 'Practice', title: 'Setting up a practice session', updated: 'Sep 2, 2026', excerpt: 'Choose a mode, input, range, and tempo before you start.',
    body: ['Before a session you pick a mode (follow notes or performance), an input (microphone or MIDI), a range, and a tempo.', 'You can slow the playback speed without changing the score’s original tempo, and turn on a metronome and count-in.'], related: ['practice-feedback', 'tour-practice'] },
  { slug: 'practice-feedback', category: 'Practice', title: 'How feedback works', updated: 'Sep 2, 2026', excerpt: 'Feedback is calm and informational — never a grade.',
    body: ['During a session, Yueora can show whether a note matched, what’s coming next, and where things felt uncertain.', 'You won’t see a failing score or a judgment. Afterward, the summary leads with how it felt, then offers details if you want them.'], related: ['practice-setup', 'practice-summary'] },
  { slug: 'practice-suggestions', category: 'Practice', title: 'Practice suggestions and notification settings', updated: 'Nov 18, 2026', excerpt: 'Gentle, pressure-free invitations that respect your cadence and peace of mind.',
    body: ['Yueora does not use streak counters, urgency notifications, or punitive reminders. We believe musical practice is a personal sanctuary, not a chore.', 'In Settings → Notifications, you can tune practice suggestions to your preferred frequency (Off, Occasionally, or Weekly) and time of day (Morning, Afternoon, or Evening).', 'Suggestions always take the form of an open question: “Feel like returning to Moonlight Sonata today?” or “Moonlight Sonata is waiting whenever you feel like playing.”'], related: ['tour-practice', 'practice-setup'] },
  { slug: 'practice-summary', category: 'Practice', title: 'Reading your practice summary', updated: 'Sep 2, 2026', excerpt: 'The summary leads with a feeling, then the details.',
    body: ['Each summary opens with a short, human line about the session, then shows the range and tempo you chose and offers to run it again.', 'Yueora shows what it actually knows — how long you played, which range, the tempo you chose, and your recording if you made one. Note-level accuracy is not measured, so it is not shown, and the summary is a moment rather than a stored record.'], related: ['practice-feedback'] },
  { slug: 'saving-a-performance', category: 'Performances', title: 'Saving an original recording', updated: 'Nov 7, 2026', excerpt: 'Choose to keep the audio or video you actually recorded.',
    body: ['Recording is a choice you make in setup, and saving is a second choice you make afterwards. Finishing a practice session never uploads anything by itself.', 'In the practice report, Save performance uploads the original file to your private Performances library and links it to the score you were playing. Its media type, duration, recording date and the section you played are kept with it.', 'If the upload fails you will see the error on the report instead of a success message, and you can try again. Nothing appears in Performances until the file has actually been stored.'], related: ['downloading-a-recording', 'history-vs-performances'] },
  { slug: 'downloading-a-recording', category: 'Performances', title: 'Downloading an original recording', updated: 'Nov 18, 2026', excerpt: 'Keep a copy of the original audio or video on your device.',
    body: ['With Pro, you can download the original recording from a saved performance. Open it from Performances and use Download to save the original file to your device.', 'The download is the same recording that was captured in the session — not a re-export and not a share video.', 'On Free and Plus plans, performances can be replayed and shared, while recording file downloads are unlocked with Pro. If you have not saved the performance yet, you can still download from the practice report while the report is open.'], related: ['saving-a-performance', 'composite-share-video'] },
  { slug: 'sharing-a-performance', category: 'Performances', title: 'Sharing a performance', updated: 'Nov 7, 2026', excerpt: 'Share a recording without sharing the score behind it.',
    body: ['Open a saved performance and choose Share. You can keep it private or share it with selected people.', 'Sharing a performance is separate from sharing a score. The people you choose can watch the recording; they do not gain access to the score, to your practice history, or to your other performances.', 'You can change or revoke access at any time. Someone who loses access can no longer open the performance.'], related: ['managing-performance-access', 'sharing-basics'] },
  { slug: 'managing-performance-access', category: 'Performances', title: 'Managing performance access', updated: 'Nov 7, 2026', excerpt: 'See who can watch, change what they can do, or revoke access.',
    body: ['The sharing panel on a performance lists everyone who can currently watch it. Choosing Private again removes everyone at once.', 'Watching and commenting are separate grants. Someone can be allowed to watch without being allowed to comment, and you can grant commenting per person or turn comments off for everyone.', 'Removing someone takes effect immediately. Their access is not restored if you later share the performance with somebody else.'], related: ['sharing-a-performance', 'performance-comments'] },
  { slug: 'composite-share-video', category: 'Performances', title: 'Making a share video', updated: 'Nov 7, 2026', excerpt: 'Build a video of your recording with the score beside it.',
    body: ['From a saved performance, choose Make share video. Yueora builds the video on your device from the saved original recording and the score it belongs to.', 'The score shown is the same notation you see in the app, and it moves with the recording, following the measure changes recorded during the session. Individual notes are not tracked, so the score follows the music measure by measure rather than note by note.', 'Both audio and video recordings can become a share video. With a video recording you can pick a landscape or portrait format and either a side-by-side or an overlay layout; with an audio recording the score becomes the picture.', 'Preview the result and download it. Building a video takes roughly as long as the recording itself, and closing the window stops a build in progress.'], related: ['why-share-videos-stay-local', 'saving-a-performance'] },
  { slug: 'why-share-videos-stay-local', category: 'Performances', title: 'Why share videos stay on your device', updated: 'Nov 7, 2026', excerpt: 'The share video is an export, not a second copy in your library.',
    body: ['A share video is something you make to send to someone, so it is never uploaded to Yueora. It is generated in your browser, previewed there, and downloaded to your device.', 'It does not appear in Performances, is not stored as a media file, does not use your storage allowance, and does not create a Yueora link. The original recording remains the only asset Yueora keeps.', 'If you want another video later, or in a different format, generate it again from the saved original recording and its score.'], related: ['composite-share-video', 'downloading-a-recording'] },
  { slug: 'performance-comments', category: 'Performances', title: 'Comments and replies', updated: 'Nov 7, 2026', excerpt: 'A short conversation attached to one performance.',
    body: ['Comments live on a performance, not on the score. A comment stays with the recording it belongs to and is only visible to people who can open that performance.', 'You can reply to a comment, edit your own comments, and delete them. Comments and replies show who wrote them and when.', 'Commenting is a separate permission from watching. If you can watch but not comment, the comment box is closed and says so.'], related: ['managing-performance-access', 'managing-comments'] },
  { slug: 'managing-comments', category: 'Performances', title: 'Managing or deleting comments', updated: 'Nov 7, 2026', excerpt: 'Comment controls belong to the owner of the performance.',
    body: ['As the owner of a performance you can remove any comment on it, including replies, and you can turn comments off entirely from the sharing panel.', 'When comments are off, existing comments stay visible to people who can watch, but new comments and replies are not accepted until you turn them back on.', 'This only affects that one performance. Your scores are unaffected.'], related: ['performance-comments', 'sharing-a-performance'] },
  { slug: 'history-vs-performances', category: 'Performances', title: 'Practice history vs Performances', updated: 'Nov 7, 2026', excerpt: 'One is a private record of practice; the other is music you chose to keep.',
    body: ['Practice history records what you played, when, and for how long. It is private, it is never shared, and it holds no media and no report.', 'Performances hold the recordings you chose to keep. They can be replayed alongside their score, downloaded, and shared with people you trust.', 'Saving a performance does not publish your practice history, and deleting a performance leaves your practice history untouched.'], related: ['saving-a-performance', 'sharing-a-performance'] },
  { slug: 'organize-library', category: 'Library', title: 'Organize your library', updated: 'Aug 25, 2026', excerpt: 'Folders, favorites, and ownership views keep things tidy.',
    body: ['Your library separates All music, Mine, Shared with me, Saved, and Favorites. Folders live inside the library for finer grouping.', 'You can create, rename, and delete folders, and move scores between them. Deleting a folder never deletes the scores inside.'], related: ['trash-and-restore', 'sharing-basics'] },
  { slug: 'trash-and-restore', category: 'Library', title: 'Trash and restoring scores', updated: 'Aug 25, 2026', excerpt: 'Deleted scores go to Trash, where you can restore or remove them for good.',
    body: ['When you remove a score you own, it moves to Trash. From there you can restore it or delete it permanently.', 'Shared and saved scores use “Leave” and “Remove from library” instead — they don’t go to Trash.'], related: ['organize-library'] },
  { slug: 'sharing-basics', category: 'Sharing', title: 'Sharing a score', updated: 'Nov 18, 2026', excerpt: 'Invite people by email, or turn on a link with the permissions you choose.',
    body: ['Sharing has two parts: People (named access with roles) and General access (a link anyone with the URL can use).', 'With Plus and Pro, you can invite collaborators with editing access, while Free provides view-only sharing. Depending on permissions, you can allow viewing, editing, downloading, and practicing, and set an expiration. Pending invitations show as pending until accepted.'], related: ['invite-accept', 'shared-score-access'] },
  { slug: 'invite-accept', category: 'Sharing', title: 'Accepting an invitation', updated: 'Aug 20, 2026', excerpt: 'Invitations are tied to an email — use the matching account to accept.',
    body: ['An invitation is sent to a specific email address. To accept, sign in with that account.', 'If you’re signed in with a different email, you’ll be asked to switch accounts. You can also decline an invitation.'], related: ['sharing-basics', 'shared-score-access'] },
  { slug: 'shared-score-access', category: 'Sharing', title: 'Opening a shared score link', updated: 'Aug 20, 2026', excerpt: 'Public links let people view, and sometimes practice or download.',
    body: ['A shared score link opens a public view of the score. Depending on permissions, you may be able to practice or download.', 'To save it to your own library, sign in or create an account. If a link has expired or been revoked, you’ll see a clear message.'], related: ['sharing-basics'] },
  { slug: 'account-password-email', category: 'Account & security', title: 'Managing your account email and password', updated: 'Nov 11, 2026', excerpt: 'Update display profile, change your email with confirmation, and set secure passwords.',
    body: ['You can manage your primary display name and email address in Settings → Account. When changing your email, a confirmation link is dispatched to your new address before the switch takes effect.', 'To update your password, visit Settings → Security. Passwords require a minimum of 8 characters. If your account is authenticated through Google OAuth, your sign-in credentials are authenticated directly through your Google Account.'], related: ['two-factor-auth', 'active-sessions'] },
  { slug: 'two-factor-auth', category: 'Account & security', title: 'Setting up two-factor authentication', updated: 'Nov 11, 2026', excerpt: 'Protect your music archive with time-based authenticator codes or SMS verification.',
    body: ['Two-factor authentication (MFA) adds an essential layer of protection to your repertoire and private performances.', 'You can enroll an authenticator app (such as Google Authenticator, 1Password, or Authy) or set up text message codes in Settings → Security → Manage MFA.', 'Once enrolled, a short 6-digit confirmation code is required when signing in from unrecognized browsers or devices.'], related: ['account-password-email', 'active-sessions'] },
  { slug: 'active-sessions', category: 'Account & security', title: 'Managing active sessions and unfamiliar devices', updated: 'Nov 11, 2026', excerpt: 'Review signed-in devices, current locations, and revoke old sessions with one click.',
    body: ['The Active Sessions panel in Settings → Security shows all browsers and devices currently signed into your account, including your current device.', 'If you see an unfamiliar computer or location, click Sign out next to that session immediately.', 'You can also select “Sign out all other sessions” to invalidate every device other than the one you are currently using.'], related: ['account-password-email', 'two-factor-auth'] },
  { slug: 'plan-limits-upgrades', category: 'Account & billing', title: 'Free, Plus, and Pro plan limits and upgrades', updated: 'Nov 11, 2026', excerpt: 'Compare score library caps, monthly import quotas, storage allowances, and features.',
    body: ['Yueora offers three tiers designed for different playing cadences: Free includes 5 scores, 10 imports per month, 500 MB storage, and full acoustic practice stand.', 'Plus ($3/mo or $30/yr) expands your library to 30 scores, 50 imports/mo, 3 GB storage, collaborative editing, and Practice insights.', 'Pro ($6/mo or $60/yr) unlocks unlimited scores, unlimited imports, 10 GB storage, and original performance recording downloads.', 'Upgrade or change your plan at any time in Settings → Plan & billing.'], related: ['change-plan', 'payment-and-receipts'] },
  { slug: 'payment-and-receipts', category: 'Account & billing', title: 'Payment methods and billing receipts', updated: 'Nov 11, 2026', excerpt: 'Manage payment cards, review billing history, and download itemized invoice receipts.',
    body: ['In Settings → Plan & billing, you can view your active payment card and update your card details at any time by selecting Change payment method.', 'Past payments are cataloged in Billing history. Each transaction records the date, plan, amount, and invoice reference (e.g. YUE-2026-11).', 'Click View receipt on any transaction to open an itemized receipt suitable for records or tax purposes.'], related: ['change-plan', 'plan-limits-upgrades'] },
  { slug: 'change-plan', category: 'Account & billing', title: 'Change your plan', updated: 'Nov 8, 2026', excerpt: 'Upgrade from pricing, and downgrade, cancel, or resume in Plan & billing.',
    body: ['Free includes a smaller repertoire and import allowance. Plus expands your library and monthly imports while adding practice insights and collaborative sharing. Pro provides unlimited repertoire and imports with 10 GB storage and recording downloads.', 'Upgrading opens a secure checkout page where you can review your subscription terms and payment details. Your plan updates immediately upon confirmation.', 'Downgrading, cancelling, or resuming happens in Plan & billing. A cancellation keeps your paid plan active until the end of the period you have already paid for, and you can resume before then.'], related: ['plan-limits-upgrades', 'billing-history'] },
  { slug: 'billing-history', category: 'Account & billing', title: 'Billing history and receipts', updated: 'Nov 8, 2026', excerpt: 'View past payments, download receipts, and manage your billing records.',
    body: ['Your billing history lists every subscription renewal and charge with the date, plan, amount paid, and invoice reference number.', 'You can view and print an itemized receipt for any billing record directly from Plan & billing in Settings.', 'Receipts display your account name, email, billing period, and payment method for your bookkeeping needs.'], related: ['change-plan', 'payment-and-receipts'] },
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