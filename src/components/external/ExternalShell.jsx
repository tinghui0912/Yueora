import ExternalHeader from './ExternalHeader';
import ExternalFooter from './ExternalFooter';

/**
 * ExternalShell — Surface B: task-oriented public surfaces.
 * Only for /s/:shareToken and /invite/:inviteToken.
 * Compact header + footer, no marketing navigation.
 * Flex column with sticky footer behavior (min-h-dvh).
 */
export default function ExternalShell({ sharedBy = undefined, children = null }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <ExternalHeader sharedBy={sharedBy} />
      <main className="min-h-0 flex-1">
        {children}
      </main>
      <ExternalFooter />
    </div>
  );
}