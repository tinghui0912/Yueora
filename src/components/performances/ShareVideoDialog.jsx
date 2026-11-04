import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const FORMATS = [
  { value: 'landscape', label: 'Landscape 16:9' },
  { value: 'portrait', label: 'Portrait 9:16' },
];
const LAYOUTS = [
  { value: 'side', label: 'Side by side' },
  { value: 'overlay', label: 'Score over video' },
];

export default function ShareVideoDialog({ open, onOpenChange, title }) {
  const { toast } = useToast();
  const [format, setFormat] = useState('landscape');
  const [layout, setLayout] = useState('side');
  const [stage, setStage] = useState('idle'); // idle | generating | ready

  useEffect(() => {
    if (!open) setStage('idle');
  }, [open]);

  const generate = () => {
    setStage('generating');
    setTimeout(() => setStage('ready'), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Make a share video</DialogTitle>
          <DialogDescription>{title} — a short clip you can share.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="type-caption text-ink-tertiary">Format</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  aria-pressed={format === f.value}
                  className={`rounded-control border px-3 py-1.5 text-sm ${format === f.value ? 'border-brand text-brand' : 'border-line-subtle text-ink-secondary hover:bg-accent/50'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="type-caption text-ink-tertiary">Layout</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLayout(l.value)}
                  aria-pressed={layout === l.value}
                  className={`rounded-control border px-3 py-1.5 text-sm ${layout === l.value ? 'border-brand text-brand' : 'border-line-subtle text-ink-secondary hover:bg-accent/50'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="type-caption text-ink-tertiary">Preview</p>
            <div className={`mt-2 mx-auto overflow-hidden rounded-container border border-line-subtle bg-foreground/90 p-2 ${format === 'portrait' ? 'aspect-[9/16] max-w-[180px]' : 'aspect-video w-full'}`}>
              <div className={`flex h-full gap-2 ${format === 'portrait' ? 'flex-col' : layout === 'overlay' ? 'relative' : ''}`}>
                <div className={`rounded bg-surface-panel ${format === 'portrait' ? 'h-1/2' : 'w-1/2'} ${layout === 'overlay' ? 'absolute inset-x-2 bottom-2 h-1/3 w-auto' : ''}`}>
                  <div className="staff-bg h-full w-full rounded opacity-60" aria-hidden="true" />
                </div>
                <div className={`rounded bg-gradient-to-br from-ink-primary/80 to-ink-primary/40 ${format === 'portrait' ? 'h-1/2' : 'w-1/2'} ${layout === 'overlay' ? 'absolute inset-0' : ''}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {stage === 'ready' ? (
            <Button onClick={() => toast({ title: 'Share video downloaded', description: `${title} — share video (mock file).` })}>
              <Download className="mr-1.5 h-4 w-4" /> Download video
            </Button>
          ) : (
            <Button onClick={generate} disabled={stage === 'generating'}>
              {stage === 'generating' ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Generating…</> : 'Generate video'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}