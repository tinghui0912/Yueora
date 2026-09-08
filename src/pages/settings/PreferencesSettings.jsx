import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function PreferencesSettings() {
  const [metronome, setMetronome] = useState(true);
  const [countIn, setCountIn] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [notation, setNotation] = useState([70]);
  const [tempo, setTempo] = useState([90]);
  const [appearance, setAppearance] = useState('system');

  return (
    <div className="space-y-6">
      <Section title="Practice defaults" desc="Applied when you start a new practice session.">
        <div className="max-w-sm space-y-5">
          <Toggle label="Metronome" desc="Play a click while practicing." checked={metronome} onChange={setMetronome} />
          <Toggle label="Count-in" desc="One bar of clicks before you start." checked={countIn} onChange={setCountIn} />
          <Toggle label="Auto-scroll" desc="Follow the score as you play." checked={autoScroll} onChange={setAutoScroll} />
          <div className="space-y-2">
            <Label>Default tempo: {tempo[0]} BPM</Label>
            <Slider value={tempo} onValueChange={setTempo} min={40} max={208} step={1} />
          </div>
        </div>
      </Section>

      <Section title="Score display" desc="How scores appear on screen.">
        <div className="max-w-sm space-y-5">
          <div className="space-y-2">
            <Label>Notation size: {notation[0]}%</Label>
            <Slider value={notation} onValueChange={setNotation} min={60} max={140} step={5} />
          </div>
          <div className="space-y-2">
            <Label>Page fit</Label>
            <div className="inline-flex rounded-md border border-border p-0.5">
              {[['width', 'Fit width'], ['page', 'Fit page']].map(([v, l]) => (
                <button key={v} className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">{l}</button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Appearance" desc="Choose how Yueora looks.">
        <div className="inline-flex rounded-md border border-border p-0.5">
          {[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => (
            <button key={v} onClick={() => setAppearance(v)} className={`rounded px-3 py-1.5 text-sm ${appearance === v ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/60'}`}>{l}</button>
          ))}
        </div>
      </Section>

      <Section title="Language & region" desc="Interface language.">
        <select className="h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 text-sm">
          <option>English</option>
          <option>中文</option>
        </select>
      </Section>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div><Label>{label}</Label><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}