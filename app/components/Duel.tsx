"use client";

import { useMemo, useState } from "react";
import type { useHousehold } from "../lib/useHousehold";
import type { Phrase } from "../lib/types";
import PlayButton from "./PlayButton";

type Store = ReturnType<typeof useHousehold>;

function pickIndex(len: number, avoid: number) {
  if (len <= 1) return 0;
  let i = avoid;
  while (i === avoid) i = Math.floor(Math.random() * len);
  return i;
}

export default function Duel({ store }: { store: Store }) {
  const hh = store.household!;
  const phrases = store.phrases;
  const [idx, setIdx] = useState(() =>
    phrases.length ? Math.floor(Math.random() * phrases.length) : 0
  );
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(1);

  const current: Phrase | undefined = phrases[idx];

  const roundScores = useMemo(
    () => ({ p1: hh.p1_score, p2: hh.p2_score }),
    [hh.p1_score, hh.p2_score]
  );

  if (phrases.length === 0) {
    return (
      <div className="grid place-items-center py-16 text-center">
        <p className="text-cocoa/60">
          Add a few phrases first, then come back to duel!
        </p>
      </div>
    );
  }

  function next() {
    setRevealed(false);
    setIdx((i) => pickIndex(phrases.length, i));
    setRound((r) => r + 1);
  }

  function award(player: 1 | 2) {
    store.addPoints(player, 1);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
    next();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-bold text-cocoa">Duel</h2>
        <span className="text-sm text-cocoa/50">Round {round}</span>
      </div>

      <div className="flex justify-between gap-3 text-center text-cream">
        <div className="flex-1 rounded-xl bg-clay py-2">
          <div className="text-xs text-cream/70">{hh.p1_name}</div>
          <div className="font-display text-2xl font-bold">{roundScores.p1}</div>
        </div>
        <div className="flex-1 rounded-xl bg-cocoa py-2">
          <div className="text-xs text-cream/70">{hh.p2_name}</div>
          <div className="font-display text-2xl font-bold">{roundScores.p2}</div>
        </div>
      </div>

      {/* Flip card */}
      <div className="flip h-64">
        <div className={`flip-inner h-full w-full ${revealed ? "flipped" : ""}`}>
          {/* Front */}
          <button
            onClick={() => setRevealed(true)}
            className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-sun to-ochre p-6 text-center shadow-card"
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-bark/60">
              English
            </div>
            <div className="mt-2 font-display text-3xl font-black text-bark">
              {current?.english}
            </div>
            <div className="mt-4 rounded-full bg-bark/15 px-4 py-1.5 text-sm font-semibold text-bark">
              Tap to reveal
            </div>
          </button>

          {/* Back */}
          <div className="flip-face flip-back flex flex-col items-center justify-center rounded-3xl bg-bark p-6 text-center text-cream shadow-card">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-sun">
                Shona
              </div>
              <div className="font-display text-2xl font-bold">
                {current?.shona || "—"}
              </div>
            </div>
            <div className="my-3 h-px w-16 bg-cream/20" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-leaf">
                Setswana
              </div>
              <div className="font-display text-2xl font-bold">
                {current?.setswana || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {revealed ? (
        <div className="space-y-2 animate-popin">
          <div className="flex justify-center gap-2">
            <PlayButton url={current?.shona_audio ?? null} label="Shona" />
            <PlayButton url={current?.setswana_audio ?? null} label="Setswana" />
          </div>
          <p className="text-center text-sm font-semibold text-cocoa/70">
            Who got it right?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => award(1)}
              className="flex-1 rounded-2xl bg-clay py-3 font-bold text-cream shadow-pop active:translate-y-0.5"
            >
              {hh.p1_name} +1
            </button>
            <button
              onClick={() => award(2)}
              className="flex-1 rounded-2xl bg-cocoa py-3 font-bold text-cream shadow-pop active:translate-y-0.5"
            >
              {hh.p2_name} +1
            </button>
          </div>
          <button
            onClick={next}
            className="w-full rounded-2xl border border-cocoa/20 py-2.5 text-sm font-semibold text-cocoa/70 active:translate-y-0.5"
          >
            Skip / nobody
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-cocoa/50">
          Say both translations out loud, then reveal to check.
        </p>
      )}
    </div>
  );
}
