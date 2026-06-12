"use client";

import { useEffect, useState } from "react";
import { supabase, isConfigured } from "./supabase";
import type { Player } from "./types";

// Tracks which players are currently online via Supabase Realtime Presence.
// `me` is this device's player id; presence is keyed by player so we can tell
// exactly which partner is here (not just a headcount of tabs).
export function usePresence(me: Player | null) {
  const [online, setOnline] = useState<Player[]>([]);

  useEffect(() => {
    if (!isConfigured || !me) return;

    const channel = supabase.channel("phraseduel-presence", {
      config: { presence: { key: String(me) } },
    });

    const sync = () => {
      const state = channel.presenceState();
      const players = Object.keys(state)
        .map((k) => Number(k) as Player)
        .filter((p) => p === 1 || p === 2);
      setOnline(players);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    // Mark us as gone promptly when the tab is hidden/closed.
    const onHide = () => {
      if (document.visibilityState === "hidden") channel.untrack();
      else channel.track({ at: Date.now() });
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      supabase.removeChannel(channel);
    };
  }, [me]);

  const p1Online = online.includes(1);
  const p2Online = online.includes(2);
  return { online, p1Online, p2Online, bothOnline: p1Online && p2Online };
}
