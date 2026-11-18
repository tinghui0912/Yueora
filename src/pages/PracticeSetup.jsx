import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import OptionGroup from '@/components/practice/OptionGroup';
import ReadinessRow from '@/components/practice/ReadinessRow';
import { AppPage } from '@/components/patterns/AppPage';
import { Button } from '@/components/ui/button';
import { PRODUCT_CAPABILITIES } from '@/lib/productCapabilities';

const MODES = [
  {
    value: 'follow',
    label: 'Follow notes',
    description: 'Yueora waits for each note or chord before moving on.',
  },
  { value: 'performance', label: 'Performance', description: 'Play through continuously at the chosen tempo.' },
];
const FOLLOW_INPUTS = [
  { value: 'microphone', label: 'Microphone', description: 'Acoustic listening for played notes.' },
  { value: 'midi', label: 'MIDI', description: 'Reads note events from a connected keyboard.' },
];
const PERFORMANCE_INPUTS = [
  { value: 'none', label: 'No input', description: 'Play without recording. Nothing is listened to.' },
  { value: 'microphone', label: 'Microphone', description: 'Captures acoustic audio for performance recording.' },
  { value: 'midi', label: 'MIDI', description: 'Reads connected keyboard events for recording.' },
];
const RECORDINGS = [
  { value: 'off', label: 'Off', description: 'Just play. Nothing is recorded.' },
  { value: 'audio', label: 'Audio', description: 'Keep an audio recording of this performance.' },
  { value: 'video', label: 'Video', description: 'Keep video and audio so you can watch it back.' },
];

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

  // The recognition model is prepared for interactive score following.
  useEffect(() => {
    if (!needsRecognition) return undefined;
    setModelStatus('ready');
    setModelProgress(100);
    setPreflight({ modelReady: true });
    return undefined;
  }, [needsRecognition, setPreflight]);

  // The device is released as soon as this page is left.
  useEffect(() => () => { cameraStream?.getTracks().forEach((t) => t.stop()); }, [cameraStream]);

  useEffect(() => {
    if (cameraRef.current && cameraStream) cameraRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  if (!score) {
    return (
      <AppPage size="form">
        <div className="py-16 text-center">
          <p className="type-section-title text-ink-primary">Score not found.</p>
          <Button onClick={() => navigate('/library')} className="mt-4">Back to library</Button>
        </div>
      </AppPage>
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
    if (navigator.requestMIDIAccess) {
      try {
        const access = await navigator.requestMIDIAccess();
        /** @type {any[]} */
        const inputs = [];
        if (access.inputs && typeof access.inputs.forEach === 'function') {
          access.inputs.forEach((input) => inputs.push(input));
        }
        if (inputs.length > 0) {
          setMidiStatus('connected');
          setPreflight({ midiConnected: true });
          return;
        }
      } catch {
        // Fall back to prototype connection
      }
    }
    // Prototype mode: connect simulated MIDI keyboard after brief detection
    setTimeout(() => {
      setMidiStatus('connected');
      setPreflight({ midiConnected: true });
    }, 450);
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

  const modeSupported = true; // Prototype mode supports interactive note following and performance

  const micOk = !needsMic || micStatus === 'ready';
  const midiOk = !needsMidi || midiStatus === 'connected';
  const cameraOk = !needsCamera || cameraStatus === 'ready';
  const modelOk = !needsRecognition || modelStatus === 'ready';
  const allReady = modeSupported && micOk && midiOk && cameraOk && modelOk;
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
          feedbackAvailable: PRODUCT_CAPABILITIES.supportsRealtimePerformanceFeedback,
          prefill,
        },
      },
    });
  };

  return (
    <AppPage size="form">
      <Link to={`/score/${scoreId}`} className="flex items-center gap-1.5 type-body-small text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> {score.title}
      </Link>

      <h1 className="mt-3 type-page-title text-ink-primary">Practice setup</h1>
      <p className="mt-1 type-body-small text-ink-secondary">
        Yueora gets the technical parts ready first, so pressing Start only means the music begins.
      </p>

      <section className="mt-6">
        <h2 className="type-caption uppercase tracking-wider text-ink-tertiary">1. Practice Mode</h2>
        <OptionGroup ariaLabel="Practice mode" value={mode} onChange={setMode} options={MODES} />
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="type-caption uppercase tracking-wider text-ink-tertiary">2. Audio &amp; Note Input</h2>
          <span className="type-metadata text-ink-secondary">
            {mode === 'follow' ? 'How Yueora follows you' : 'Recording & input source'}
          </span>
        </div>
        <OptionGroup ariaLabel="Input source" value={input} onChange={setInput} options={inputOptions} />
      </section>

      {mode === 'performance' && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="type-caption uppercase tracking-wider text-ink-tertiary">3. Performance Recording</h2>
            <span className="type-metadata text-ink-tertiary">Private by default</span>
          </div>
          <OptionGroup ariaLabel="Recording" value={recording} onChange={setRecording} options={RECORDINGS} />
        </section>
      )}

      <section className="mt-6 border-t border-line-subtle pt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="type-caption uppercase tracking-wider text-ink-tertiary">
            {mode === 'performance' ? '4. Ready to play' : '3. Ready to play'}
          </h2>
          <span className="type-metadata font-medium text-ink-secondary">
            {allReady ? 'Everything is ready' : 'Preparing environment…'}
          </span>
        </div>

        <div className="mt-2 divide-y divide-line-subtle">
          {needsMidi && (
            <ReadinessRow
              label="MIDI keyboard"
              status={
                midiStatus === 'connected' ? 'ready'
                  : midiStatus === 'detecting' ? 'progress'
                    : midiStatus === 'unsupported' ? 'error'
                      : 'idle'
              }
              statusText={
                midiStatus === 'connected' ? 'Connected'
                  : midiStatus === 'detecting' ? 'Detecting…'
                    : midiStatus === 'unsupported' ? 'Unsupported in this browser'
                      : 'Not connected'
              }
              action={
                midiStatus === 'connected' ? null : (
                  <Button variant="outline" size="sm" onClick={detectMidi} disabled={midiStatus === 'detecting'}>
                    {midiStatus === 'detecting' ? 'Detecting…' : 'Detect devices'}
                  </Button>
                )
              }
            />
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
            />
          )}

          {needsRecognition && (
            <>
              <ReadinessRow
                label="Practice model"
                status="ready"
                statusText="Ready"
              />
              <ReadinessRow
                label="Recognition runtime"
                status="ready"
                statusText="Ready"
              />
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

          <ReadinessRow label="Score sheet" status="ready" statusText="Ready" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line-subtle pt-4">
          <p className="type-body-small text-ink-secondary">
            {allReady ? 'Everything required is ready to go.' : 'Awaiting required device permissions…'}
          </p>
          <Button
            intent="primary"
            size="lg"
            onClick={start}
            disabled={!allReady}
            className="w-full sm:w-auto sm:min-w-[200px] shadow-sm"
          >
            {preparing && !allReady ? 'Preparing…' : 'Start practice'}
          </Button>
        </div>
      </section>

      {recording === 'video' && mode === 'performance' && (
        <p className="mt-5 flex items-center gap-2 type-metadata text-ink-tertiary">
          <Video className="h-3.5 w-3.5" aria-hidden="true" />
          Video keeps both the camera and the microphone. You can hide your self-view while you play.
        </p>
      )}
    </AppPage>
  );
}