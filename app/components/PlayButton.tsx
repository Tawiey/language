"use client";

import { useRef, useState } from "react";

// Minimal play/pause button for a voice note (used in Duel reveal).
export default function PlayButton({
  url,
  label,
}: {
  url: string | null;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!url) {
    return (
      <span className="rounded-full border border-cream/15 px-3 py-1.5 text-xs font-semibold text-cream/30">
        no {label} note
      </span>
    );
  }

  function toggle() {
    if (playing) {
      audioRef.current?.pause();
      return;
    }
    const audio = new Audio(url!);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 text-xs font-bold text-bark active:translate-y-0.5"
    >
      {playing ? "❚❚" : "▶"} {label}
    </button>
  );
}
