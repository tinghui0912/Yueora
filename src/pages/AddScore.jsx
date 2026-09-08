import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileMusic, RotateCw, X, Plus, Check, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sources = [
  { id: 'pdf', icon: Upload, label: 'Upload PDF', desc: 'One or more pages from your device' },
  { id: 'images', icon: FileMusic, label: 'Upload images', desc: 'PNG or JPG photos of pages' },
  { id: 'camera', icon: Camera, label: 'Take photos', desc: 'Capture pages with your camera' },
  { id: 'musicxml', icon: Music2, label: 'Import MusicXML', desc: 'A digital score you already have' },
];

export default function AddScore() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('pdf');
  const [files, setFiles] = useState([{ id: 1, name: 'Page 1.pdf' }]);
  const [details, setDetails] = useState({ title: '', composer: '', instrument: 'Piano', tags: '', folder: '' });
  const [error, setError] = useState('');

  const addFile = () => setFiles((f) => [...f, { id: Date.now(), name: `Page ${f.length + 1}.pdf` }]);
  const removeFile = (id) => setFiles((f) => f.filter((x) => x.id !== id));
  const rotate = (id) => setFiles((f) => f.map((x) => (x.id === id ? { ...x, rotated: !x.rotated } : x)));

  const startRecognition = () => {
    if (!details.title.trim()) { setError('Add a title so you can find this score later.'); return; }
    setStep(5);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
      <button onClick={() => navigate('/library')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </button>
      <h1 className="mt-4 font-display text-2xl font-medium">Add a score</h1>

      {/* Stepper */}
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {['Source', 'Files', 'Details', 'Confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= i + 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
            <span className={step >= i + 2 ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
            {i < 3 && <span className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {/* Step 1 — source */}
        {step === 1 && (
          <div>
            <p className="text-sm text-muted-foreground">How would you like to add it?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sources.map((s) => (
                <button key={s.id} onClick={() => { setSource(s.id); setStep(2); }} className={`flex flex-col items-start gap-2 rounded-md border p-5 text-left hover:bg-accent ${source === s.id ? 'border-primary' : 'border-border'}`}>
                  <s.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{s.label}</span>
                  <span className="text-sm text-muted-foreground">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — files */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-medium">Your files</h2>
              <p className="text-sm text-muted-foreground">Preview, reorder, rotate, or remove pages.</p>
              <div className="mt-3 space-y-2">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                    <FileMusic className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-sm">{f.name}{f.rotated && ' (rotated)'}</span>
                    <button onClick={() => rotate(f.id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Rotate"><RotateCw className="h-4 w-4" /></button>
                    {files.length > 1 && <button onClick={() => removeFile(f.id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent" aria-label="Remove"><X className="h-4 w-4" /></button>}
                  </div>
                ))}
              </div>
              <button onClick={addFile} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add more</button>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 3 — metadata */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-medium">Score details</h2>
              <p className="text-sm text-muted-foreground">We’ll try to fill these in from recognition — you can edit anything.</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={details.title} onChange={(e) => { setDetails({ ...details, title: e.target.value }); setError(''); }} placeholder="Moonlight Sonata" /></div>
                <div className="space-y-1.5"><Label htmlFor="composer">Composer (optional)</Label><Input id="composer" value={details.composer} onChange={(e) => setDetails({ ...details, composer: e.target.value })} placeholder="Beethoven" /></div>
                <div className="space-y-1.5"><Label htmlFor="instrument">Instrument</Label><Input id="instrument" value={details.instrument} onChange={(e) => setDetails({ ...details, instrument: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="tags">Tags (optional)</Label><Input id="tags" value={details.tags} onChange={(e) => setDetails({ ...details, tags: e.target.value })} placeholder="Classical, Recital" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="folder">Folder (optional)</Label>
                  <select id="folder" value={details.folder} onChange={(e) => setDetails({ ...details, folder: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">No folder</option>
                    <option value="piano">Piano</option>
                    <option value="recital">Recital</option>
                    <option value="movies">Movie themes</option>
                  </select>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 4 — confirm */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="font-display text-lg font-medium">Confirm</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Title</dt><dd>{details.title || 'Untitled'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Composer</dt><dd>{details.composer || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Instrument</dt><dd>{details.instrument}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Pages</dt><dd>{files.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Source</dt><dd>{sources.find((s) => s.id === source)?.label}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">Recognition will run after you confirm. You can leave the page — we’ll let you know when it’s ready.</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={startRecognition}>Start recognition</Button>
            </div>
          </div>
        )}

        {/* Step 5 — recognition begins */}
        {step === 5 && (
          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary"><Check className="h-5 w-5" /></div>
            <h2 className="mt-2 font-display text-xl font-medium">Recognition has started</h2>
            <p className="mt-1 text-sm text-muted-foreground">{details.title || 'Untitled score'} · {files.length} {files.length === 1 ? 'page' : 'pages'}</p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Recognizing music…</span><span>0%</span></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-1/4 rounded-full bg-primary" /></div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">You can leave this page. We’ll let you know when it’s ready.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/library')}>Back to library</Button>
              <Button onClick={() => navigate('/imports')}>View import</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}