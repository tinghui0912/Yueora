import { Link } from 'react-router-dom';
import { EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const ToggleRow = ({ label, hint, checked, onCheckedChange, disabled }) => (
  <div className="flex items-center justify-between gap-3 border-t border-line-subtle py-3">
    <div className="min-w-0">
      <p className="type-body-small text-ink-primary">{label}</p>
      {hint && <p className="type-metadata text-ink-tertiary">{hint}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={label} />
  </div>
);

/**
 * Session settings. What setup decided is read-only here; what belongs to this
 * practice (how the score is shown) can be changed freely.
 */
export default function PracticeSettingsDialog({
  open, onOpenChange, scoreId, mode, input, recording, rangeText,
  feedbackAvailable, feedbackOn, onFeedback,
  virtualKeyboard, onVirtualKeyboard, showNoteNames, onShowNoteNames,
  highlightMeasure, onHighlightMeasure, selfViewHidden, onSelfViewHidden,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session settings</DialogTitle>
          <DialogDescription>What this session was prepared for, and how the score is shown.</DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 type-body-small">
          <div className="flex justify-between"><dt className="text-ink-secondary">Mode</dt><dd className="text-ink-primary">{mode === 'follow' ? 'Follow notes' : 'Performance'}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Input</dt><dd className="text-ink-primary">{input === 'none' ? 'No input' : input === 'midi' ? 'MIDI' : 'Microphone'}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Recording</dt><dd className="text-ink-primary capitalize">{recording}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-secondary">Section</dt><dd className="text-ink-primary">{rangeText}</dd></div>
        </dl>

        <div className="mt-2">
          {mode === 'performance' && (
            <>
              <ToggleRow
                label="Real-time feedback"
                hint={
                  feedbackAvailable
                    ? 'Reference only — a listening model never hears every note.'
                    : 'Unavailable. Configure an input in setup.'
                }
                checked={feedbackAvailable && feedbackOn}
                onCheckedChange={onFeedback}
                disabled={!feedbackAvailable}
              />
              {!feedbackAvailable && (
                <p className="pb-2 type-metadata text-ink-tertiary">
                  <Link to={`/score/${scoreId}/setup`} className="text-brand hover:underline">Configure an input in setup</Link>
                </p>
              )}
            </>
          )}
          <ToggleRow label="Virtual keyboard" hint="A visual guide, not a connected device." checked={virtualKeyboard} onCheckedChange={onVirtualKeyboard} />
          <ToggleRow label="Show note names" checked={showNoteNames} onCheckedChange={onShowNoteNames} />
          <ToggleRow label="Highlight current measure" checked={highlightMeasure} onCheckedChange={onHighlightMeasure} />
          {recording === 'video' && (
            <div className="flex items-center justify-between gap-3 border-t border-line-subtle py-3">
              <span className="flex items-center gap-2 type-body-small text-ink-primary"><EyeOff className="h-4 w-4 text-ink-tertiary" aria-hidden="true" /> Hide self-view</span>
              <Switch checked={selfViewHidden} onCheckedChange={onSelfViewHidden} aria-label="Hide self-view" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button asChild variant="outline">
            <Link to={`/score/${scoreId}/setup`}>Return to setup</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}