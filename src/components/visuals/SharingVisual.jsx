/**
 * SharingVisual — Landing sharing section visual.
 * Mock of the sharing dialog: People with access + General access.
 */
import { Globe, Link2, Lock } from 'lucide-react';

export default function SharingVisual() {
  return (
    <div aria-hidden="true" className="rounded-container border border-line-subtle bg-surface-panel p-5 shadow-sm">
      {/* People with access */}
      <div>
        <p className="type-caption text-ink-tertiary">People with access</p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">You</div>
              <span className="text-sm font-medium text-ink-primary">You</span>
            </div>
            <span className="text-sm text-ink-tertiary">Owner</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">A</div>
              <span className="text-sm font-medium text-ink-primary">Alice</span>
            </div>
            <span className="text-sm text-ink-secondary">Can edit</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">C</div>
              <span className="text-sm text-ink-secondary">charlie@example.com</span>
            </div>
            <span className="text-xs text-ink-tertiary">Invitation pending</span>
          </div>
        </div>
      </div>

      {/* General access */}
      <div className="mt-5 border-t border-line-subtle pt-4">
        <p className="type-caption text-ink-tertiary">General access</p>
        <div className="mt-2 flex items-center justify-between rounded-control border border-line-subtle px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-ink-tertiary" />
            <div>
              <p className="text-sm font-medium text-ink-primary">Anyone with link</p>
              <p className="text-xs text-ink-tertiary">Can view</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-practice-correct">
            <Link2 className="h-3 w-3" /> Link on
          </span>
        </div>
      </div>
    </div>
  );
}