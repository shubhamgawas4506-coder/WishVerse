"use client";

import React, { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, RotateCcw, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { formatAudioTime } from "@/lib/audio";

interface PinkAudioPlayerProps {
  url: string;
  name?: string;
  duration?: number | string;
  className?: string;
  compact?: boolean;
  onEnded?: () => void;
}

export function PinkAudioPlayer({
  url,
  name = "Attached Soundtrack",
  duration: initialDuration,
  className = "",
  compact = false,
  onEnded,
}: PinkAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => {
    if (typeof initialDuration === "number") return initialDuration;
    if (typeof initialDuration === "string") {
      const parsed = parseFloat(initialDuration);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

  // Reset state when url changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
  }, [url]);

  const togglePlay = async () => {
    if (!audioRef.current || !url) return;
    setHasError(false);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio play error:", err);
        setIsPlaying(false);
        setHasError(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeeking) return;
    setCurrentTime(audioRef.current.currentTime);
    if (!duration && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    onEnded?.();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = clickRatio * duration;

    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!url) return null;

  return (
    <div
      className={`pink-audio-player ${compact ? "compact" : ""} ${isPlaying ? "playing" : ""} ${className}`}
      role="region"
      aria-label={`Audio player for ${name}`}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
      />

      {/* Play / Pause main button */}
      <button
        type="button"
        className="pink-play-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <Pause /> : <Play className="play-icon-offset" />}
      </button>

      {/* Main Track & Progress Info */}
      <div className="pink-player-body">
        <div className="pink-player-info">
          <div className="pink-track-title">
            <Music2 />
            <span>{name}</span>
          </div>
          <span className="pink-player-time">
            {formatAudioTime(currentTime)} / {formatAudioTime(duration || 20)}
          </span>
        </div>

        {/* Scrubbable Progress Bar */}
        <div
          className="pink-progress-bar-wrap"
          ref={progressRef}
          onClick={handleSeek}
          onTouchStart={() => setIsSeeking(true)}
          onTouchMove={handleSeek}
          onTouchEnd={() => setIsSeeking(false)}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration || 20}
        >
          <div className="pink-progress-track">
            <div
              className="pink-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="pink-progress-thumb"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mute button */}
      <button
        type="button"
        className="pink-mute-btn"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </button>

      {hasError && (
        <button
          type="button"
          className="pink-retry-btn"
          onClick={togglePlay}
          title="Retry playback"
        >
          <RotateCcw />
        </button>
      )}
    </div>
  );
}
