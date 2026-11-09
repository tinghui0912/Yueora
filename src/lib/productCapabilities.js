/**
 * Product Capabilities Contract
 *
 * Truthful runtime capability declarations for Yueora.
 * Product UI must never infer feature implementation merely from device availability
 * (e.g. navigator.requestMIDIAccess() detecting a device !== note-matching runtime implemented).
 * UI features render according to these authoritative capability flags.
 */

export const PRODUCT_CAPABILITIES = {
  /**
   * Real-time acoustic pitch recognition & phrase following via microphone.
   * Internal model simulation exists in DEV; production runtime is in private preview.
   */
  supportsMicrophoneFollow: false,

  /**
   * Real-time Web MIDI input event decoding and note/chord score matching.
   * MIDI device detection exists, but matching runtime is in development.
   */
  supportsMidiFollow: false,

  /**
   * Performance mode real-time pitch/intonation accuracy analysis.
   * In development. Performance mode plays through continuously at tempo.
   */
  supportsRealtimePerformanceFeedback: false,

  /**
   * Session audio recording via browser MediaRecorder API.
   * Production ready.
   */
  supportsAudioRecording: true,

  /**
   * Session video + audio recording via browser MediaRecorder API.
   * Production ready.
   */
  supportsVideoRecording: true,
};

export default PRODUCT_CAPABILITIES;
