import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Camera,
  FileMusic,
  RotateCw,
  X,
  Plus,
  Check,
  Music2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { AppPage } from '@/components/patterns/AppPage';
import BackLink from '@/components/patterns/BackLink';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SectionHeader } from '@/components/patterns/SectionHeader';
import { Stepper } from '@/components/patterns/Stepper';
import { ChoiceCard } from '@/components/patterns/ChoiceCard';
import { Surface } from '@/components/patterns/Surface';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import FileThumbnail from '@/components/visuals/FileThumbnail';

const sources = [
  { id: 'pdf', icon: Upload, label: 'Upload PDF', desc: 'One or more pages from your device' },
  { id: 'images', icon: FileMusic, label: 'Upload images', desc: 'PNG or JPG photos of pages' },
  { id: 'camera', icon: Camera, label: 'Take photos', desc: 'Capture pages with your camera' },
  { id: 'musicxml', icon: Music2, label: 'Import MusicXML', desc: 'A digital score you already have' },
];

const errorTypes = {
  unsupported: { msg: 'Unsupported file type. Use PDF, PNG, JPG, or MusicXML.', action: 'Choose a different file' },
  duplicate: { msg: 'This file looks like a duplicate. Remove it or choose another.', action: 'Remove duplicate' },
  tooLarge: { msg: 'This file is too large (max 50 MB). Try a smaller file.', action: 'Choose a smaller file' },
  uploadFailed: { msg: 'Upload failed. Check your connection and try again.', action: 'Retry upload' },
};

export default function AddScore() {
  const navigate = useNavigate();
  const createImport = usePrototypeStore((s) => s.createImport);
  const folders = usePrototypeStore((s) => s.folders);

  const [step, setStep] = useState(1);
  const [source, setSource] = useState('pdf');
  const [files, setFiles] = useState([{ id: 1, name: 'Page 1.pdf' }]);
  const [details, setDetails] = useState({ title: '', composer: '', instrument: 'Piano', tags: '', folder: '' });
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState(null);
  const [createdImportId, setCreatedImportId] = useState(null);

  const addFile = () => setFiles((f) => [...f, { id: Date.now(), name: `Page ${f.length + 1}.pdf` }]);
  const removeFile = (id) => setFiles((f) => f.filter((x) => x.id !== id));
  const rotate = (id) => setFiles((f) => f.map((x) => (x.id === id ? { ...x, rotated: !x.rotated } : x)));
  const moveUp = (id) =>
    setFiles((f) => {
      const i = f.findIndex((x) => x.id === id);
      if (i <= 0) return f;
      const arr = [...f];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });
  const moveDown = (id) =>
    setFiles((f) => {
      const i = f.findIndex((x) => x.id === id);
      if (i < 0 || i >= f.length - 1) return f;
      const arr = [...f];
      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      return arr;
    });

  const simulateError = (type) => setFileError(type);
  const clearFileError = () => setFileError(null);

  const startRecognition = () => {
    if (!details.title.trim()) {
      setError('Add a title so you can find this score later.');
      return;
    }
    createImport({
      title: details.title,
      composer: details.composer,
      instrument: details.instrument,
      pages: files.length,
      source: sources.find((s) => s.id === source)?.label || 'PDF',
      folder: details.folder,
    });
    const store = usePrototypeStore.getState();
    setCreatedImportId(store.imports[0]?.id);
    setStep(5);
  };

  return (
    <AppPage size="form">
      {/* Back link navigation */}
      <BackLink to="/library" label="Back to library" />

      {/* Main Page Title */}
      <PageHeader title="Add a score" className="mt-4" />

      {/* Progress Stepper */}
      <Stepper
        current={step}
        steps={['Source', 'Files', 'Details', 'Confirm']}
        onStepClick={(s) => s < step && setStep(s)}
        className="mt-6"
      />

      <div className="mt-8">
        {/* Step 1 — Choose Source */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="type-subsection text-ink-primary">How would you like to add it?</h2>
              <p className="mt-1 type-body-small text-ink-secondary">
                Upload sheets from your device or import an existing digital music file.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sources.map((s) => (
                <ChoiceCard
                  key={s.id}
                  icon={s.icon}
                  title={s.label}
                  description={s.desc}
                  selected={source === s.id}
                  onClick={() => {
                    setSource(s.id);
                    setStep(2);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Manage Files */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader
              title="Your files"
              description="Preview, reorder, rotate, or remove pages before processing."
            />

            {/* Simulated file error banner */}
            {fileError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-container border border-danger/30 bg-danger/10 p-4"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div className="flex-1">
                  <p className="type-body-small font-medium text-danger">{errorTypes[fileError].msg}</p>
                  <button
                    type="button"
                    onClick={clearFileError}
                    className="mt-1 type-metadata font-semibold text-danger underline hover:opacity-85"
                  >
                    {errorTypes[fileError].action}
                  </button>
                </div>
                <IconButton
                  icon={X}
                  size="xs"
                  tone="quiet"
                  label="Dismiss error"
                  onClick={clearFileError}
                />
              </div>
            )}

            {/* Uploaded File List */}
            <div className="space-y-2">
              {files.map((f, i) => (
                <Surface
                  key={f.id}
                  tone="panel"
                  border
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <FileThumbnail seed={f.id} className="h-14 w-12 shrink-0 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="type-body-small font-medium text-ink-primary truncate">
                      {f.name}
                      {f.rotated && (
                        <span className="ml-2 type-metadata text-ink-secondary font-normal">
                          (rotated 90°)
                        </span>
                      )}
                    </p>
                    <p className="type-metadata text-ink-secondary">Page {i + 1} of {files.length}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                      icon={ChevronUp}
                      size="sm"
                      tone="quiet"
                      label={`Move ${f.name} up`}
                      disabled={i === 0}
                      onClick={() => moveUp(f.id)}
                    />
                    <IconButton
                      icon={ChevronDown}
                      size="sm"
                      tone="quiet"
                      label={`Move ${f.name} down`}
                      disabled={i === files.length - 1}
                      onClick={() => moveDown(f.id)}
                    />
                    <IconButton
                      icon={RotateCw}
                      size="sm"
                      tone="quiet"
                      label={`Rotate ${f.name}`}
                      onClick={() => rotate(f.id)}
                    />
                    {files.length > 1 && (
                      <IconButton
                        icon={X}
                        size="sm"
                        tone="danger"
                        label={`Remove ${f.name}`}
                        onClick={() => removeFile(f.id)}
                      />
                    )}
                  </div>
                </Surface>
              ))}
            </div>

            <div>
              <Button intent="quiet" size="sm" onClick={addFile} className="gap-1.5 text-brand">
                <Plus className="h-4 w-4" />
                <span>Add another page</span>
              </Button>
            </div>

            {/* QA Testing Triggers (development-only) */}
            {import.meta.env.DEV && (
              <div className="flex flex-wrap items-center gap-2 rounded-control border border-line-subtle bg-surface-canvas/50 px-3 py-2">
                <span className="type-caption text-ink-secondary">DEV QA:</span>
                {Object.entries(errorTypes).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => simulateError(k)}
                    className="type-metadata text-ink-secondary hover:text-ink-primary underline"
                  >
                    {v.msg.split('.')[0]}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-line-subtle pt-4">
              <Button intent="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button intent="primary" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Score Details */}
        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader
              title="Score details"
              description="Recognition will pre-fill these nuances — you can customize them anytime."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                htmlFor="title"
                required
                error={error}
                className="sm:col-span-2"
              >
                <Input
                  id="title"
                  value={details.title}
                  hasError={Boolean(error)}
                  onChange={(e) => {
                    setDetails({ ...details, title: e.target.value });
                    setError('');
                  }}
                  placeholder="e.g. Clair de Lune, Moonlight Sonata"
                />
              </Field>

              <Field label="Composer (optional)" htmlFor="composer">
                <Input
                  id="composer"
                  value={details.composer}
                  onChange={(e) => setDetails({ ...details, composer: e.target.value })}
                  placeholder="e.g. Claude Debussy"
                />
              </Field>

              <Field label="Instrument" htmlFor="instrument">
                <Input
                  id="instrument"
                  value={details.instrument}
                  onChange={(e) => setDetails({ ...details, instrument: e.target.value })}
                  placeholder="Piano"
                />
              </Field>

              <Field label="Tags (optional)" htmlFor="tags">
                <Input
                  id="tags"
                  value={details.tags}
                  onChange={(e) => setDetails({ ...details, tags: e.target.value })}
                  placeholder="Classical, Recital, Étude"
                />
              </Field>

              <Field label="Collection / Folder (optional)" htmlFor="folder">
                <NativeSelect
                  id="folder"
                  value={details.folder}
                  onChange={(e) => setDetails({ ...details, folder: e.target.value })}
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <div className="flex items-center justify-between border-t border-line-subtle pt-4">
              <Button intent="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                intent="primary"
                onClick={() => {
                  if (!details.title.trim()) {
                    setError('Add a title so you can find this score later.');
                    return;
                  }
                  setStep(4);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <Surface tone="panel" elevation="paper" padding="md" className="space-y-4">
              <SectionHeader
                title="Confirm and begin"
                description="Review summary before optical recognition begins."
              />

              <dl className="divide-y divide-line-subtle type-body-small">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-ink-secondary">Title</dt>
                  <dd className="font-medium text-ink-primary">{details.title || 'Untitled'}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-ink-secondary">Composer</dt>
                  <dd className="font-medium text-ink-primary">{details.composer || '—'}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-ink-secondary">Instrument</dt>
                  <dd className="font-medium text-ink-primary">{details.instrument}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-ink-secondary">Pages</dt>
                  <dd className="font-medium text-ink-primary">{files.length} {files.length === 1 ? 'page' : 'pages'}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-ink-secondary">Source</dt>
                  <dd className="font-medium text-ink-primary">
                    {sources.find((s) => s.id === source)?.label}
                  </dd>
                </div>
              </dl>

              <p className="type-metadata text-ink-secondary pt-2">
                Recognition runs in the background. You can navigate away anytime and return once your active score is prepared.
              </p>
            </Surface>

            <div className="flex items-center justify-between border-t border-line-subtle pt-4">
              <Button intent="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button intent="primary" onClick={startRecognition}>
                Start recognition
              </Button>
            </div>
          </div>
        )}

        {/* Step 5 — Recognition Started */}
        {step === 5 && (
          <Surface tone="panel" elevation="paper" padding="lg" className="space-y-5 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <h2 className="type-section-title text-ink-primary">Recognition has started</h2>
                <p className="type-body-small text-ink-secondary">
                  {details.title || 'Untitled score'} · {files.length} {files.length === 1 ? 'page' : 'pages'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between type-metadata text-ink-secondary">
                <span>Interpreting notes and staves…</span>
                <span>Active</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-canvas">
                <div className="h-full w-1/3 rounded-full bg-brand animate-pulse" />
              </div>
            </div>

            <p className="type-body-small text-ink-secondary">
              Your score is dwelling into your personal collection. We’ll notify you when it’s ready for the practice stand.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button intent="secondary" onClick={() => navigate('/library')}>
                Back to library
              </Button>
              <Button
                intent="primary"
                onClick={() =>
                  navigate(createdImportId ? `/imports/${createdImportId}` : '/imports')
                }
              >
                View import queue
              </Button>
            </div>
          </Surface>
        )}
      </div>
    </AppPage>
  );
}
