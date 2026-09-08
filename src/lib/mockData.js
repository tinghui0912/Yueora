// Mock domain data for NoteVerse. UI never sees API DTOs — this stands in for the
// repository layer until real adapters are wired (Phase 5).

export const folders = [
  { id: 'piano', name: 'Piano' },
  { id: 'recital', name: 'Recital' },
  { id: 'exam2026', name: '2026 Exam' },
];

export const scores = [
  {
    id: 'moonlight',
    title: 'Moonlight Sonata',
    composer: 'Beethoven',
    instrument: 'Piano',
    tags: ['Classical', 'Romantic'],
    ownership: 'mine',
    favorite: true,
    folderIds: ['piano', 'recital'],
    practiceState: { status: 'recently_practiced', accuracy: 72, lastPracticed: 'yesterday', measure: 36 },
    pages: 3,
    created: '2026-08-12',
  },
  {
    id: 'etude10-4',
    title: 'Étude Op. 10 No. 4',
    composer: 'Chopin',
    instrument: 'Piano',
    tags: ['Classical', 'Étude'],
    ownership: 'mine',
    favorite: false,
    folderIds: ['exam2026'],
    practiceState: { status: 'to_practice', accuracy: 58, lastPracticed: '3 days ago', measure: 1 },
    pages: 5,
    created: '2026-08-20',
  },
  {
    id: 'prelude-c',
    title: 'Prelude in C',
    composer: 'J. S. Bach',
    instrument: 'Piano',
    tags: ['Baroque'],
    ownership: 'mine',
    favorite: true,
    folderIds: ['piano'],
    practiceState: { status: 'recently_practiced', accuracy: 88, lastPracticed: '2 days ago', measure: 1 },
    pages: 2,
    created: '2026-07-30',
  },
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune',
    composer: 'Debussy',
    instrument: 'Piano',
    tags: ['Impressionist'],
    ownership: 'mine',
    favorite: false,
    folderIds: ['recital'],
    practiceState: { status: 'mastered', accuracy: 94, lastPracticed: 'last week', measure: 1 },
    pages: 4,
    created: '2026-06-18',
  },
  {
    id: 'nocturne-eb',
    title: 'Nocturne in E♭',
    composer: 'Chopin',
    instrument: 'Piano',
    tags: ['Classical', 'Romantic'],
    ownership: 'shared',
    sharedBy: 'Alice',
    permission: 'Can edit',
    favorite: false,
    folderIds: [],
    practiceState: { status: 'to_practice', accuracy: 0, lastPracticed: 'never', measure: 1 },
    pages: 3,
    created: '2026-08-25',
  },
  {
    id: 'invention-13',
    title: 'Two-Part Invention No. 13',
    composer: 'J. S. Bach',
    instrument: 'Piano',
    tags: ['Baroque'],
    ownership: 'shared',
    sharedBy: 'Alice',
    permission: 'Can view',
    favorite: false,
    folderIds: [],
    practiceState: { status: 'recently_practiced', accuracy: 81, lastPracticed: '5 days ago', measure: 1 },
    pages: 2,
    created: '2026-08-22',
  },
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie No. 1',
    composer: 'Satie',
    instrument: 'Piano',
    tags: ['Classical'],
    ownership: 'saved',
    favorite: true,
    folderIds: ['recital'],
    practiceState: { status: 'to_practice', accuracy: 0, lastPracticed: 'never', measure: 1 },
    pages: 2,
    created: '2026-08-28',
  },
  {
    id: 'arabesque',
    title: 'Arabesque No. 1',
    composer: 'Debussy',
    instrument: 'Piano',
    tags: ['Impressionist'],
    ownership: 'mine',
    favorite: false,
    folderIds: ['piano'],
    practiceState: { status: 'mastered', accuracy: 96, lastPracticed: 'last week', measure: 1 },
    pages: 3,
    created: '2026-05-02',
  },
];

export const practiceHub = {
  continuePractice: {
    scoreId: 'moonlight',
    title: 'Moonlight Sonata',
    composer: 'Beethoven',
    lastPracticed: 'yesterday',
    measure: 36,
  },
  queue: [
    { scoreId: 'etude10-4', title: 'Étude Op. 10 No. 4', composer: 'Chopin', reason: 'Due today' },
    { scoreId: 'prelude-c', title: 'Prelude in C', composer: 'J. S. Bach', reason: '2 days since last practice' },
  ],
  weekly: { daysPracticed: 4, minutes: 62, scores: 3, marks: [true, true, false, true, true, false, false] },
  needsAttention: [
    { scoreId: 'moonlight', title: 'Moonlight Sonata', section: 'Measures 34–38', accuracy: 72 },
  ],
};

export const notifications = [
  { id: 'n1', category: 'system', title: 'Your score is ready', body: 'Moonlight Sonata — review recognition', time: '2m', unread: true, href: '/score/moonlight' },
  { id: 'n2', category: 'sharing', title: 'Alice accepted your invitation', body: 'Nocturne in E♭', time: '1h', unread: true, href: '/score/nocturne-eb' },
  { id: 'n3', category: 'system', title: 'Recognition finished', body: 'Prelude in C is ready to practice', time: '5h', unread: false, href: '/score/prelude-c' },
  { id: 'n4', category: 'practice', title: 'Practice streak: 4 days', body: 'Keep it up — Étude Op. 10 No. 4 is due today', time: '8h', unread: false, href: '/practice' },
  { id: 'n5', category: 'sharing', title: 'Ben invited you to edit', body: 'Clair de Lune — Can edit', time: '1d', unread: false, href: '/invite/clair' },
  { id: 'n6', category: 'practice', title: 'Accuracy improved', body: 'Moonlight Sonata — measures 34–38 up to 84%', time: '2d', unread: false, href: '/score/moonlight' },
];

export const imports = [
  { id: 'imp-moonlight', title: 'Moonlight Sonata', status: 'processing', progress: 62, started: '3 minutes ago' },
  { id: 'imp-prelude', title: 'Prelude in C', status: 'needs_review', progress: 100, started: '12 minutes ago' },
  { id: 'imp-etude', title: 'Étude Op. 10 No. 4', status: 'failed', progress: 0, started: '1 hour ago', failure: 'Could not detect staff lines on page 2.' },
  { id: 'imp-clair', title: 'Clair de Lune', status: 'completed', progress: 100, started: 'yesterday' },
];

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
    link: { access: 'Can view', download: true, practice: true, expiration: 'Never' },
  };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
export function generateNotes(scoreId) {
  let s = hashStr(scoreId || 'score');
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
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

export function getSharedScore(token) {
  const score = getScore(token) || scores.find((s) => s.ownership === 'shared') || scores[0];
  return {
    score,
    sharedBy: 'Alice',
    canPractice: true,
    canDownload: true,
    canEdit: false,
  };
}

export function getInvite(token) {
  const score = getScore(token) || scores.find((s) => s.ownership === 'shared') || scores[0];
  let status = 'valid';
  if (token.includes('expired')) status = 'expired';
  else if (token.includes('revoked')) status = 'revoked';
  else if (token.includes('accepted')) status = 'already_accepted';
  return { score, invitedBy: 'Alice', permission: 'Can edit', status };
}

export function getScore(id) {
  return scores.find((s) => s.id === id);
}

export function buildSummary(scoreId) {
  const score = getScore(scoreId);
  return {
    scoreId,
    title: score?.title ?? 'Score',
    composer: score?.composer ?? '',
    accuracy: 91,
    timing: 'Good',
    duration: '12:42',
    needsAttention: [
      { measure: 17, detail: '74% accuracy' },
      { measure: 34, detail: 'Timing instability' },
    ],
    missing: 3,
    unexpected: 2,
    compared: { accuracy: '+4%', errors: -7, tempo: '+8 BPM' },
  };
}