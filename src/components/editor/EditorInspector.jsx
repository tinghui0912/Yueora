import { Music2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const octaves = ['3', '4', '5', '6'];
const durations = [
  { v: '1', label: 'Whole' },
  { v: '2', label: 'Half' },
  { v: '4', label: 'Quarter' },
  { v: '8', label: 'Eighth' },
];
const accidentals = [
  { v: 'none', label: '—' },
  { v: 'sharp', label: '♯ Sharp' },
  { v: 'flat', label: '♭ Flat' },
  { v: 'natural', label: '♮ Natural' },
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
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Inspector</p>
        <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
          <Music2 className="h-6 w-6 text-ink-secondary/70" />
          <p className="text-sm text-ink-secondary">Select a note to edit its pitch, duration, articulation and fingering.</p>
        </div>
      </div>
    );
  }

  const isRest = note.type === 'rest';
  const pitch = pitches[note.step % 7];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/70">Inspector</p>
      <div className="mt-3 rounded-control border border-surface-paper-edge bg-surface-paper/70 px-3.5 py-2.5">
        <p className="text-sm font-semibold text-ink-primary">{isRest ? 'Rest' : pitch} · {durations.find((d) => d.v === note.duration)?.label}{note.dotted ? ' (dotted)' : ''}</p>
        <p className="text-xs text-ink-secondary mt-0.5">Staff {note.staff + 1} · Measure {note.measure + 1}</p>
      </div>

      <div className="mt-4 space-y-3">
        {!isRest && (
          <>
            <Field label="Pitch">
              <Select value={pitch} onValueChange={(v) => onChange({ ...note, step: pitches.indexOf(v) + (note.step >= 7 ? 7 : 0) })}>
                <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{pitches.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Octave">
              <Select value={String(note.octave ?? 4)} onValueChange={(v) => onChange({ ...note, octave: Number(v) })}>
                <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{octaves.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Accidental">
              <Select value={note.accidental || 'none'} onValueChange={(v) => onChange({ ...note, accidental: v === 'none' ? undefined : v })}>
                <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{accidentals.map((a) => <SelectItem key={a.v} value={a.v}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </>
        )}
        <Field label="Duration">
          <Select value={note.duration} onValueChange={(v) => onChange({ ...note, duration: v })}>
            <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{durations.map((d) => <SelectItem key={d.v} value={d.v}>{d.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-control border border-surface-paper-edge bg-surface-paper/40 px-3 py-2">
          <Label className="type-label font-medium text-ink-secondary">Dotted</Label>
          <Switch checked={!!note.dotted} onCheckedChange={(v) => onChange({ ...note, dotted: v || undefined })} />
        </div>
        <Field label="Voice">
          <Select value={String(note.voice ?? 1)} onValueChange={(v) => onChange({ ...note, voice: Number(v) })}>
            <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{voices.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Stem">
          <Select value={note.stem ?? 'auto'} onValueChange={(v) => onChange({ ...note, stem: v })}>
            <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{stems.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        {!isRest && (
          <Field label="Fingering">
            <Select value={note.finger ?? '—'} onValueChange={(v) => onChange({ ...note, finger: v })}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{fingers.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        )}
        {!isRest && (
          <div className="rounded-control border border-surface-paper-edge bg-surface-paper/40 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <Label className="type-label font-medium text-ink-secondary">Tie</Label>
              <span className={`type-metadata ${note.tieTo ? 'text-brand font-medium' : 'text-ink-secondary/70'}`}>{note.tieTo ? 'Connected' : 'Not set'}</span>
            </div>
            <p className="mt-1 type-metadata text-ink-secondary/70">Select the Tie tool, then click this note and the next note.</p>
          </div>
        )}
        {!isRest && (
          <div className="rounded-control border border-surface-paper-edge bg-surface-paper/40 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <Label className="type-label font-medium text-ink-secondary">Slur</Label>
              <span className={`type-metadata ${note.slurTo ? 'text-brand font-medium' : 'text-ink-secondary/70'}`}>{note.slurTo ? 'Connected' : 'Not set'}</span>
            </div>
            <p className="mt-1 type-metadata text-ink-secondary/70">Select the Slur tool, then click this note and the next note.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="type-label font-medium text-ink-secondary">{label}</Label>
      {children}
    </div>
  );
}