import { Link } from 'react-router-dom';
import { Download, Loader2, MoreHorizontal, Pause, Play, Share2, Trash2 } from 'lucide-react';
import { dayLabel, fmtClock } from '@/lib/practiceUtils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function PerformanceRow({
  performance, scoreExists, isOwner, ownerName,
  playing, position, loading, error, canPlay = true,
  onToggle, onSeek, onDownload, onOpen, onDelete,
}) {
  const { durationSeconds = 0, mediaType } = performance;
  const progress = durationSeconds ? Math.min(100, (position / durationSeconds) * 100) : 0;

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/performances/${performance.id}`} className="font-display text-lg font-medium text-ink-primary hover:text-brand">
            {performance.scoreTitleSnapshot}
          </Link>
          <p className="mt-0.5 type-metadata text-ink-secondary">
            {ownerName ? `${ownerName} · ` : ''}{dayLabel(performance.createdAt)} · {fmtClock(durationSeconds)} · {mediaType === 'video' ? 'Video' : 'Audio'}
            {performance.tempoBpm ? ` · ${performance.tempoBpm} BPM` : ''} · {performance.rangeSummary}
          </p>
          {!scoreExists && (
            <p className="mt-1 type-metadata text-ink-tertiary">Original score unavailable</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-control border border-line-subtle p-1.5 text-ink-secondary hover:bg-accent" aria-label={`More actions for ${performance.scoreTitleSnapshot}`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onDownload} disabled={!canPlay}>
              <Download className="mr-2 h-4 w-4" /> Download recording
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpen}>
              <Share2 className="mr-2 h-4 w-4" /> Open performance
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete performance
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Inline playback — no report needed */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!canPlay || loading}
          aria-label={playing ? `Pause ${performance.scoreTitleSnapshot}` : `Play ${performance.scoreTitleSnapshot}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-subtle text-ink-primary hover:bg-accent disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="relative">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
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
          <div className="mt-1 flex justify-between type-metadata text-ink-tertiary">
            <span className="tabular-nums">{fmtClock(position)}</span>
            <span className="tabular-nums">{fmtClock(durationSeconds)}</span>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 type-metadata text-destructive">{error}</p>}
      {!canPlay && !error && (
        <p className="mt-2 type-metadata text-ink-tertiary">No recording file is stored for this performance.</p>
      )}
    </article>
  );
}