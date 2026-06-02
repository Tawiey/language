"use client";

import { useEffect, useState } from "react";
import { useHousehold } from "./lib/useHousehold";
import { isConfigured } from "./lib/supabase";
import Gate from "./components/Gate";
import BottomNav, { Tab } from "./components/BottomNav";
import Scoreboard from "./components/Scoreboard";
import Phrases from "./components/Phrases";
import Duel from "./components/Duel";
import Settings from "./components/Settings";
import SetupNotice from "./components/SetupNotice";

const UNLOCK_KEY = "phraseduel-unlocked";

export default function Page() {
  const store = useHousehold();
  const [tab, setTab] = useState<Tab>("home");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === "yes");
    }
  }, []);

  if (!isConfigured) return <SetupNotice />;

  if (store.loading) {
    return (
      <main className="min-h-dvh grid place-items-center">
        <div className="text-center">
          <div className="font-display text-3xl text-cocoa animate-pulse">
            PhraseDuel
          </div>
          <p className="mt-2 text-sm text-cocoa/60">Loading your household…</p>
        </div>
      </main>
    );
  }

  if (store.error === "load-failed" || !store.household) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="max-w-sm text-center">
          <div className="font-display text-2xl text-berry">Couldn&apos;t connect</div>
          <p className="mt-2 text-sm text-cocoa/70">
            The database is reachable but the household data hasn&apos;t been set
            up yet. Make sure you ran the seed SQL in Supabase.
          </p>
          <button
            onClick={store.reload}
            className="mt-4 rounded-full bg-ochre px-5 py-2 font-semibold text-cream shadow-pop active:translate-y-0.5"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const hh = store.household;

  if (!unlocked) {
    return (
      <Gate
        passcode={hh.passcode}
        onUnlock={() => {
          window.localStorage.setItem(UNLOCK_KEY, "yes");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-28">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-display text-3xl font-black tracking-tight text-cocoa">
          Phrase<span className="text-ochre">Duel</span>
        </h1>
        <p className="text-sm text-cocoa/60">
          {hh.p1_name} &amp; {hh.p2_name} · learning together
        </p>
      </header>

      <div className="px-4">
        {tab === "home" && <Scoreboard store={store} />}
        {tab === "phrases" && <Phrases store={store} />}
        {tab === "duel" && <Duel store={store} />}
        {tab === "settings" && <Settings store={store} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} jar={hh.jar_count} />
    </main>
  );
}
