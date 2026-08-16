"use client";

import { useState } from "react";

export default function Gate({
  passcode,
  onUnlock,
}: {
  passcode: string;
  onUnlock: () => void;
}) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === String(passcode).trim()) {
      onUnlock();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setValue("");
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="font-display text-5xl font-black text-ink">
          Phrase<span className="text-ochre">Duel</span>
        </div>
        <p className="mt-2 text-ink/70">
          Enter your household passcode to join the duel.
        </p>
        <form onSubmit={submit} className="mt-7">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="numeric"
            autoFocus
            placeholder="passcode"
            className={`w-full rounded-2xl border-2 border-ochre/30 bg-surface/80 px-5 py-4 text-center text-2xl tracking-widest text-ink outline-none focus:border-ochre ${
              shake ? "animate-[floatup_0s] border-berry" : ""
            }`}
            style={shake ? { animation: "popin 0.4s" } : undefined}
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-ochre py-4 text-lg font-bold text-cream shadow-pop active:translate-y-0.5"
          >
            Enter
          </button>
        </form>
        {shake && (
          <p className="mt-3 text-sm font-medium text-berry">
            Hmm, that&apos;s not it. Try again.
          </p>
        )}
      </div>
    </main>
  );
}
