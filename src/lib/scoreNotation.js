import { generateNotes } from '@/lib/mockData';

/**
 * Where the notation shown beside a recording comes from.
 *
 * A score's recognized notes would be stored on the score record (score.notes).
 * No score in this prototype stores them yet, so any score without stored
 * notation can only be shown as a page preview — never claimed as the original.
 *
 * When the recognition pipeline starts persisting notes onto score records, this
 * helper picks them up automatically and `approximate` becomes false.
 */
export function getScoreNotation(score, scoreId) {
  const stored = score?.notes;
  if (Array.isArray(stored) && stored.length) {
    return { notes: stored, approximate: false };
  }
  return { notes: generateNotes(score?.id || scoreId), approximate: true };
}

export const NOTATION_PREVIEW_NOTICE =
  'Preview notation — recognized notes are not stored for this score yet, so the page shown beside the recording is a placeholder rather than the original engraving.';