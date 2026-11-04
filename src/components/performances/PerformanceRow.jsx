import { Link } from 'react-router-dom';
import { Download, MoreHorizontal, Pause, Play, Trash2, Wand2 } from 'lucide-react';
import { fmtClock } from '@/lib/practiceUtils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function PerformanceRow({ performance, scoreExists, playing, position, onToggle, onSeek, onDownload, onShareVideo, onDelete }) {
  const { durationSec = 0, mediaKind } = performance;
  const progress = durationSec ? (position / durationSec) * 100 : 0;

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {scoreExists ? (
            <Link to={`/score/${performance.scoreId}`} className="font-display text-lg font-medium text-ink-primary hover:text-brand">
              {performance.scoreTitle}
            </Link>
          ) : (
            <p className="font-display text-lg font-medium text-ink-primary">{performance.scoreTitle}</p>
          )}
          <p className="mt-0.5 type-metadata text-ink-secondary">
            {performance.createdAt} · {performance.duration} · {mediaKind === 'video' ? 'Video' : 'Audio'} · {performance.tempo?.bpm} BPM · {performance.rangeLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/practice/${performance.reportId}/summary`} className="rounded-control border border-line-subtle px-3 py-1.5 text-sm font-medium text-ink-primary hover:bg-accent">
            Open report
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-control border border-line-subtle p-1.5 text-ink-secondary hover:bg-accent" aria-label={`More actions for ${performance.scoreTitle}`}>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" /> Download recording
              </DropdownMenuItem>
              {mediaKind === 'video' && (
                <DropdownMenuItem onClick={onShareVideo}>
                  <Wand2 className="mr-2 h-4 w-4" /> Make share video
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete performance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inline playback — playing shouldn't require opening the report */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? `Pause ${performance.scoreTitle}` : `Play ${performance.scoreTitle}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-subtle text-ink-primary hover:bg-accent"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="relative">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={durationSec || 1}
              step={1}
              value={Math.min(position, durationSec || 0)}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label={`Seek ${performance.scoreTitle}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1 flex justify-between type-metadata text-ink-tertiary">
            <span className="tabular-nums">{fmtClock(playing || position ? position : 0)}</span>
            {mediaKind === 'video' && <span>Video</span>}
            <span className="tabular-nums">{performance.duration}</span>
          </div>
        </div>
      </div>
    </article>
  );
}