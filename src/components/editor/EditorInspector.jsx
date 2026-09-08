import { Music2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const durations = [
  { v: '1', label: 'Whole' },
  { v: '2', label: 'Half' },
  { v: '4', label: 'Quarter' },
  { v: '8', label: 'Eighth' },
];
const stems = [
  { v: 'auto', label: 'Auto' },
  { v: 'up', label: 'Up' },
  { v: 'down', label: 'Down' },
];
const voices = ['1', '2'];
const fingers = ['—', '1', '2', '3', '4', '5'];

export default function EditorInspector({ note, onChange }) {
  if (!note) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</p>
        <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
          <Music2 className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a note to edit its pitch, duration, articulation and fingering.</p>
        </div>
      </div>
    );
  }

  const pitch = pitches[note.step % 7];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</p>
      <div className="mt-3 rounded-md border border-border bg-accent/40 px-3 py-2">
        <p className="text-sm font-medium">{pitch} · {durations.find((d) => d.v === note.duration)?.label}</p>
        <p className="text-xs text-muted-foreground">Staff {note.staff + 1} · Measure {note.measure + 1}</p>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Pitch">
          <Select value={pitch} onValueChange={(v) => onChange({ ...note, step: pitches.indexOf(v) + (note.step >= 7 ? 7 : 0) })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{pitches.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Duration">
          <Select value={note.duration} onValueChange={(v) => onChange({ ...note, duration: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{durations.map((d) => <SelectItem key={d.v} value={d.v}>{d.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Voice">
          <Select value={String(note.voice ?? 1)} onValueChange={(v) => onChange({ ...note, voice: Number(v) })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{voices.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Stem">
          <Select value={note.stem ?? 'auto'} onValueChange={(v) => onChange({ ...note, stem: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{stems.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Fingering">
          <Select value={note.finger ?? '—'} onValueChange={(v) => onChange({ ...note, finger: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{fingers.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}