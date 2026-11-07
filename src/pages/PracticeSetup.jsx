import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import OptionGroup from '@/components/practice/OptionGroup';
import ReadinessRow from '@/components/practice/ReadinessRow';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const MODES = [
  { value: 'follow', label: 'Follow notes', description: 'Yueora waits for each note or chord before moving on.' },
  { value: 'performance', label: 'Performance', description: 'Play through continuously at the chosen tempo.' },
];
const FOLLOW_INPUTS = [
  { value: 'microphone', label: 'Microphone', description: 'Yueora listens for the notes you play.' },
  { value: 'midi', label: 'MIDI', description: 'Yueora reads note events from a connected keyboard.' },
];
const PERFORMANCE_INPUTS = [
  { value: 'none', label: 'No input', description: 'Play without real-time feedback. Nothing is listened to.' },
  { value: 'microphone', label: 'Microphone', description: 'Listens while you play, for optional real-time feedback.' },
  { value: 'midi', label: 'MIDI', description: 'Reads note events for optional real-time feedback.' },
];
const RECORDINGS = [
  { value: 'off', label: 'Off', description: 'Just play. Nothing is recorded.' },
  { value: 'audio', label: 'Audio', description: 'Keep an audio recording of this performance.' },
  { value: 'video', label: 'Video', description: 'Keep video and audio so you can watch it back.' },
];

const demoBtn = 'text-xs text-ink-tertiary underline-offset-2 hover:text-ink-primary hover:underline';

/**
 * Practice setup / preflight.
 *
 * Everything technical is prepared here — permissions, MIDI, the recognition
 * model. Once this page says ready, Start in the workspace only means:
 * the music begins now.
 */
export default function PracticeSetup() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  const score = usePrototypeStore((s) => s.scores.find((sc) => sc.id === scoreId));
  const preflight = usePrototypeStore((s) => s.preflight) || {};
  const setPreflight = usePrototypeStore((s) => s.setPreflight);

  const [mode, setMode] = useState('follow');
  const [input, setInput] = useState('microphone');
  const [recording, setRecording] = useState('off');

  const [micStatus, setMicStatus] = useState(preflight.micGranted ? 'ready' : 'not-tested');
  const [midiStatus, setMidiStatus] = useState(preflight.midiConnected ? 'connected' : 'no-device');
  const [cameraStatus, setCameraStatus] = useState(preflight.cameraGranted ? 'ready' : 'not-tested');
  const [modelStatus, setModelStatus] = useState(preflight.modelReady ? 'ready' : 'idle');
  const [modelProgress, setModelProgress] = useState(preflight.modelReady ? 100 : 0);
  const [cameraStream, setCameraStream] = useState(null);
  const cameraRef = useRef(null);

  // Only what this exact configuration depends on is checked.
  const needsRecognition = input === 'microphone';
  const needsMidi = input === 'midi';
  const needsRecordingMic = mode === 'performance' && (recording === 'audio' || recording === 'video');
  const needsCamera = mode === 'performance' && recording === 'video';
  const needsMic = needsRecognition || needsRecordingMic;
  const inputOptions = mode === 'follow' ? FOLLOW_INPUTS : PERFORMANCE_INPUTS;

  // Follow notes cannot run without an input; Performance may run with none.
  useEffect(() => {
    if (mode === 'follow' && input === 'none') setInput('microphone');
  }, [mode, input]);

  // The recognition model is prepared on arrival, never after Start.
  useEffect(() => {
    if (!needsRecognition) return undefined;
    if (preflight.modelReady) {
      setModelStatus('ready');
      setModelProgress(100);
      return undefined;
    }
    setModelStatus('checking');
    setModelProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + 11);
      setModelProgress(p);
      setModelStatus(p >= 100 ? 'ready' : 'downloading');
      if (p >= 100) {
        clearInterval(id);
        setPreflight({ modelReady: true });
      }
    }, 260);
    return () => clearInterval(id);
  }, [needsRecognition, preflight.modelReady, setPreflight]);

  // The device is released as soon as this page is left.
  useEffect(() => () => { cameraStream?.getTracks().forEach((t) => t.stop()); }, [cameraStream]);

  useEffect(() => {
    if (cameraRef.current && cameraStream) cameraRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  if (!score) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-display text-xl">Score not found.</p>
        <Button onClick={() => navigate('/library')} className="mt-4">Back to library</Button>
      </div>
    );
  }

  // Readiness is asked of the browser, not assumed. A device only reads "Ready"
  // once it has actually answered.
  const checkMic = async () => {
    setMicStatus('requesting');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unavailable');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus('ready');
      setPreflight({ micGranted: true });
    } catch (err) {
      setMicStatus(err?.name === 'NotAllowedError' ? 'denied' : 'unavailable');
    }
  };

  const detectMidi = async () => {
    setMidiStatus('detecting');
    if (!navigator.requestMIDIAccess) {
      setMidiStatus('unsupported');
      return;
    }
    try {
      const access = await navigator.requestMIDIAccess();
      const inputs = Array.from(access.inputs.values());
      setMidiStatus(inputs.length > 0 ? 'connected' : 'disconnected');
      if (inputs.length > 0) setPreflight({ midiConnected: true });
    } catch {
      setMidiStatus('unsupported');
    }
  };

  const checkCamera = async () => {
    setCameraStatus('requesting');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraStatus('ready');
      setPreflight({ cameraGranted: true });
    } catch (err) {
      setCameraStatus(err?.name === 'NotAllowedError' ? 'denied' : 'unavailable');
    }
  };

  const micOk = !needsMic || micStatus === 'ready';
  const midiOk = !needsMidi || midiStatus === 'connected';
  const cameraOk = !needsCamera || cameraStatus === 'ready';
  const modelOk = !needsRecognition || modelStatus === 'ready';
  const allReady = micOk && midiOk && cameraOk && modelOk;
  const preparing =
    modelStatus === 'checking' || modelStatus === 'downloading' ||
    micStatus === 'requesting' || midiStatus === 'detecting' || cameraStatus === 'requesting';

  const micLabel = needsRecognition ? 'Microphone' : 'Microphone · for recording';
  const micStatusText = {
    ready: 'Ready',
    requesting: 'Requesting…',
    'no-input': 'No input detected',
    denied: 'Permission denied',
    unavailable: 'Unavailable',
    'not-tested': 'Not tested',
  }[micStatus] || 'Not tested';

  const start = () => {
    navigate(`/score/${scoreId}/practice`, {
      state: {
        config: {
          mode,
          input,
          recording: mode === 'performance' ? recording : 'off',
          feedbackAvailable: input !== 'none',
          prefill,
        },
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to={`/score/${scoreId}`} className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> {score.title}
      </Link>

      <h1 className="mt-4 font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-primary">Practice setup</h1>
      <p className="mt-1.5 type-body-small text-ink-secondary">
        Yueora gets the technical parts ready first, so pressing Start only means the music begins.
      </p>

      <section className="mt-7">
        <h2 className="type-caption text-ink-tertiary">Mode</h2>
        <OptionGroup ariaLabel="Practice mode" value={mode} onChange={setMode} options={MODES} />
      </section>

      <section className="mt-7">
        <h2 className="type-caption text-ink-tertiary">Input</h2>
        <p className="mt-1 type-body-small text-ink-secondary">
          {mode === 'follow' ? 'How Yueora listens to your playing.' : 'Optional — used only for real-time feedback.'}
        </p>
        <OptionGroup ariaLabel="Input source" value={input} onChange={setInput} options={inputOptions} />
      </section>

      {mode === 'performance' && (
        <section className="mt-7">
          <h2 className="type-caption text-ink-tertiary">Recording</h2>
          <p className="mt-1 type-body-small text-ink-secondary">Keep a recording of this performance.</p>
          <OptionGroup ariaLabel="Recording" value={recording} onChange={setRecording} options={RECORDINGS} />
          <p className="mt-2 type-metadata text-ink-tertiary">
            Recording is optional. Nothing is uploaded unless you choose to save it.
          </p>
        </section>
      )}

      <section className="mt-8 border-t border-line-subtle pt-5">
        <h2 className="type-caption text-ink-tertiary">Ready to play</h2>

        <div className="mt-1 divide-y divide-line-subtle">
          {needsMidi && (
            <ReadinessRow
              label="MIDI keyboard"
              status={midiStatus === 'connected' ? 'ready' : midiStatus === 'disconnected' || midiStatus === 'unsupported' ? 'error' : midiStatus === 'detecting' ? 'progress' : 'idle'}
              statusText={
                midiStatus === 'connected' ? 'Connected'
                  : midiStatus === 'detecting' ? 'Detecting…'
                    : midiStatus === 'disconnected' ? 'Disconnected'
                      : midiStatus === 'unsupported' ? 'Unsupported' : 'No device'
              }
              action={
                midiStatus === 'connected' ? null : (
                  <Button variant="outline" size="sm" onClick={detectMidi} disabled={midiStatus === 'detecting'}>
                    {midiStatus === 'detecting' ? 'Detecting…' : 'Detect devices'}
                  </Button>
                )
              }
            >
              <div className="flex flex-wrap gap-3">
                <button type="button" className={demoBtn} onClick={() => setMidiStatus('unsupported')}>Demo: unsupported</button>
                <button type="button" className={demoBtn} onClick={() => setMidiStatus('disconnected')}>Demo: disconnect</button>
              </div>
            </ReadinessRow>
          )}

          {needsMic && (
            <ReadinessRow
              label={micLabel}
              detail={needsRecognition ? null : 'Used only for the recording — notes still come from MIDI.'}
              status={
                micStatus === 'ready' ? 'ready'
                  : micStatus === 'requesting' ? 'progress'
                    : micStatus === 'not-tested' ? 'idle' : 'error'
              }
              statusText={micStatusText}
              action={
                micStatus === 'ready' ? null : (
                  <Button variant="outline" size="sm" onClick={checkMic} disabled={micStatus === 'requesting'}>
                    {micStatus === 'requesting' ? 'Checking…' : 'Check microphone'}
                  </Button>
                )
              }
            >
              <div className="flex flex-wrap gap-3">
                <button type="button" className={demoBtn} onClick={() => setMicStatus('no-input')}>Demo: no input</button>
                <button type="button" className={demoBtn} onClick={() => setMicStatus('denied')}>Demo: deny permission</button>
                <button type="button" className={demoBtn} onClick={() => setMicStatus('unavailable')}>Demo: unavailable</button>
              </div>
            </ReadinessRow>
          )}

          {needsRecognition && (
            <>
              <ReadinessRow
                label="Practice model"
                status={modelStatus === 'ready' ? 'ready' : modelStatus === 'unavailable' ? 'error' : 'progress'}
                statusText={
                  modelStatus === 'ready' ? 'Ready'
                    : modelStatus === 'checking' ? 'Checking…'
                      : modelStatus === 'downloading' ? `Downloading… ${modelProgress}%`
                        : modelStatus === 'unavailable' ? 'Unavailable' : 'Preparing'
                }
              >
                {modelStatus !== 'ready' && modelStatus !== 'unavailable' && (
                  <Progress value={modelProgress} className="h-1.5 max-w-xs" aria-label="Practice model download" />
                )}
              </ReadinessRow>
              <ReadinessRow
                label="Recognition runtime"
                status={modelStatus === 'ready' ? 'ready' : 'progress'}
                statusText={modelStatus === 'ready' ? 'Ready' : 'Preparing'}
              />
              <p className="py-2 type-metadata text-ink-tertiary">
                Prototype: the recognition model is simulated here — nothing is actually downloaded to this device.
              </p>
            </>
          )}

          {needsCamera && (
            <ReadinessRow
              label="Camera"
              status={
                cameraStatus === 'ready' ? 'ready'
                  : cameraStatus === 'requesting' ? 'progress'
                    : cameraStatus === 'not-tested' ? 'idle' : 'error'
              }
              statusText={
                cameraStatus === 'ready' ? 'Ready'
                  : cameraStatus === 'requesting' ? 'Requesting…'
                    : cameraStatus === 'denied' ? 'Permission denied'
                      : cameraStatus === 'unavailable' ? 'Unavailable' : 'Not tested'
              }
              action={
                cameraStatus === 'ready' ? null : (
                  <Button variant="outline" size="sm" onClick={checkCamera} disabled={cameraStatus === 'requesting'}>
                    {cameraStatus === 'requesting' ? 'Checking…' : 'Check camera'}
                  </Button>
                )
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className={demoBtn} onClick={() => setCameraStatus('denied')}>Demo: deny camera</button>
                <button type="button" className={demoBtn} onClick={() => setCameraStatus('unavailable')}>Demo: unavailable</button>
              </div>
              {cameraStatus === 'ready' && (
                <div className="mt-2 flex items-center gap-3">
                  <video
                    ref={cameraRef}
                    autoPlay
                    muted
                    playsInline
                    aria-label="Camera preview"
                    className="h-16 w-24 rounded-control border border-line-subtle bg-ink-primary/10 object-cover"
                  />
                  <p className="type-metadata text-ink-tertiary">This is the camera Yueora will record from.</p>
                </div>
              )}
            </ReadinessRow>
          )}

          <ReadinessRow label="Score" status="ready" statusText="Ready" />
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-body-small text-ink-secondary">
            {allReady ? 'Everything is ready.' : 'Yueora is getting things ready.'}
          </p>
          <Button onClick={start} disabled={!allReady} className="sm:min-w-[180px]">
            {preparing && !allReady ? 'Preparing…' : 'Continue to practice'}
          </Button>
        </div>
      </section>

      {recording === 'video' && mode === 'performance' && (
        <p className="mt-6 flex items-center gap-2 type-metadata text-ink-tertiary">
          <Video className="h-3.5 w-3.5" aria-hidden="true" />
          Video keeps both the camera and the microphone. You can hide your self-view while you play.
        </p>
      )}
    </div>
  );
}