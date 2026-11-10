/**
 * SharingVisual — Landing sharing section visual.
 * Presents Yueora's intimate, quiet sharing model:
 * sharing is a deliberate door you choose to open, not an enterprise access matrix.
 */
import { Lock, Heart, ArrowUpRight, ShieldCheck, Mail } from 'lucide-react';

export default function SharingVisual() {
  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-2.5 sm:p-6 min-w-0 overflow-hidden">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line-subtle pb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <p className="type-caption font-medium uppercase tracking-wider text-ink-tertiary truncate">
            Selective Sharing
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-canvas/80 px-2.5 py-0.5 type-metadata text-ink-secondary self-start sm:self-auto shrink-0">
          <Lock className="h-3 w-3 text-brand shrink-0" /> Private by default
        </span>
      </div>

      {/* Shared Item Overview */}
      <div className="mt-4 rounded-control border border-line-subtle bg-surface-canvas/50 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="type-caption text-ink-tertiary">Sharing 1 take & score</span>
            <h4 className="mt-0.5 font-display text-base font-medium text-ink-primary truncate">
              Clair de Lune · Take 3 (mm. 1–36)
            </h4>
            <p className="mt-1 text-xs text-ink-secondary">
              Includes synchronized sheet score + your private reflection audio
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-surface-panel text-ink-tertiary">
            <Heart className="h-4 w-4 fill-brand/15 text-brand" />
          </span>
        </div>
      </div>

      {/* Recipient Invitation - Intimate & Specific */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-tertiary">
          <span>Trusted Recipient</span>
          <span className="text-ink-secondary font-medium">1 person invited</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-control border border-line-subtle bg-surface-panel px-3.5 py-2.5 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              E
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">Emma (Piano Teacher)</p>
              <p className="type-metadata text-ink-tertiary truncate">emma.debussy@example.com</p>
            </div>
          </div>
          <span className="rounded-control bg-neutral-muted px-2.5 py-1 type-caption font-medium text-ink-secondary border border-line-subtle self-start sm:self-auto shrink-0">
            Can view &amp; annotate
          </span>
        </div>

        {/* Accompanying personal message */}
        <div className="rounded-control border border-dashed border-line-subtle bg-surface-canvas/40 px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
            <Mail className="h-3 w-3" /> Accompanying note
          </div>
          <p className="mt-1 font-serif italic text-xs leading-relaxed text-ink-secondary">
            &ldquo;Emma, here is the middle section take from Sunday. Focused on phrasing without rushing bar 27.&rdquo;
          </p>
        </div>
      </div>

      {/* Link status & Peace of mind */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-line-subtle pt-3 text-xs gap-1.5">
        <span className="flex items-center gap-1 text-ink-tertiary">
          Public Link: <span className="font-medium text-ink-secondary">Off</span>
        </span>
        <span className="inline-flex items-center gap-1 text-brand font-medium hover:underline cursor-pointer">
          Manage shared access <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
