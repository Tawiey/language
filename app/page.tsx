"use client";

import { useEffect, useState } from "react";
import { useHousehold } from "./lib/useHousehold";
import { usePresence } from "./lib/usePresence";
import { isConfigured } from "./lib/supabase";
import type { Player } from "./lib/types";
import Gate from "./components/Gate";
import MeChooser from "./components/MeChooser";
import BottomNav, { Tab } from "./components/BottomNav";
import Scoreboard from "./components/Scoreboard";
import Phrases from "./components/Phrases";
import Duel from "./components/Duel";
import Settings from "./components/Settings";
import SetupNotice from "./components/SetupNotice";

const UNLOCK_KEY = "phraseduel-unlocked";
const ME_KEY = "phraseduel-me";

export default function Page() {
  const store = useHousehold();
  const [tab, setTab] = useState<Tab>("home");
  const [unlocked, setUnlocked] = useState(false);
  const [me, setMe] = useState<Player | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === "yes");
      const m = window.localStorage.getItem(ME_KEY);
      if (m === "1" || m === "2") setMe(Number(m) as Player);
    }
  }, []);

  function pickMe(p: Player) {
    window.localStorage.setItem(ME_KEY, String(p));
    setMe(p);
  }

  const presence = usePresence(me);

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

  if (!me) {
    return <MeChooser household={hh} onPick={pickMe} />;
  }

  const myName = me === 1 ? hh.p1_name : hh.p2_name;
  const otherName = me === 1 ? hh.p2_name : hh.p1_name;
  const otherOnline = me === 1 ? presence.p2Online : presence.p1Online;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-28">
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-black tracking-tight text-cocoa">
            Phrase<span className="text-ochre">Duel</span>
          </h1>
          <PresencePill bothOnline={presence.bothOnline} otherName={otherName} otherOnline={otherOnline} />
        </div>
        <p className="text-sm text-cocoa/60">
          You&apos;re <span className="font-semibold text-clay">{myName}</span> · learning{" "}
          {me === 1 ? hh.p1_lang : hh.p2_lang}
        </p>
      </header>

      <div className="px-4">
        {tab === "home" && <Scoreboard store={store} presence={presence} />}
        {tab === "phrases" && <Phrases store={store} />}
        {tab === "duel" && <Duel store={store} />}
        {tab === "settings" && <Settings store={store} me={me} onSetMe={pickMe} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} jar={hh.jar_count} />
    </main>
  );
}

function PresencePill({
  bothOnline,
  otherName,
  otherOnline,
}: {
  bothOnline: boolean;
  otherName: string;
  otherOnline: boolean;
}) {
  if (bothOnline) {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-leaf/20 px-3 py-1.5 text-xs font-bold text-leaf animate-popin">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
        </span>
        Both here 💞
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-cocoa/10 px-3 py-1.5 text-xs font-semibold text-cocoa/50">
      <span className={`h-2 w-2 rounded-full ${otherOnline ? "bg-leaf" : "bg-cocoa/30"}`} />
      {otherOnline ? `${otherName} is here` : `Waiting for ${otherName}`}
    </span>
  );
}
