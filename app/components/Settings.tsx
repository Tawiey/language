"use client";

import { useState } from "react";
import type { useHousehold } from "../lib/useHousehold";
import type { Language, Player } from "../lib/types";
import ThemeToggle from "./ThemeToggle";

type Store = ReturnType<typeof useHousehold>;

const LANGS: Language[] = ["Shona", "Setswana"];

export default function Settings({
  store,
  me,
  onSetMe,
}: {
  store: Store;
  me: Player;
  onSetMe: (p: Player) => void;
}) {
  const hh = store.household!;
  const [p1Name, setP1Name] = useState(hh.p1_name);
  const [p2Name, setP2Name] = useState(hh.p2_name);
  const [p1Lang, setP1Lang] = useState<Language>(hh.p1_lang);
  const [p2Lang, setP2Lang] = useState<Language>(hh.p2_lang);
  const [saved, setSaved] = useState(false);

  function save() {
    store.patchHousehold({
      p1_name: p1Name.trim() || "Player 1",
      p2_name: p2Name.trim() || "Player 2",
      p1_lang: p1Lang,
      p2_lang: p2Lang,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-5">
      <h2 className="px-1 font-display text-2xl font-bold text-ink">Settings</h2>

      <ThemeToggle />

      <div className="space-y-4 rounded-2xl bg-surface/70 p-4 shadow-card">
        {[1, 2].map((n) => {
          const name = n === 1 ? p1Name : p2Name;
          const setName = n === 1 ? setP1Name : setP2Name;
          const lang = n === 1 ? p1Lang : p2Lang;
          const setLang = n === 1 ? setP1Lang : setP2Lang;
          return (
            <div key={n}>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Player {n}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-hair/15 bg-field px-3 py-2 text-ink outline-none focus:border-ochre"
              />
              <div className="mt-2 flex gap-2">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                      lang === l
                        ? "bg-ochre text-cream"
                        : "bg-field text-ink/60"
                    }`}
                  >
                    learning {l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={save}
          className="w-full rounded-xl bg-cocoa py-2.5 font-semibold text-cream active:translate-y-0.5"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      {/* Which player is this phone */}
      <div className="rounded-2xl bg-surface/70 p-4 shadow-card">
        <div className="font-semibold text-ink">This phone is</div>
        <div className="mt-2 flex gap-2">
          {([1, 2] as Player[]).map((p) => (
            <button
              key={p}
              onClick={() => onSetMe(p)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                me === p ? "bg-clay text-cream" : "bg-field text-ink/60"
              }`}
            >
              {p === 1 ? hh.p1_name : hh.p2_name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Sets who shows as &ldquo;here&rdquo; when you&apos;re both online.
        </p>
      </div>

      {/* English jar controls */}
      <div className="rounded-2xl bg-surface/70 p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-ink">English Jar</div>
            <div className="text-sm text-ink/60">
              {hh.jar_count} default{hh.jar_count === 1 ? "" : "s"} logged
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("Empty the English jar (reset to 0)?")) store.resetJar();
            }}
            className="rounded-lg border border-berry/40 px-3 py-1.5 text-sm font-semibold text-berry active:translate-y-0.5"
          >
            Empty jar
          </button>
        </div>
      </div>

      {/* Danger / reset scores */}
      <div className="rounded-2xl bg-surface/70 p-4 shadow-card">
        <button
          onClick={() => {
            if (confirm("Reset both scores to 0? (Streak and jar stay.)"))
              store.patchHousehold({ p1_score: 0, p2_score: 0 });
          }}
          className="w-full rounded-lg border border-hair/20 py-2 text-sm font-semibold text-ink/70 active:translate-y-0.5"
        >
          Reset scores
        </button>
      </div>

      <p className="px-1 text-center text-xs text-ink/40">
        Everyone with the passcode shares this scoreboard, live.
      </p>
    </div>
  );
}
