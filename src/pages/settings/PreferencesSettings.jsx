import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function PreferencesSettings() {
  const [metronome, setMetronome] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [notation, setNotation] = useState([70]);
  const [tempo, setTempo] = useState([90]);

  return (
    <div className="space-y-6">
      <Section title="Practice defaults" desc="Applied when you start a new practice session.">
        <div className="max-w-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>Metronome</Label>
              <p className="text-xs text-muted-foreground">Play a click while practicing.</p>
            </div>
            <Switch checked={metronome} onCheckedChange={setMetronome} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-advance bars</Label>
              <p className="text-xs text-muted-foreground">Move to the next bar automatically.</p>
            </div>
            <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
          </div>
          <div className="space-y-2">
            <Label>Default tempo: {tempo[0]} BPM</Label>
            <Slider value={tempo} onValueChange={setTempo} min={40} max={208} step={1} />
          </div>
        </div>
      </Section>

      <Section title="Display" desc="How scores appear on screen.">
        <div className="max-w-sm space-y-5">
          <div className="space-y-2">
            <Label>Notation size: {notation[0]}%</Label>
            <Slider value={notation} onValueChange={setNotation} min={60} max={140} step={5} />
          </div>
        </div>
      </Section>
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