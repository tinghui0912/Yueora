import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileMusic, RotateCw, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddScore() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('upload');
  const [files, setFiles] = useState([{ id: 1, name: 'Page 1' }]);
  const [details, setDetails] = useState({ title: '', composer: '', instrument: '', tags: '' });

  const addFile = () => setFiles((f) => [...f, { id: Date.now(), name: `Page ${f.length + 1}` }]);
  const removeFile = (id) => setFiles((f) => f.filter((x) => x.id !== id));

  const startRecognition = () => {
    // Phase 4 mock: jump to the "being prepared" state, then library.
    setStep(4);
  };

  return (
    <div className="px-4 py-6 md:px-8">
      <button onClick={() => navigate('/library')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </button>
      <h1 className="mt-4 font-display text-2xl font-medium">Add a score</h1>

      <div className="mt-6 max-w-2xl">
        {step === 1 && (
          <div>
            <p className="text-sm text-muted-foreground">How would you like to add it?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => { setMethod('upload'); setStep(2); }}
                className={`flex flex-col items-start gap-2 rounded-md border p-5 text-left hover:bg-accent ${method === 'upload' ? 'border-primary' : 'border-border'}`}
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="font-medium">Upload files</span>
                <span className="text-sm text-muted-foreground">PDF or images from your device</span>
              </button>
              <button
                onClick={() => { setMethod('photo'); setStep(2); }}
                className="flex flex-col items-start gap-2 rounded-md border border-border p-5 text-left hover:bg-accent"
              >
                <Camera className="h-5 w-5 text-primary" />
                <span className="font-medium">Take photos</span>
                <span className="text-sm text-muted-foreground">Capture pages with your camera</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-medium">Score details</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} placeholder="Moonlight Sonata" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="composer">Composer (optional)</Label>
                  <Input id="composer" value={details.composer} onChange={(e) => setDetails({ ...details, composer: e.target.value })} placeholder="Beethoven" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instrument">Instrument (optional)</Label>
                  <Input id="instrument" value={details.instrument} onChange={(e) => setDetails({ ...details, instrument: e.target.value })} placeholder="Piano" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input id="tags" value={details.tags} onChange={(e) => setDetails({ ...details, tags: e.target.value })} placeholder="Classical, Recital" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-medium">Files</h2>
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                    <FileMusic className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-sm">{f.name}</span>
                    <button className="rounded p-1.5 text-muted-foreground hover:bg-accent"><RotateCw className="h-4 w-4" /></button>
                    <button onClick={() => removeFile(f.id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={addFile} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add more
              </button>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={startRecognition}>Start recognition</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl font-medium">Your score is being prepared</h2>
            <p className="mt-1 text-sm text-muted-foreground">{details.title || 'Untitled score'}</p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Recognizing music</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">You can leave this page. We'll let you know when it's ready.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/library')}>Back to library</Button>
              <Button onClick={() => navigate('/imports')}>View imports</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}