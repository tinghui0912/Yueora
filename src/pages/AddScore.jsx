import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { getScoreQuota, getImportQuota, getStorageQuota, getEffectiveScoreUsage } from '@/lib/commercialEntitlements';
import { checkoutPath } from '@/lib/commercial';
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
  const scores = usePrototypeStore((s) => s.scores);
  const imports = usePrototypeStore((s) => s.imports);
  const subscription = usePrototypeStore((s) => s.subscription);

  const { liveCount, reservedCount, effectiveCount } = getEffectiveScoreUsage(scores, imports);
  const scoreQuota = getScoreQuota(subscription?.plan);
  const importQuota = getImportQuota(subscription?.plan);
  const storageQuota = getStorageQuota(subscription?.plan);
  const importsCount = subscription?.usage?.imports ?? 8;
  const isAtScoreLimit = !scoreQuota.isUnlimited && effectiveCount >= scoreQuota.limit;
  const isAtImportLimit = !importQuota.isUnlimited && importsCount >= importQuota.limit;

  const searchParams = new URLSearchParams(window.location.search);
  const initialSource = searchParams.get('source');

  const [step, setStep] = useState(() => (initialSource ? 2 : 1));
  const [source, setSource] = useState(initialSource);
  const [files, setFiles] = useState(() => {
    if (initialSource === 'camera') return [];
    if (initialSource === 'musicxml') return [{ id: 1, name: 'Clair_de_Lune.musicxml' }];
    return [{ id: 1, name: 'Page 1.pdf' }];
  });
  const [details, setDetails] = useState(() => {
    if (initialSource === 'musicxml') {
      return {
        title: 'Clair de Lune',
        composer: 'Claude Debussy',
        instrument: 'Piano',
        tags: 'Impressionist, Suite bergamasque',
        folder: '',
      };
    }
    return { title: '', composer: '', instrument: 'Piano', tags: '', folder: '' };
  });
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState(null);
  const [createdImportId, setCreatedImportId] = useState(null);
  const [createdScoreId, setCreatedScoreId] = useState(null);

  const handleSelectSource = (sourceId) => {
    if (isAtScoreLimit || isAtImportLimit) return;
    setSource(sourceId);
    if (sourceId === 'pdf') {
      setFiles([{ id: 1, name: 'Score-Part-1.pdf' }, { id: 2, name: 'Score-Part-2.pdf' }]);
    } else if (sourceId === 'images') {
      setFiles([{ id: 1, name: 'Scan_Page_1.jpg' }, { id: 2, name: 'Scan_Page_2.jpg' }]);
    } else if (sourceId === 'camera') {
      setFiles([]); // Camera begins with 0 captured pages
    } else if (sourceId === 'musicxml') {
      setFiles([{ id: 1, name: 'Clair_de_Lune.musicxml' }]);
      setDetails((prev) => ({
        ...prev,
        title: 'Clair de Lune',
        composer: 'Claude Debussy',
        instrument: 'Piano',
        tags: 'Impressionist, Suite bergamasque',
      }));
    }
    setStep(2);
  };

  const addFile = () => {
    const ext = source === 'images' ? 'jpg' : source === 'musicxml' ? 'musicxml' : 'pdf';
    setFiles((f) => [...f, { id: Date.now(), name: `Page ${f.length + 1}.${ext}` }]);
  };

  const capturePhoto = () => {
    setFiles((f) => [...f, { id: Date.now(), name: `Camera_Capture_${f.length + 1}.jpg` }]);
  };

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

  const handleSubmitScore = () => {
    if (!details.title.trim()) {
      setError('Add a title so you can find this score later.');
      return;
    }
    if (isAtScoreLimit || isAtImportLimit) return;

    if (source === 'musicxml') {
      const addInteractiveScore = usePrototypeStore.getState().addInteractiveScore;
      if (typeof addInteractiveScore === 'function') {
        addInteractiveScore({
          title: details.title,
          composer: details.composer,
          instrument: details.instrument,
          pages: files.length,
          measures: 72,
          folder: details.folder,
          source: 'MusicXML',
        });
      }
      const newScore = usePrototypeStore.getState().scores[0];
      setCreatedScoreId(newScore?.id);
      setStep(5);
    } else {
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
    }
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
          <div className="space-y-6">
            {/* Score Quota Warning Banner */}
            {isAtScoreLimit && (
              <div className="rounded-container border border-line-subtle bg-surface-panel p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="icon-sm text-ink-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="type-body-small font-medium text-ink-primary">
                      Repertoire limit reached ({effectiveCount} of {scoreQuota.limit} scores)
                    </h3>
                    <p className="mt-1 type-metadata text-ink-secondary">
                      Your current plan has room for {scoreQuota.limit} scores. A score already being prepared also reserves a place in your repertoire.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button intent="primary" size="sm" asChild>
                    <Link to={checkoutPath('plus', 'monthly')}>Upgrade to Plus</Link>
                  </Button>
                  <Button intent="secondary" size="sm" asChild>
                    <Link to="/library">Manage Repertoire</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Import Quota Warning Banner */}
            {!isAtScoreLimit && isAtImportLimit && (
              <div className="rounded-container border border-line-subtle bg-surface-panel p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="icon-sm text-ink-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="type-body-small font-medium text-ink-primary">
                      Monthly import limit reached ({importsCount} of {importQuota.label})
                    </h3>
                    <p className="mt-1 type-metadata text-ink-secondary">
                      You have used all import allowances for this billing cycle. Upgrade to continue importing sheet music or digital scores.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button intent="primary" size="sm" asChild>
                    <Link to={checkoutPath('plus', 'monthly')}>Upgrade to continue importing</Link>
                  </Button>
                </div>
              </div>
            )}

            <div>
              <h2 className="type-subsection text-ink-primary">How would you like to add it?</h2>
              <p className="mt-1 type-body-small text-ink-secondary">
                Upload sheets from your device or import an existing digital music file.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sources.map((s) => {
                const isBlocked = isAtScoreLimit || isAtImportLimit;
                return (
                  <ChoiceCard
                    key={s.id}
                    icon={s.icon}
                    title={s.label}
                    description={isBlocked ? (isAtScoreLimit ? 'Repertoire limit reached' : 'Import limit reached') : s.desc}
                    mode="action"
                    selected={source === s.id}
                    disabled={isBlocked}
                    onClick={() => !isBlocked && handleSelectSource(s.id)}
                  />
                );
              })}
            </div>

            {/* Quota Indicators */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-control border border-line-subtle bg-surface-panel px-4 py-3 type-metadata text-ink-secondary">
                <span>Monthly imports</span>
                <span className="font-medium text-ink-primary">
                  {importsCount} of {importQuota.label}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-control border border-line-subtle bg-surface-panel px-4 py-3 type-metadata text-ink-secondary">
                <span>Cloud storage</span>
                <span className="font-medium text-ink-primary">
                  {subscription?.usage?.storage || '1.2 GB'} of {storageQuota.limit}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Manage Files */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader
              title={
                source === 'camera'
                  ? 'Capture score pages'
                  : source === 'musicxml'
                  ? 'Digital score verification'
                  : 'Your files'
              }
              description={
                source === 'camera'
                  ? 'Frame each page evenly and snap clear photos of your sheet music.'
                  : source === 'musicxml'
                  ? 'Yueora parsed the digital structure of your score automatically.'
                  : 'Preview, reorder, rotate, or remove pages before processing.'
              }
            />

            {/* Simulated file error banner */}
            {fileError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-container border border-danger/30 bg-danger/10 p-4"
              >
                <AlertCircle className="mt-0.5 icon-sm shrink-0 text-danger" />
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

            {/* Source: MusicXML Flow */}
            {source === 'musicxml' ? (
              <div className="space-y-4">
                <div className="rounded-container border border-line-subtle bg-surface-panel p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-control bg-neutral-muted text-ink-primary shrink-0">
                      <Music2 className="icon-md" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="type-body-small font-medium text-ink-primary truncate">
                          {files[0]?.name || 'score.musicxml'}
                        </p>
                        <span className="rounded-control bg-neutral-muted px-2 py-0.5 type-caption text-ink-primary">
                          Parsed
                        </span>
                      </div>
                      <p className="mt-1 type-metadata text-ink-secondary">
                        Detected: Claude Debussy · Suite bergamasque · Piano
                      </p>
                      <p className="mt-1 type-caption text-ink-tertiary">
                        Format: MusicXML 4.0 · 72 measures · Key of D♭ Major · 2 staves
                      </p>
                    </div>
                  </div>
                </div>

                <p className="type-metadata text-ink-tertiary">
                  MusicXML contains native pitch and measure vectors. Optical recognition will be bypassed and notation will render immediately.
                </p>
              </div>
            ) : source === 'camera' ? (
              /* Source: Camera Capture Flow */
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-container border border-line-subtle bg-surface-canvas overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                  {/* Framing outline */}
                  <div className="absolute inset-6 rounded-control border-2 border-dashed border-line-strong pointer-events-none flex items-center justify-center">
                    <span className="type-caption text-ink-tertiary bg-surface-canvas/90 px-3 py-1 rounded">
                      Align sheet within borders
                    </span>
                  </div>

                  <Camera className="icon-xl text-ink-tertiary mb-3" />
                  <p className="type-body-small text-ink-secondary max-w-xs">
                    Hold steady with balanced lighting. Staves will be detected automatically.
                  </p>

                  <div className="mt-6 z-10">
                    <Button intent="primary" size="md" onClick={capturePhoto}>
                      <Camera className="mr-1.5 icon-sm" /> Capture page {files.length + 1}
                    </Button>
                  </div>
                </div>

                {/* Captured photo thumbnail tray */}
                <div>
                  <p className="type-label text-ink-primary mb-2">Captured pages ({files.length})</p>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 min-h-[5rem]">
                    {files.map((f, i) => (
                      <div key={f.id} className="relative flex-shrink-0 rounded-control border border-line-subtle bg-surface-panel p-2 flex flex-col items-center gap-1">
                        <FileThumbnail seed={f.id} className="h-16 w-12 rounded" />
                        <span className="type-caption text-ink-secondary">Page {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-surface-canvas border border-line-subtle text-ink-secondary hover:text-ink-primary flex items-center justify-center cursor-pointer"
                          aria-label={`Remove page ${i + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {files.length === 0 && (
                      <p className="type-metadata text-ink-tertiary italic py-2">
                        No pages captured yet. Click capture above to snap your first page.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Source: PDF & Images Standard Flow */
              <div className="space-y-4">
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
                  <Button intent="secondary" size="sm" onClick={addFile}>
                    <Plus className="icon-sm" />
                    <span>{source === 'images' ? 'Add another photo' : 'Add another page'}</span>
                  </Button>
                </div>
              </div>
            )}

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
              <Button intent="primary" onClick={() => setStep(3)} disabled={files.length === 0}>
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
              description={
                source === 'musicxml'
                  ? 'These details were read from the digital score. You can adjust them anytime.'
                  : 'Recognition can pre-fill these details — you can adjust them anytime.'
              }
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

              <Field label="Tags (optional)" htmlFor="tags" description="Comma-separated">
                <Input
                  id="tags"
                  value={details.tags}
                  onChange={(e) => setDetails({ ...details, tags: e.target.value })}
                  placeholder="Classical, Recital, Étude"
                />
              </Field>

              <Field label="Save to folder (optional)" htmlFor="folder">
                <NativeSelect
                  id="folder"
                  value={details.folder}
                  onChange={(e) => setDetails({ ...details, folder: e.target.value })}
                >
                  <option value="">No folder (All music)</option>
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
              <Button intent="primary" onClick={() => setStep(4)}>
                Review &amp; start
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation Overview */}
        {step === 4 && (
          <div className="space-y-6">
            <SectionHeader
              title={source === 'musicxml' ? 'Review & add score' : 'Review & confirm'}
              description={
                source === 'musicxml'
                  ? 'Confirm details before adding your digital MusicXML score directly to your library.'
                  : 'Confirm details before submitting your score to the recognition pipeline.'
              }
            />

            <Surface tone="panel" padding="md" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="type-section-title text-ink-primary truncate">
                    {details.title || 'Untitled score'}
                  </h3>
                  <p className="type-body-small text-ink-secondary mt-0.5">
                    {details.composer || 'Unknown composer'} · {details.instrument || 'Piano'}
                  </p>
                </div>
                <span className="rounded-control bg-neutral-muted px-2.5 py-1 type-caption text-ink-primary">
                  {sources.find((s) => s.id === source)?.label || 'PDF'}
                </span>
              </div>

              <div className="border-t border-line-subtle pt-3 grid grid-cols-2 gap-4 type-metadata">
                <div>
                  <span className="type-caption text-ink-tertiary">
                    {source === 'musicxml' ? 'Score measures' : 'Total pages'}
                  </span>
                  <p className="type-body-small font-medium text-ink-primary mt-0.5">
                    {source === 'musicxml' ? '72 measures' : `${files.length} ${files.length === 1 ? 'page' : 'pages'}`}
                  </p>
                </div>
                <div>
                  <span className="type-caption text-ink-tertiary">Target folder</span>
                  <p className="type-body-small font-medium text-ink-primary mt-0.5">
                    {folders.find((f) => f.id === details.folder)?.name || 'None (All music)'}
                  </p>
                </div>
              </div>

              <p className="type-metadata text-ink-secondary pt-2">
                {source === 'musicxml'
                  ? 'Native digital score. Optical recognition is bypassed and notation will render immediately in your library and practice stand.'
                  : 'Recognition runs in the background. You can navigate away anytime and return once your active score is prepared.'}
              </p>
            </Surface>

            <div className="flex items-center justify-between border-t border-line-subtle pt-4">
              <Button intent="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                intent="primary"
                onClick={handleSubmitScore}
                disabled={isAtScoreLimit || isAtImportLimit}
              >
                {source === 'musicxml' ? 'Add interactive score' : 'Start recognition'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5 — Success */}
        {step === 5 && (
          <Surface tone="panel" padding="lg" className="space-y-5 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
                <Check className="icon-lg" />
              </span>
              <div>
                <h2 className="type-section-title text-ink-primary">
                  {source === 'musicxml' ? 'Interactive score ready' : 'Recognition has started'}
                </h2>
                <p className="type-body-small text-ink-secondary">
                  {details.title || 'Untitled score'} · {source === 'musicxml' ? 'Ready to play' : `${files.length} ${files.length === 1 ? 'page' : 'pages'}`}
                </p>
              </div>
            </div>

            {source === 'musicxml' ? (
              <p className="type-body-small text-ink-secondary">
                Your MusicXML digital score was validated and converted directly into interactive notation. You can start practicing right away.
              </p>
            ) : (
              <>
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
                  Your score is being added to your repertoire. We’ll notify you when it’s ready for the practice stand.
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button intent="secondary" onClick={() => navigate('/library')}>
                Back to library
              </Button>
              {source === 'musicxml' ? (
                <Button
                  intent="primary"
                  onClick={() => navigate(createdScoreId ? `/score/${createdScoreId}/setup` : '/library')}
                >
                  Open in practice stand
                </Button>
              ) : (
                <Button
                  intent="primary"
                  onClick={() =>
                    navigate(createdImportId ? `/imports/${createdImportId}` : '/imports')
                  }
                >
                  View import queue
                </Button>
              )}
            </div>
          </Surface>
        )}
      </div>
    </AppPage>
  );
}
