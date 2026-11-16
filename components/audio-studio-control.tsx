"use client";

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Check,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  AUDIO_PRESETS,
  decodeAudioFile,
  formatAudioTime,
  formatFileSize,
  generatePresetMelody,
  getSharedAudioContext,
  MAX_CLIP_DURATION,
  MIN_CLIP_DURATION,
  sliceAudioBuffer,
  audioBufferToBlob,
  audioBufferToDataUrl,
  uploadTrimmedAudio,
  validateAudioFile,
} from "@/lib/audio";
import { GreetingData } from "@/lib/greeting";
import { PinkAudioPlayer } from "@/components/pink-audio-player";

interface AudioStudioControlProps {
  greeting: GreetingData;
  setDetail: (key: string, value: string) => void;
  setAudioDetails?: (details: Record<string, string>) => void;
}

export function AudioStudioControl({
  greeting,
  setDetail,
  setAudioDetails,
}: AudioStudioControlProps) {
  // Source audio buffer & waveform
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [trackTitle, setTrackTitle] = useState<string>("");

  // Trimming bounds in seconds (5s min, 20s max)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(20);

  // Status & processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [showTrimmer, setShowTrimmer] = useState<boolean>(false);

  // Atomic helper to update audio details in greeting state
  const applyAudioDetails = (details: Record<string, string>) => {
    if (setAudioDetails) {
      setAudioDetails(details);
    } else {
      Object.entries(details).forEach(([k, v]) => setDetail(k, v));
    }
  };

  // Playback state for trimmer
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);

  // Dragging state for trimming handles
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | "window" | null>(null);
  const dragStartRef = useRef<{ startX: number; initStart: number; initEnd: number } | null>(null);

  // Refs for Web Audio
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const playStartEpochRef = useRef<number>(0);
  const playStartOffsetRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Attached audio metadata from greeting
  const confirmedAudioUrl = greeting.details?.audioUrl || "";
  const confirmedAudioName = greeting.details?.audioName || "";
  const confirmedAudioDuration = greeting.details?.audioDuration || "";

  const isAudioAttached = Boolean(confirmedAudioUrl);
  const clipDuration = Math.max(MIN_CLIP_DURATION, Math.min(MAX_CLIP_DURATION, trimEnd - trimStart));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      try {
        const audioCtx = getSharedAudioContext();
        gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
      } catch {}
    }
  }, [volume, isMuted]);

  // Stop trimmer Web Audio playback
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Play range [startSec, endSec] in trimmer
  const playRange = useCallback(
    (startSec: number, endSec: number) => {
      if (!audioBuffer) return;

      stopPlayback();

      try {
        const audioCtx = getSharedAudioContext();
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
        gainNodeRef.current = gain;

        source.connect(gain);
        gain.connect(audioCtx.destination);
        sourceNodeRef.current = source;

        const duration = Math.max(0.1, endSec - startSec);
        source.start(0, startSec, duration);

        setIsPlaying(true);
        setCurrentTime(startSec);
        playStartEpochRef.current = audioCtx.currentTime;
        playStartOffsetRef.current = startSec;

        source.onended = () => {
          setIsPlaying(false);
          setCurrentTime(startSec);
        };

        const updateProgress = () => {
          if (!sourceNodeRef.current) return;
          const elapsed = audioCtx.currentTime - playStartEpochRef.current;
          const currentPos = playStartOffsetRef.current + elapsed;
          if (currentPos >= endSec) {
            setCurrentTime(endSec);
            stopPlayback();
            return;
          }
          setCurrentTime(currentPos);
          animFrameRef.current = requestAnimationFrame(updateProgress);
        };

        animFrameRef.current = requestAnimationFrame(updateProgress);
      } catch (err) {
        console.error("Playback error:", err);
      }
    },
    [audioBuffer, isMuted, volume, stopPlayback]
  );

  const togglePlayClip = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRange(trimStart, trimEnd);
    }
  };

  const replayClip = () => {
    stopPlayback();
    playRange(trimStart, trimEnd);
  };

  // Helper: Slices the AudioBuffer, uploads trimmed clip to server, and updates greeting
  const saveTrimmedClip = async (
    buffer: AudioBuffer,
    startSec: number,
    endSec: number,
    baseName: string
  ) => {
    setIsProcessing(true);
    setStatusMessage("Saving soundtrack to server...");

    try {
      // 1. Slice audio accurately to exact sample bounds
      const sliced = await sliceAudioBuffer(buffer, startSec, endSec);
      const actualDuration = sliced.duration;

      // 2. Encode to 16-bit PCM WAV Blob
      const wavBlob = audioBufferToBlob(sliced);
      const sanitizedName = baseName
        ? `${baseName.replace(/\.[^/.]+$/, "")}_clip.wav`
        : "wishverse_clip.wav";

      // 3. Upload to server's persistent storage (or fallback to local audio clip if server is read-only)
      let finalAudioUrl = "";
      try {
        const uploadRes = await uploadTrimmedAudio(wavBlob, sanitizedName, actualDuration);
        if (uploadRes?.url) {
          finalAudioUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn("Server storage upload warning, using in-browser audio clip:", uploadErr);
        finalAudioUrl = audioBufferToDataUrl(sliced);
      }

      if (finalAudioUrl) {
        const displayName = `${baseName || "Soundtrack"} (${actualDuration.toFixed(1)}s)`;
        applyAudioDetails({
          audioUrl: finalAudioUrl,
          audioName: displayName,
          audioDuration: `${actualDuration.toFixed(1)}s`,
          audioTrimStart: startSec.toFixed(2),
          audioTrimEnd: endSec.toFixed(2),
        });
      }
      setStatusMessage("");
      setShowTrimmer(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save trimmed clip.";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // User selects an audio file from their device
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage("Reading soundtrack from device...");
    stopPlayback();

    try {
      validateAudioFile(file);
      setTrackTitle(file.name);

      // STAGE 1: Decode audio in browser for trimming & waveform
      const decoded = await decodeAudioFile(file);
      setAudioBuffer(decoded.buffer);
      setTotalDuration(decoded.duration);
      setWaveformPeaks(decoded.peaks);

      const initStart = 0;
      const initEnd = Math.min(
        decoded.duration,
        Math.max(MIN_CLIP_DURATION, Math.min(MAX_CLIP_DURATION, decoded.duration))
      );

      setTrimStart(initStart);
      setTrimEnd(initEnd);
      setCurrentTime(0);

      // If duration exceeds maximum clip duration (20s), open the interactive trimmer so user can choose their 15–20s!
      if (decoded.duration > MAX_CLIP_DURATION) {
        setShowTrimmer(true);
        setStatusMessage("");
      } else {
        // Song is short (<= 20s): automatically slice, upload, and attach
        setShowTrimmer(false);
        await saveTrimmedClip(decoded.buffer, initStart, initEnd, file.name);
      }
    } catch (err: unknown) {
      console.warn("Decoding in browser failed, falling back to direct upload:", err);
      // Fallback: If browser audio decode fails, directly upload the file to server
      try {
        setStatusMessage("Uploading soundtrack directly...");
        const uploadRes = await uploadTrimmedAudio(file, file.name);
        if (uploadRes?.url) {
          applyAudioDetails({
            audioUrl: uploadRes.url,
            audioName: file.name,
            audioDuration: "Attached",
            audioTrimStart: "",
            audioTrimEnd: "",
          });
          setShowTrimmer(false);
        }
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : "Could not upload audio file. Try another file.";
        setErrorMsg(msg);
      }
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
      e.target.value = "";
    }
  };

  const handleConfirmTrim = async () => {
    if (!audioBuffer) return;
    stopPlayback();
    await saveTrimmedClip(audioBuffer, trimStart, trimEnd, trackTitle || "Audio Clip");
  };

  const handleResetTrim = () => {
    if (!audioBuffer) return;
    stopPlayback();
    const initStart = 0;
    const initEnd = Math.min(
      totalDuration,
      Math.max(MIN_CLIP_DURATION, Math.min(MAX_CLIP_DURATION, totalDuration))
    );
    setTrimStart(initStart);
    setTrimEnd(initEnd);
    setCurrentTime(0);
  };

  const handleSelectPreset = async (presetId: string, name: string) => {
    setErrorMsg("");
    setIsProcessing(true);
    setStatusMessage(`Preparing ${name}...`);
    stopPlayback();

    try {
      const melody = await generatePresetMelody(presetId);
      if (melody?.url) {
        applyAudioDetails({
          audioUrl: melody.url,
          audioName: name,
          audioDuration: `${melody.duration}s`,
          audioTrimStart: "",
          audioTrimEnd: "",
        });
        setAudioBuffer(null);
        setShowTrimmer(false);
      } else {
        setErrorMsg("Could not generate preset melody.");
      }
    } catch {
      setErrorMsg("Error generating preset melody.");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    const cleanUrl = customUrl.trim();
    applyAudioDetails({
      audioUrl: cleanUrl,
      audioName: "Custom Audio Link",
      audioDuration: "Online",
      audioTrimStart: "",
      audioTrimEnd: "",
    });
    setShowUrlInput(false);
    setAudioBuffer(null);
    setShowTrimmer(false);
  };

  const handleRemoveAudio = () => {
    stopPlayback();
    applyAudioDetails({
      audioUrl: "",
      audioName: "",
      audioDuration: "",
      audioTrimStart: "",
      audioTrimEnd: "",
    });
    setAudioBuffer(null);
    setShowTrimmer(false);
  };

  // Draggable Trimming Handle Events (Touch & Mouse friendly)
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: "start" | "end" | "window"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}

    setActiveHandle(handle);
    dragStartRef.current = {
      startX: e.clientX,
      initStart: trimStart,
      initEnd: trimEnd,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeHandle || !dragStartRef.current || !timelineRef.current || totalDuration <= 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaSeconds = (deltaX / rect.width) * totalDuration;

    if (activeHandle === "start") {
      let newStart = dragStartRef.current.initStart + deltaSeconds;
      newStart = Math.max(0, Math.min(newStart, trimEnd - MIN_CLIP_DURATION));
      if (trimEnd - newStart > MAX_CLIP_DURATION) {
        newStart = trimEnd - MAX_CLIP_DURATION;
      }
      setTrimStart(parseFloat(newStart.toFixed(1)));
    } else if (activeHandle === "end") {
      let newEnd = dragStartRef.current.initEnd + deltaSeconds;
      newEnd = Math.min(totalDuration, Math.max(trimStart + MIN_CLIP_DURATION, newEnd));
      if (newEnd - trimStart > MAX_CLIP_DURATION) {
        newEnd = trimStart + MAX_CLIP_DURATION;
      }
      setTrimEnd(parseFloat(newEnd.toFixed(1)));
    } else if (activeHandle === "window") {
      const windowWidth = dragStartRef.current.initEnd - dragStartRef.current.initStart;
      let newStart = dragStartRef.current.initStart + deltaSeconds;
      let newEnd = dragStartRef.current.initEnd + deltaSeconds;

      if (newStart < 0) {
        newStart = 0;
        newEnd = windowWidth;
      } else if (newEnd > totalDuration) {
        newEnd = totalDuration;
        newStart = totalDuration - windowWidth;
      }

      setTrimStart(parseFloat(newStart.toFixed(1)));
      setTrimEnd(parseFloat(newEnd.toFixed(1)));
    }
  };

  const handlePointerUp = () => {
    setActiveHandle(null);
    dragStartRef.current = null;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || totalDuration <= 0 || activeHandle) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * totalDuration;
    setCurrentTime(targetTime);
    if (isPlaying) {
      playRange(targetTime, trimEnd);
    }
  };

  // Percentages for timeline
  const startPercent = totalDuration > 0 ? (trimStart / totalDuration) * 100 : 0;
  const endPercent = totalDuration > 0 ? (trimEnd / totalDuration) * 100 : 100;
  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="audio-studio-control" aria-label="Audio Customization and Trimming">
      <div className="audio-studio-header">
        <div>
          <Music2 />
          <strong>Background Soundtrack</strong>
        </div>
        <small className={isAudioAttached ? "audio-status-attached" : ""}>
          {isAudioAttached ? "✓ Attached to creation" : "Trimmed clip plays for receiver"}
        </small>
      </div>

      {errorMsg && (
        <div className="audio-error-banner" role="alert">
          {errorMsg}
        </div>
      )}

      {statusMessage && (
        <div className="audio-status-banner">
          <span className="audio-mini-spinner" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* VIEW A: INTERACTIVE AUDIO TRIMMER (When trimmer active) */}
      {audioBuffer && showTrimmer ? (
        <div className="audio-trimmer-card">
          <div className="audio-trimmer-top">
            <div className="audio-trimmer-meta">
              <span className="audio-track-title">{trackTitle || "Uploaded Audio"}</span>
              <span className="audio-total-duration">
                Full song: {formatAudioTime(totalDuration)}
              </span>
            </div>
            <div className="audio-clip-badge">
              <Scissors />
              <span>{clipDuration.toFixed(1)}s clip</span>
              <small>(drag handles to trim)</small>
            </div>
          </div>

          {/* WAVEFORM TIMELINE WITH DRAGGABLE HANDLES */}
          <div
            className="audio-timeline-wrap"
            ref={timelineRef}
            onClick={handleTimelineClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Waveform bars */}
            <div className="waveform-container">
              {waveformPeaks.map((peak, idx) => {
                const barRatio = idx / waveformPeaks.length;
                const inClip =
                  barRatio >= trimStart / totalDuration &&
                  barRatio <= trimEnd / totalDuration;
                return (
                  <div
                    key={idx}
                    className={`waveform-bar ${inClip ? "in-clip" : "dimmed"}`}
                    style={{ height: `${Math.round(peak * 100)}%` }}
                  />
                );
              })}
            </div>

            {/* Selected Window Overlay */}
            <div
              className="audio-selection-highlight"
              style={{
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "window")}
              title="Drag window to shift clip"
            >
              <span className="selection-window-label">Selected Clip</span>
            </div>

            {/* Start Handle */}
            <div
              className="audio-trim-handle start-handle"
              style={{ left: `${startPercent}%` }}
              onPointerDown={(e) => handlePointerDown(e, "start")}
              role="slider"
              aria-label="Start time"
              aria-valuenow={trimStart}
              tabIndex={0}
            >
              <div className="handle-pill">
                <span className="handle-time">{formatAudioTime(trimStart)}</span>
                <i className="handle-grip" />
              </div>
            </div>

            {/* End Handle */}
            <div
              className="audio-trim-handle end-handle"
              style={{ left: `${endPercent}%` }}
              onPointerDown={(e) => handlePointerDown(e, "end")}
              role="slider"
              aria-label="End time"
              aria-valuenow={trimEnd}
              tabIndex={0}
            >
              <div className="handle-pill">
                <span className="handle-time">{formatAudioTime(trimEnd)}</span>
                <i className="handle-grip" />
              </div>
            </div>

            {/* Playhead */}
            {isPlaying && (
              <div
                className="audio-playhead"
                style={{ left: `${playheadPercent}%` }}
              />
            )}
          </div>

          {/* PLAYBACK CONTROLS */}
          <div className="audio-editor-playback-bar">
            <div className="audio-editor-left-controls">
              <button
                type="button"
                className={`audio-editor-play-btn ${isPlaying ? "playing" : ""}`}
                onClick={togglePlayClip}
              >
                {isPlaying ? <Pause /> : <Play />}
                <span>{isPlaying ? "Pause Clip" : "Preview Clip"}</span>
              </button>

              <button
                type="button"
                className="audio-editor-replay-btn"
                onClick={replayClip}
                title="Replay clip from start"
              >
                <RotateCcw /> Replay
              </button>

              <button
                type="button"
                className="audio-reset-btn"
                onClick={handleResetTrim}
                title="Reset to 0–20s"
              >
                Reset
              </button>

              <button
                type="button"
                className="audio-editor-volume-btn"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX /> : <Volume2 />}
              </button>
            </div>

            <div className="audio-editor-time-readout">
              <span>{formatAudioTime(currentTime)}</span>
              <small>
                of {clipDuration.toFixed(1)}s ({formatAudioTime(trimStart)}–{formatAudioTime(trimEnd)})
              </small>
            </div>
          </div>

          {/* ACTIONS: CONFIRM CLIP / REPLACE / REMOVE */}
          <div className="audio-editor-actions">
            <button
              type="button"
              className="audio-confirm-clip-btn"
              onClick={handleConfirmTrim}
              disabled={isProcessing}
            >
              <Check />
              <span>Confirm Clip ({clipDuration.toFixed(1)}s)</span>
            </button>

            <label className="audio-replace-btn">
              <Upload /> Replace
              <input
                type="file"
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                onChange={handleFileUpload}
              />
            </label>

            <button
              type="button"
              className="audio-remove-btn"
              onClick={handleRemoveAudio}
              disabled={isProcessing}
            >
              <Trash2 /> Remove
            </button>
          </div>
        </div>
      ) : isAudioAttached ? (
        /* VIEW B: COMPACT PINK AUDIO PLAYER CARD */
        <div className="active-audio-card pink-card-wrap">
          <div className="pink-player-header-row">
            <span className="pink-attached-pill">✓ Attached to creation</span>
            <div className="pink-header-actions">
              {audioBuffer && (
                <button
                  type="button"
                  className="audio-edit-trim-btn"
                  onClick={() => setShowTrimmer(true)}
                >
                  <Scissors /> Trim (15–20s)
                </button>
              )}
              <label className="audio-replace-btn">
                <Upload /> Replace
                <input
                  type="file"
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                type="button"
                className="audio-remove-btn"
                onClick={handleRemoveAudio}
              >
                <Trash2 />
              </button>
            </div>
          </div>

          {/* Compact Pink Audio Player */}
          <PinkAudioPlayer
            url={confirmedAudioUrl}
            name={confirmedAudioName || "Attached Soundtrack"}
            duration={confirmedAudioDuration}
            compact={false}
          />
        </div>
      ) : (
        /* VIEW C: INITIAL PICKER (Upload from device, Presets, or Link) */
        <div className="audio-picker-box">
          <label className="audio-upload-cta">
            <input
              ref={fileInputRef}
              type="file"
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac,.mp4"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <Upload />
            <div>
              <strong>
                {isProcessing ? "Processing soundtrack..." : "Upload audio from device"}
              </strong>
              <small>MP3, WAV, M4A, AAC up to 50 MB · Trimmable to 5–20s</small>
            </div>
          </label>

          <div className="audio-presets-divider">
            <span>or choose a cozy melody</span>
          </div>

          <div className="audio-presets-grid">
            {AUDIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="audio-preset-chip"
                onClick={() => handleSelectPreset(preset.id, preset.name)}
                disabled={isProcessing}
              >
                <i>{preset.icon}</i>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="audio-url-toggle">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="audio-link-toggle-btn"
              >
                + or paste an audio link
              </button>
            ) : (
              <div className="audio-url-input-wrap">
                <input
                  type="url"
                  placeholder="https://example.com/song.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyCustomUrl();
                  }}
                />
                <button type="button" onClick={handleApplyCustomUrl}>
                  Attach
                </button>
                <button
                  type="button"
                  className="audio-url-cancel"
                  onClick={() => setShowUrlInput(false)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
