"use client";

import { useState } from "react";
import type { useHousehold } from "../lib/useHousehold";
import type { usePresence } from "../lib/usePresence";
import type { Player } from "../lib/types";

type Store = ReturnType<typeof useHousehold>;
type Presence = ReturnType<typeof usePresence>;

function FloatScore({ id }: { id: number }) {
  return (
    <span
      key={id}
      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 animate-floatup text-xl font-black text-leaf"
    >
      +1
    </span>
  );
}

function PlayerCard({
  store,
  player,
  online,
}: {
  store: Store;
  player: Player;
  online: boolean;
}) {
  const hh = store.household!;
  const name = player === 1 ? hh.p1_name : hh.p2_name;
  const lang = player === 1 ? hh.p1_lang : hh.p2_lang;
  const score = player === 1 ? hh.p1_score : hh.p2_score;
  const other = player === 1 ? hh.p2_score : hh.p1_score;
  const leading = score > other;
  const [floats, setFloats] = useState<number[]>([]);

  function award(delta: number) {
    store.addPoints(player, delta);
    if (delta > 0) {
      const id = Date.now() + Math.random();
      setFloats((f) => [...f, id]);
      setTimeout(() => setFloats((f) => f.filter((x) => x !== id)), 700);
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
  }

  return (
    <div
      className={`relative flex-1 rounded-3xl p-4 shadow-card transition-colors ${
        player === 1 ? "bg-clay text-cream" : "bg-cocoa text-cream"
      }`}
    >
      {leading && (
        <span className="absolute right-3 top-3 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-bark">
          Leading
        </span>
      )}
      <div className="relative inline-block">
        <div className="font-display text-5xl font-black leading-none">
          {score}
        </div>
        {floats.map((id) => (
          <FloatScore key={id} id={id} />
        ))}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            online ? "bg-green-300 shadow-[0_0_6px] shadow-green-300" : "bg-cream/25"
          }`}
          title={online ? "online now" : "offline"}
        />
        <span className="truncate text-lg font-semibold">{name}</span>
      </div>
      <div className="text-xs uppercase tracking-wide text-cream/60">
        {online ? "online now" : `learning ${lang}`}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => award(1)}
          className="rounded-xl bg-cream/15 py-2 text-sm font-semibold active:translate-y-0.5"
        >
          Used it
        </button>
        <button
          onClick={() => award(1)}
          className="rounded-xl bg-cream/15 py-2 text-sm font-semibold active:translate-y-0.5"
        >
          Taught it
        </button>
      </div>
      <button
        onClick={() => award(-1)}
        className="mt-2 w-full rounded-xl border border-cream/20 py-1.5 text-xs font-semibold text-cream/80 active:translate-y-0.5"
      >
        −1 correction
      </button>
    </div>
  );
}

export default function Scoreboard({
  store,
  presence,
}: {
  store: Store;
  presence: Presence;
}) {
  const hh = store.household!;
  const [jarPulse, setJarPulse] = useState(false);

  const leaderText =
    hh.p1_score === hh.p2_score
      ? "All square — neck and neck!"
      : `${hh.p1_score > hh.p2_score ? hh.p1_name : hh.p2_name} is ahead by ${Math.abs(
          hh.p1_score - hh.p2_score
        )}`;

  function tapJar() {
    store.bumpJar();
    setJarPulse(true);
    setTimeout(() => setJarPulse(false), 250);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  }

  return (
    <div className="space-y-4">
      {/* Streak + leader banner */}
      <div className="flex items-center justify-between rounded-2xl bg-surface/70 px-4 py-3 shadow-card">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/50">
            Today
          </div>
          <div className="font-semibold text-ink">{leaderText}</div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-sun/20 px-3 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-display text-xl font-bold text-clay">
            {hh.streak}
          </span>
          <span className="text-xs font-semibold text-ink/60">day{hh.streak === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Player cards */}
      <div className="flex gap-3">
        <PlayerCard store={store} player={1} online={presence.p1Online} />
        <PlayerCard store={store} player={2} online={presence.p2Online} />
      </div>

      <p className="px-1 text-center text-xs text-ink/50">
        Tap <b>Used it</b> for saying a phrase unprompted, <b>Taught it</b> for a
        clear lesson.
      </p>

      {/* English jar */}
      <button
        onClick={tapJar}
        className={`w-full rounded-3xl bg-berry/90 p-5 text-left text-cream shadow-card transition-transform active:translate-y-0.5 ${
          jarPulse ? "scale-[1.02]" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold">English Jar 🫙</div>
            <div className="text-sm text-cream/80">
              Tap when someone defaults to English
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl font-black">{hh.jar_count}</div>
            <div className="text-xs text-cream/70">in the jar</div>
          </div>
        </div>
      </button>
    </div>
  );
}
