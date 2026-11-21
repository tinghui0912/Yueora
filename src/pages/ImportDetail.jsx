import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileMusic, RefreshCw, AlertTriangle, CheckCircle2, Pencil, ArrowRight, Trash2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import AppPage from '@/components/patterns/AppPage';
import { Surface } from '@/components/patterns/Surface';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import FileThumbnail from '@/components/visuals/FileThumbnail';

const statusMeta = {
  processing: { label: 'Processing your score…', color: 'text-brand' },
  needs_review: { label: 'Needs review', color: 'text-brand' },
  failed: { label: 'Recognition failed', color: 'text-danger' },
  completed: { label: 'Completed', color: 'text-ink-tertiary' },
};

export default function ImportDetail() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const imp = usePrototypeStore((s) => s.imports.find((i) => i.id === importId));
  const issueCount = usePrototypeStore((s) => s.getUnresolvedIssueCount(importId));
  const retryImport = usePrototypeStore((s) => s.retryImport);
  const replaceImportSource = usePrototypeStore((s) => s.replaceImportSource);
  const removeImport = usePrototypeStore((s) => s.removeImport);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  if (!imp) {
    return (
      <AppPage size="form">
        <div className="py-16 text-center">
          <h1 className="type-section-title text-ink-primary">Import not found</h1>
          <p className="mt-2 type-body-small text-ink-secondary">The requested import session could not be located.</p>
          <Link to="/imports" className="mt-4 inline-block type-body-small text-brand hover:underline">Back to imports</Link>
        </div>
      </AppPage>
    );
  }

  const meta = statusMeta[imp.status];

  const handleRetry = () => { retryImport(imp.id); toast({ title: 'Recognition restarted', description: `${imp.title} is processing again.` }); };
  const handleReplace = () => { replaceImportSource(imp.id); setReplaceOpen(false); toast({ title: 'Source replaced', description: 'Recognition restarted with the new file.' }); };
  const handleRemove = () => { removeImport(imp.id); setRemoveOpen(false); navigate('/imports'); toast({ title: 'Import removed', description: 'The score in your library was not affected.' }); };

  return (
    <AppPage size="form">
      <Link to="/imports" className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> Imports
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="type-page-title text-ink-primary">{imp.title}</h1>
          <p className="mt-1 type-caption text-ink-secondary">Started {imp.started} · {imp.source} · {imp.pages} pages</p>
        </div>
        <span className={`shrink-0 type-body-small font-medium ${meta.color}`}>{meta.label}</span>
      </div>

      {/* Progress / status */}
      <Surface className="mt-6" padding="md">
        {imp.status === 'processing' && (
          <>
            <div className="mb-1 flex justify-between type-body-small"><span className="text-ink-secondary">Recognizing notation…</span><span>{imp.progress}%</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-muted"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${imp.progress}%` }} /></div>
            <p className="mt-3 type-body-small text-ink-secondary">You can leave this page. We’ll let you know when it’s ready.</p>
          </>
        )}
        {imp.status === 'needs_review' && (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-brand" />
            <p className="type-body-small text-ink-secondary">Recognition finished with {issueCount} {issueCount === 1 ? 'spot' : 'spots'} to review.</p>
          </div>
        )}
        {imp.status === 'failed' && (
          <div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <p className="type-body-small text-ink-primary">{imp.failure}</p>
            </div>
            <Button intent="secondary" size="sm" onClick={handleRetry} className="mt-4">
              <RefreshCw className="icon-xs" /> Try again
            </Button>
          </div>
        )}
        {imp.status === 'completed' && (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand" />
            <p className="type-body-small text-ink-secondary">Recognition complete. Your score is ready.</p>
          </div>
        )}
      </Surface>

      {/* Source files */}
      <div className="mt-6">
        <h2 className="type-caption text-ink-tertiary">Source files</h2>
        <div className="mt-2 space-y-2">
          {Array.from({ length: imp.pages }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-container border border-line-subtle bg-surface-panel p-3">
              <FileThumbnail seed={importId + '-page-' + (i + 1)} className="h-14 w-12" />
              <span className="flex-1 type-body-small text-ink-primary">Page {i + 1}.pdf</span>
              <IconButton icon={RefreshCw} label="Replace" tone="quiet" size="sm" onClick={() => setReplaceOpen(true)} />
            </div>
          ))}
        </div>
      </div>

      {/* Resulting score */}
      {imp.status === 'completed' && imp.scoreId && (
        <Surface className="mt-6" padding="md">
          <p className="type-caption text-ink-tertiary">Resulting score</p>
          <Link to={`/score/${imp.scoreId}`} className="mt-2 flex items-center justify-between rounded-control p-2 hover:bg-neutral-hover transition-colors">
            <span className="type-body-small font-medium text-ink-primary">{imp.title}</span>
            <span className="flex items-center gap-1 type-body-small text-brand">Open score <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </Surface>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {imp.status === 'needs_review' && (
          <Button asChild intent="primary" size="md">
            <Link to={`/review/${imp.id}`}>
              <Pencil className="h-4 w-4" /> Review recognition
            </Link>
          </Button>
        )}
        {imp.status === 'completed' && imp.scoreId && (
          <Button asChild intent="primary" size="md">
            <Link to={`/score/${imp.scoreId}`}>
              Open score
            </Link>
          </Button>
        )}
        {imp.status === 'failed' && (
          <Button onClick={handleRetry} intent="secondary" size="md">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        )}
        <Button onClick={() => setRemoveOpen(true)} intent="secondary" size="md">
          <Trash2 className="h-4 w-4" /> Remove from import history
        </Button>
      </div>

      {/* Replace source dialog */}
      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Replace source file</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary">Choose a replacement file. Recognition will start over with the new source.</p>
          <div className="mt-3 rounded-control border border-dashed border-line-subtle bg-surface-canvas p-6 text-center">
            <FileMusic className="mx-auto h-8 w-8 text-ink-secondary" />
            <p className="mt-2 type-caption text-ink-secondary">Drop a file here, or click to browse</p>
          </div>
          <DialogFooter>
            <Button intent="secondary" onClick={() => setReplaceOpen(false)}>Cancel</Button>
            <Button onClick={handleReplace}>Replace and restart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove from import history?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary">This removes the import record only. The score in your library will not be deleted.</p>
          <DialogFooter>
            <Button intent="secondary" onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button intent="danger" onClick={handleRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
