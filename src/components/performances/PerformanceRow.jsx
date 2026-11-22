import { Link } from 'react-router-dom';
import { Download, Loader2, MoreHorizontal, Pause, Play, Share2, Trash2 } from 'lucide-react';
import { dayLabel, fmtClock } from '@/lib/practiceUtils';
import { MemoryGlyph } from '@/components/brand/MusicalGlyphs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconButton } from '@/components/ui/icon-button';

/**
 * PerformanceRow: A preserved musical moment, not just a media row.
 * Respects the memory the musician chose to keep.
 */
export default function PerformanceRow({
  performance, scoreExists, isOwner, ownerName,
  playing, position, loading, error, canPlay = true,
  onToggle, onSeek, onDownload, onOpen, onDelete,
}) {
  const { durationSeconds = 0, mediaType } = performance;
  const progress = durationSeconds ? Math.min(100, (position / durationSeconds) * 100) : 0;

  return (
    <div className="rounded-container border border-line-subtle bg-surface-panel p-4 sm:p-5 transition-colors hover:border-line-strong">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
              <MemoryGlyph className="h-3 w-3" />
            </span>
            <Link
              to={`/performances/${performance.id}`}
              className="font-display text-lg font-medium text-ink-primary hover:text-brand transition-colors"
            >
              {performance.scoreTitleSnapshot}
            </Link>
          </div>

          <p className="mt-1 text-xs text-ink-secondary">
            {ownerName ? `${ownerName} · ` : ''}Preserved {dayLabel(performance.createdAt)} · {fmtClock(durationSeconds)}
            {mediaType === 'video' ? ' · Video' : ' · Audio'}
            {performance.rangeSummary ? ` · ${performance.rangeSummary}` : ''}
            {performance.tempoBpm ? ` · ♩ = ${performance.tempoBpm}` : ''}
          </p>

          {!scoreExists && (
            <p className="mt-1 text-xs text-ink-secondary/70">Original score no longer in library</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {scoreExists && (
            <Link
              to={`/score/${performance.scoreId}`}
              className="hidden rounded-control border border-line-subtle bg-transparent px-2.5 py-1 text-xs font-medium text-ink-primary hover:bg-neutral-hover sm:inline-block transition-colors"
            >
              View score
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={MoreHorizontal}
                label={`Actions for ${performance.scoreTitleSnapshot}`}
                tone="outline"
                size="xs"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-line-subtle bg-surface-panel shadow-overlay">
              <DropdownMenuItem onClick={onDownload} disabled={!canPlay} className="text-sm">
                <Download className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Download recording
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpen} className="text-xs">
                <Share2 className="mr-2 h-3.5 w-3.5 text-ink-secondary" /> Share moment
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuSeparator className="bg-line-subtle" />
                  <DropdownMenuItem className="text-destructive text-xs" onClick={onDelete}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete moment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Musical Playback Interface */}
      <div className="mt-4 flex items-center gap-3.5 pt-2 border-t border-line-subtle">
        <IconButton
          icon={loading ? Loader2 : (playing ? Pause : Play)}
          label={playing ? `Pause ${performance.scoreTitleSnapshot}` : `Play ${performance.scoreTitleSnapshot}`}
          tone="primary"
          size="md"
          onClick={onToggle}
          disabled={!canPlay || loading}
          className={loading ? '[&_svg]:animate-spin' : ''}
        />

        <div className="min-w-0 flex-1">
          <div className="relative flex items-center">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-muted" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-fast"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={durationSeconds || 1}
              step={1}
              value={Math.min(position, durationSeconds || 0)}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label={`Seek ${performance.scoreTitleSnapshot}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-secondary">
            <span>{fmtClock(position)}</span>
            <span>{fmtClock(durationSeconds)}</span>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {!canPlay && !error && (
        <p className="mt-2 text-xs text-ink-tertiary">No recording file stored for this performance.</p>
      )}
    </div>
  );
}
