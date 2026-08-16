"use client";

import { useRef, useState } from "react";
import {
  blobToWav,
  uploadPhraseAudio,
  deletePhraseAudioByUrl,
  extFromMime,
} from "../lib/audio";

type Status = "idle" | "recording" | "processing";

// A record / play / delete control for one language's voice note on one phrase.
export default function VoiceNote({
  phraseId,
  lang,
  label,
  color,
  url,
  onSave,
  onClear,
}: {
  phraseId: string;
  lang: "shona" | "setswana";
  label: string;
  color: string; // tailwind text color class for the accent
  url: string | null;
  onSave: (url: string) => void;
  onClear: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function startRecording() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus("processing");
        try {
          const raw = new Blob(chunksRef.current, {
            type: rec.mimeType || "audio/webm",
          });

          // Prefer converting to WAV (plays on every phone). If the browser
          // can't decode the recording, fall back to uploading it as-is so
          // saving never fails — it still plays back on the same phone type.
          let toUpload: Blob = raw;
          let ext = extFromMime(raw.type);
          let contentType = raw.type || "audio/webm";
          try {
            toUpload = await blobToWav(raw);
            ext = "wav";
            contentType = "audio/wav";
          } catch (convErr) {
            console.warn(
              "WAV conversion failed; uploading original format instead.",
              convErr
            );
          }

          const publicUrl = await uploadPhraseAudio(
            phraseId,
            lang,
            toUpload,
            ext,
            contentType
          );
          // Remove the previous file (best effort) once the new one is saved.
          if (url) deletePhraseAudioByUrl(url).catch(() => {});
          onSave(publicUrl);
        } catch (e: any) {
          // Surface the real reason — usually a missing storage bucket/policy
          // (run supabase/migration-voice-notes.sql).
          const msg = e?.message || e?.error_description || String(e);
          console.error("Voice note save failed:", e);
          setErr(msg.slice(0, 120));
        } finally {
          setStatus("idle");
          setSeconds(0);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setStatus("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e: any) {
      setErr("Mic access denied.");
      setStatus("idle");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  function togglePlay() {
    if (!url) return;
    if (playing) {
      audioRef.current?.pause();
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    audio.onerror = () => {
      setPlaying(false);
      setErr("Can't play this note.");
    };
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setErr("Can't play this note."));
  }

  function clearNote() {
    if (!url) return;
    if (!confirm(`Delete the ${label} voice note?`)) return;
    deletePhraseAudioByUrl(url).catch(() => {});
    onClear();
  }

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className={`w-16 shrink-0 text-xs font-semibold uppercase tracking-wide ${color}`}>
        {label}
      </span>

      {status === "recording" ? (
        <button
          onClick={stopRecording}
          className="flex items-center gap-1.5 rounded-full bg-berry px-3 py-1.5 text-xs font-bold text-cream animate-popin"
        >
          <span className="h-2 w-2 rounded-sm bg-cream" />
          Stop · {seconds}s
        </button>
      ) : status === "processing" ? (
        <span className="rounded-full bg-cocoa/10 px-3 py-1.5 text-xs font-semibold text-ink/60">
          Saving…
        </span>
      ) : url ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1 rounded-full bg-ochre px-3 py-1.5 text-xs font-bold text-cream active:translate-y-0.5"
          >
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button
            onClick={startRecording}
            className="rounded-full border border-hair/20 px-2.5 py-1.5 text-xs font-semibold text-ink/60 active:translate-y-0.5"
            title="Re-record"
          >
            ↻
          </button>
          <button
            onClick={clearNote}
            className="rounded-full border border-berry/30 px-2.5 py-1.5 text-xs font-semibold text-berry/80 active:translate-y-0.5"
            title="Delete note"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 rounded-full border border-ochre/40 px-3 py-1.5 text-xs font-semibold text-ochre active:translate-y-0.5"
        >
          🎙 Record
        </button>
      )}

      {err && <span className="text-xs text-berry">{err}</span>}
    </div>
  );
}
