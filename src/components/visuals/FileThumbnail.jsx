/**
 * FileThumbnail — small page thumbnail for file rows in Add Score / Import Detail.
 * Uses MockScanPage at a small size with a subtle border + shadow.
 */
import MockScanPage from './MockScanPage';

export default function FileThumbnail({ seed = 'page-1', className = '' }) {
  return (
    <div className={`shrink-0 overflow-hidden rounded border border-line-subtle bg-surface-panel shadow-sm ${className}`}>
      <MockScanPage seed={seed} className="h-full w-full" />
    </div>
  );
}