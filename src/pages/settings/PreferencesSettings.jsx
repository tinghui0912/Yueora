import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { NativeSelect } from '@/components/ui/select';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import { SegmentedControl, SegmentedControlItem } from '@/components/patterns/SegmentedControl';

export default function PreferencesSettings() {
  const prefs = usePrototypeStore((s) => s.preferences);
  const update = usePrototypeStore((s) => s.updatePreferences);

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Practice defaults" desc="Applied when you start a new practice session.">
        <div className="max-w-sm space-y-5">
          <Toggle label="Metronome" desc="Play a click while practicing." checked={prefs.metronome} onChange={(v) => update({ metronome: v })} />
          <Toggle label="Count-in" desc="One bar of clicks before you start." checked={prefs.countIn} onChange={(v) => update({ countIn: v })} />
          <Toggle label="Auto-scroll" desc="Follow the score as you play." checked={prefs.autoScroll} onChange={(v) => update({ autoScroll: v })} />
          <div className="space-y-2">
            <Label>Default tempo: {prefs.tempo} BPM</Label>
            <Slider value={[prefs.tempo]} onValueChange={(v) => update({ tempo: v[0] })} min={40} max={208} step={1} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Score display" desc="How scores appear on screen.">
        <div className="max-w-sm space-y-5">
          <div className="space-y-2">
            <Label>Notation size: {prefs.notationSize}%</Label>
            <Slider value={[prefs.notationSize]} onValueChange={(v) => update({ notationSize: v[0] })} min={60} max={140} step={5} />
          </div>
          <div className="space-y-2">
            <Label>Page fit</Label>
            <SegmentedControl
              value={prefs.pageFit}
              onValueChange={(v) => update({ pageFit: v })}
              aria-label="Page fit"
            >
              <SegmentedControlItem value="width">Fit width</SegmentedControlItem>
              <SegmentedControlItem value="page">Fit page</SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Language" desc="Interface language.">
        <div className="max-w-sm">
          <NativeSelect
            value={prefs.language}
            onChange={(e) => update({ language: e.target.value })}
          >
            <option>English</option>
            <option>中文</option>
          </NativeSelect>
        </div>
      </SettingsSection>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div><Label>{label}</Label><p className="type-metadata text-ink-tertiary">{desc}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}