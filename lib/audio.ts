// WishVerse Audio System — Presets, Synthesis, Trimming, and Server-side Persistent Upload Handlers

export type AudioPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  durationSec: number;
};

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "music-box",
    name: "Music Box Lullaby",
    description: "Sweet, delicate tinkling chime melody",
    icon: "✨",
    durationSec: 12,
  },
  {
    id: "warm-piano",
    name: "Moonlight Piano",
    description: "Gentle, nostalgic acoustic chords",
    icon: "🎹",
    durationSec: 14,
  },
  {
    id: "starlight-harp",
    name: "Starlight Reverie",
    description: "Soft ambient arpeggios and warmth",
    icon: "💫",
    durationSec: 10,
  },
];

export const MAX_AUDIO_SOURCE_SIZE = 50 * 1024 * 1024; // 50MB source audio allowed
export const MIN_CLIP_DURATION = 5.0; // seconds
export const MAX_CLIP_DURATION = 20.0; // seconds

export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const kb = Math.round(bytes / 1024);
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// Forgiving audio format validation
export function validateAudioFile(file: File): void {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const validExts = [
    "mp3",
    "wav",
    "m4a",
    "aac",
    "ogg",
    "webm",
    "flac",
    "mp4",
    "wma",
    "aiff",
    "opus",
    "alac",
  ];
  const isAudioType =
    file.type.startsWith("audio/") ||
    file.type === "video/mp4" ||
    file.type === "video/webm" ||
    file.type === "application/octet-stream";

  if (!isAudioType && !validExts.includes(ext) && file.type !== "") {
    throw new Error("Please upload a supported audio file (MP3, WAV, M4A, AAC, or OGG).");
  }

  if (file.size > MAX_AUDIO_SOURCE_SIZE) {
    throw new Error(
      `Audio file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit.`
    );
  }
}

// Single shared AudioContext that stays open
let sharedAudioContext: AudioContext | null = null;
export function getSharedAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("Web Audio API must run in browser environment.");
  }
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContextClass();
  }
  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Decodes any browser-supported audio file into an AudioBuffer using the Web Audio API.
 * Uses both Promise and callback fallback for rock-solid cross-browser compatibility.
 */
export async function decodeAudioFile(
  file: File
): Promise<{ buffer: AudioBuffer; duration: number; peaks: number[] }> {
  validateAudioFile(file);

  const audioCtx = getSharedAudioContext();
  if (audioCtx.state === "suspended") {
    await audioCtx.resume().catch(() => {});
  }

  const arrayBuffer = await file.arrayBuffer();

  // Decode with fallback support
  let audioBuffer: AudioBuffer;
  try {
    const clone = arrayBuffer.slice(0);
    audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      audioCtx.decodeAudioData(
        clone,
        (buf) => resolve(buf),
        (err) => reject(err || new Error("Browser could not decode audio data."))
      );
    });
  } catch (err) {
    // Retry with promise-style
    const clone2 = arrayBuffer.slice(0);
    audioBuffer = await audioCtx.decodeAudioData(clone2);
  }

  const duration = audioBuffer.duration;
  const peaks = extractWaveformData(audioBuffer, 64);

  return {
    buffer: audioBuffer,
    duration,
    peaks,
  };
}

/**
 * Extracts a normalized waveform peak array from an AudioBuffer.
 */
export function extractWaveformData(buffer: AudioBuffer, numPoints: number = 64): number[] {
  const channelData = buffer.getChannelData(0);
  const totalSamples = channelData.length;
  const blockSize = Math.max(1, Math.floor(totalSamples / numPoints));
  const peaks: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, totalSamples);
    let max = 0;
    for (let j = start; j < end; j += 4) {
      const val = Math.abs(channelData[j]);
      if (val > max) max = val;
    }
    peaks.push(max);
  }

  const maxPeak = Math.max(...peaks, 0.01);
  return peaks.map((p) => Math.max(0.12, Math.min(1, p / maxPeak)));
}

/**
 * Accurately trims an AudioBuffer to [startTimeSec, endTimeSec].
 * Enforces MIN_CLIP_DURATION (5s) and MAX_CLIP_DURATION (20s).
 * Copies channel data directly for zero latency and cross-browser reliability.
 */
export async function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  startTimeSec: number,
  endTimeSec: number
): Promise<AudioBuffer> {
  if (typeof window === "undefined") {
    throw new Error("Audio slicing must run in a browser environment.");
  }

  const totalDuration = audioBuffer.duration;
  let start = Math.max(0, Math.min(startTimeSec, Math.max(0, totalDuration - MIN_CLIP_DURATION)));
  let end = Math.min(totalDuration, Math.max(start + MIN_CLIP_DURATION, endTimeSec));

  if (end - start > MAX_CLIP_DURATION) {
    end = start + MAX_CLIP_DURATION;
  }
  if (end - start < MIN_CLIP_DURATION) {
    end = Math.min(totalDuration, start + MIN_CLIP_DURATION);
  }

  const sampleRate = audioBuffer.sampleRate;
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const startSample = Math.max(0, Math.floor(start * sampleRate));
  const endSample = Math.min(audioBuffer.length, Math.floor(end * sampleRate));
  const frameCount = Math.max(1, endSample - startSample);

  const audioCtx = getSharedAudioContext();
  const slicedBuffer = audioCtx.createBuffer(numChannels, frameCount, sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const src = audioBuffer.getChannelData(c);
    const dst = slicedBuffer.getChannelData(c);
    dst.set(src.subarray(startSample, endSample));
  }

  return slicedBuffer;
}

/**
 * Converts an AudioBuffer (mono or stereo) into a standard 16-bit PCM WAV ArrayBuffer.
 */
export function audioBufferToWav(buffer: AudioBuffer, targetSampleRate?: number): ArrayBuffer {
  const numChannels = Math.min(buffer.numberOfChannels, 2);
  const sampleRate = targetSampleRate || buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const dataByteLength = length * blockAlign;
  const headerByteLength = 44;
  const totalByteLength = headerByteLength + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalByteLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataByteLength, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

export function audioBufferToBlob(buffer: AudioBuffer): Blob {
  const wavArrayBuffer = audioBufferToWav(buffer);
  return new Blob([wavArrayBuffer], { type: "audio/wav" });
}

export function audioBufferToDataUrl(buffer: AudioBuffer): string {
  const wavArrayBuffer = audioBufferToWav(buffer);
  let binary = "";
  const bytes = new Uint8Array(wavArrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * Uploads audio Blob or File to the server's persistent storage API (/api/audio/upload).
 */
export async function uploadTrimmedAudio(
  blob: Blob | File,
  filename: string = "trimmed-audio.wav",
  durationSec?: number
): Promise<{ url: string; staticUrl?: string; size: number; sizeFormatted: string; name: string }> {
  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("name", filename);
  if (durationSec !== undefined) {
    formData.append("duration", durationSec.toFixed(1));
  }

  const response = await fetch("/api/audio/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || "Failed to upload audio to persistent server storage.");
  }

  const data = await response.json();
  const sizeFormatted = formatFileSize(data.size || blob.size);

  return {
    url: data.url,
    staticUrl: data.staticUrl,
    size: data.size || blob.size,
    sizeFormatted,
    name: data.name || filename,
  };
}

// Generates an in-browser soothing chime melody using Web Audio API and exports as a persistent audio upload
export async function generatePresetMelody(presetId: string): Promise<{ url: string; duration: number }> {
  if (typeof window === "undefined") {
    return { url: "", duration: 12 };
  }

  const sampleRate = 22050; // efficient sample rate for melody
  const duration = presetId === "music-box" ? 12 : presetId === "warm-piano" ? 14 : 10;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  const notes =
    presetId === "music-box"
      ? [523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 523.25, 587.33, 659.25, 783.99, 523.25]
      : presetId === "warm-piano"
      ? [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 523.25, 392.0, 261.63]
      : [392.0, 493.88, 587.33, 783.99, 587.33, 493.88, 440.0, 523.25, 659.25, 880.0, 659.25, 392.0];

  const step = duration / notes.length;

  notes.forEach((freq, idx) => {
    const startSample = Math.floor(idx * step * sampleRate);
    const endSample = Math.floor((idx + 1) * step * sampleRate);
    const noteSamples = endSample - startSample;
    for (let i = 0; i < noteSamples; i++) {
      const t = i / sampleRate;
      const progress = i / noteSamples;
      const env = progress < 0.05 ? progress / 0.05 : Math.exp(-progress * 3.8);
      const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
      samples[startSample + i] = Math.max(-1, Math.min(1, samples[startSample + i] + sample));
    }
  });

  const audioCtx = getSharedAudioContext();
  const audioBuffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
  audioBuffer.getChannelData(0).set(samples);

  const wavBlob = audioBufferToBlob(audioBuffer);

  let finalUrl = "";
  try {
    const res = await uploadTrimmedAudio(wavBlob, `${presetId}.wav`, duration);
    if (res?.url) finalUrl = res.url;
  } catch (uploadErr) {
    console.warn("Preset melody upload failed, falling back to data URL:", uploadErr);
    finalUrl = audioBufferToDataUrl(audioBuffer);
  }

  return { url: finalUrl, duration };
}
