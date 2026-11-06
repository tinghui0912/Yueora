import { base44 } from '@/api/base44Client';

export const extensionFor = (blob) => {
  const type = (blob && blob.type) || '';
  if (type.includes('mp4')) return 'mp4';
  if (type.includes('mpeg')) return 'mp3';
  if (type.includes('wav')) return 'wav';
  return 'webm';
};

export const slugify = (text) =>
  (text || 'performance')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'performance';

/** Saves an in-memory recording to the device — the actual file, no placeholders. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Uploads a recording to private storage; only the returned uri is stored. */
export async function uploadRecording(blob, filename) {
  const file = new File([blob], filename, { type: blob.type || 'video/webm' });
  const result = await base44.integrations.Core.UploadPrivateFile({ file });
  if (!result?.file_uri) throw new Error('The recording could not be uploaded.');
  return result.file_uri;
}

/** Resolves a temporary, signed playback URL for a stored recording. */
export async function signedUrlFor(fileUri) {
  if (!fileUri) return null;
  const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });
  return result?.signed_url || null;
}