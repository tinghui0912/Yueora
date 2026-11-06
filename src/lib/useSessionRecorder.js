import { useCallback, useRef, useState } from 'react';

/**
 * Real microphone / camera capture for a practice session.
 *
 * Nothing leaves the device: the recorder only hands back a Blob, and the
 * report decides whether the user wants to keep it.
 */
export default function useSessionRecorder() {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [state, setState] = useState('idle'); // idle | starting | recording | unavailable
  const [error, setError] = useState(null);

  const releaseTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async (kind) => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const message = 'This browser cannot record audio or video.';
      setState('unavailable');
      setError(message);
      return { ok: false, error: message };
    }

    setState('starting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferred = kind === 'video'
        ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        : ['audio/webm;codecs=opus', 'audio/webm'];
      const mimeType = preferred.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      setState('recording');
      return { ok: true };
    } catch (err) {
      releaseTracks();
      const message = err?.name === 'NotAllowedError'
        ? 'Microphone or camera access was declined, so this session is running without a recording.'
        : 'Recording could not start, so this session is running without a recording.';
      setState('unavailable');
      setError(message);
      return { ok: false, error: message };
    }
  }, [releaseTracks]);

  const stop = useCallback(() => new Promise((resolve) => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      releaseTracks();
      recorderRef.current = null;
      setState('idle');
      resolve(null);
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      chunksRef.current = [];
      recorderRef.current = null;
      releaseTracks();
      setState('idle');
      resolve(blob.size > 0 ? blob : null);
    };

    try {
      recorder.stop();
    } catch {
      recorderRef.current = null;
      releaseTracks();
      setState('idle');
      resolve(null);
    }
  }), [releaseTracks]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      try { recorder.stop(); } catch { /* already stopped */ }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    releaseTracks();
    setState('idle');
  }, [releaseTracks]);

  return { state, error, start, stop, cancel };
}