import { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ImportDropzone({ onImport }) {
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);

  const addFiles = (files) => {
    Array.from(files).forEach((f) => onImport({ title: f.name.replace(/\.[^.]+$/, ''), source: 'file' }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const addUrl = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onImport({ title: url.trim().split('/').pop().replace(/\.[^.]+$/, '') || 'Imported score', source: 'url' });
    setUrl('');
  };

  return (
    <div className="rounded-container border border-line-subtle bg-surface-panel p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-control border-2 border-dashed py-10 text-center transition-colors ${
          dragging ? 'border-brand bg-surface-canvas text-brand' : 'border-line-subtle hover:bg-neutral-hover text-ink-secondary'
        }`}
      >
        <UploadCloud className="h-7 w-7 text-ink-secondary" />
        <p className="type-body-small font-medium text-ink-primary">Drop sheet music here, or click to browse</p>
        <p className="type-caption text-ink-secondary">PDF, PNG, JPG, or MusicXML · up to 50 MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.xml,.mxl,application/pdf,image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="type-caption text-ink-secondary">Or import from a link</span>
        <form onSubmit={addUrl} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a PDF or MusicXML URL" className="pl-9" />
          </div>
          <Button type="submit" intent="secondary">Import</Button>
        </form>
      </div>

      <div className="mt-4 flex items-center gap-4 type-caption text-ink-secondary">
        <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> PDF</span>
        <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Scan / photo</span>
        <span className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> URL</span>
      </div>
    </div>
  );
}
