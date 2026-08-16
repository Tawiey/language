"use client";

import type { Household, Player } from "../lib/types";

export default function MeChooser({
  household,
  onPick,
}: {
  household: Household;
  onPick: (p: Player) => void;
}) {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="font-display text-4xl font-black text-ink">
          Who&apos;s holding this phone?
        </div>
        <p className="mt-2 text-ink/70">
          So we can tell when you&apos;re both on together.
        </p>
        <div className="mt-7 grid gap-3">
          <button
            onClick={() => onPick(1)}
            className="rounded-2xl bg-clay py-5 text-xl font-bold text-cream shadow-pop active:translate-y-0.5"
          >
            {household.p1_name}
            <span className="block text-sm font-medium text-cream/70">
              learning {household.p1_lang}
            </span>
          </button>
          <button
            onClick={() => onPick(2)}
            className="rounded-2xl bg-cocoa py-5 text-xl font-bold text-cream shadow-pop active:translate-y-0.5"
          >
            {household.p2_name}
            <span className="block text-sm font-medium text-cream/70">
              learning {household.p2_lang}
            </span>
          </button>
        </div>
        <p className="mt-4 text-xs text-ink/40">
          You can switch this later in Settings.
        </p>
      </div>
    </main>
  );
}
