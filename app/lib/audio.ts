"use client";

import { supabase } from "./supabase";

export const AUDIO_BUCKET = "phrase-audio";

// Recorded audio (webm/opus on Android, mp4/aac on iOS) isn't cross-playable —
// iOS can't play Android's webm. So we decode whatever the device recorded and
// re-encode to a mono 16 kHz WAV, which every browser can play. Voice notes are
// short, so the size cost is negligible.
export async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuf = await blob.arrayBuffer();
  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const decodeCtx = new AudioCtx();
  const decoded = await decodeCtx.decodeAudioData(arrayBuf);
  decodeCtx.close();

  const targetRate = 16000;
  const OfflineCtx: typeof OfflineAudioContext =
    (window as any).OfflineAudioContext ||
    (window as any).webkitOfflineAudioContext;
  const frames = Math.max(1, Math.ceil(decoded.duration * targetRate));
  const offline = new OfflineCtx(1, frames, targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination); // stereo → mono downmix happens here
  src.start(0);
  const rendered = await offline.startRendering();

  return encodeWav(rendered);
}

function encodeWav(buffer: AudioBuffer): Blob {
  const samples = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const dataSize = samples.length * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

// Upload a WAV note and return its public URL. Path is timestamped so a
// re-record never serves a stale cached file.
export async function uploadPhraseAudio(
  phraseId: string,
  lang: "shona" | "setswana",
  wav: Blob
): Promise<string> {
  const path = `${phraseId}/${lang}-${Date.now()}.wav`;
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, wav, { contentType: "audio/wav", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Best-effort removal of the stored file behind a public URL.
export async function deletePhraseAudioByUrl(url: string): Promise<void> {
  const marker = `/${AUDIO_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = url.slice(i + marker.length).split("?")[0];
  await supabase.storage.from(AUDIO_BUCKET).remove([path]);
}
