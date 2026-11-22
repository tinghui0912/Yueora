import { useEffect, useMemo } from 'react';

/**
 * Plays the recording that was actually captured in the session — the real file,
 * never a placeholder.
 */
export default function RecordedMedia({ blob, mediaType }) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  if (!url) return null;

  if (mediaType === 'video') {
    return (
      <video
        src={url}
        controls
        playsInline
        className="w-full rounded-container border border-line-subtle bg-ink-primary"
      />
    );
  }

  return <audio src={url} controls className="w-full" />;
}