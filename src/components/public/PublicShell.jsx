import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

/**
 * PublicShell — Surface A: Marketing / Help / Legal.
 * Flex column with sticky footer behavior (min-h-dvh).
 * Header + Footer + flexible main.
 */
export default function PublicShell({ children = null, maxWidth: _maxWidth = undefined }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <PublicHeader />
      <main className="min-h-0 flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}