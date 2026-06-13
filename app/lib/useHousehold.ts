"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, HOUSEHOLD_ID, isConfigured } from "./supabase";
import type { Household, Phrase, Player } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hhRef = useRef<Household | null>(null);
  hhRef.current = household;

  // Initial load
  const load = useCallback(async () => {
    if (!isConfigured) {
      setError("not-configured");
      setLoading(false);
      return;
    }
    try {
      const [{ data: hh, error: hhErr }, { data: ph, error: phErr }] =
        await Promise.all([
          supabase.from("household").select("*").eq("id", HOUSEHOLD_ID).single(),
          supabase.from("phrases").select("*").order("created_at", { ascending: false }),
        ]);
      if (hhErr) throw hhErr;
      if (phErr) throw phErr;
      setHousehold(hh as Household);
      setPhrases((ph as Phrase[]) || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "load-failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscriptions
  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase
      .channel("household-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "household" },
        (payload) => {
          if (payload.new && (payload.new as Household).id === HOUSEHOLD_ID) {
            setHousehold(payload.new as Household);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "phrases" },
        (payload) => {
          setPhrases((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Phrase;
              if (prev.some((p) => p.id === row.id)) return prev;
              return [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Phrase;
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Phrase;
              return prev.filter((p) => p.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Optimistic patch + persist
  const patchHousehold = useCallback(async (patch: Partial<Household>) => {
    const current = hhRef.current;
    if (!current) return;
    const optimistic = { ...current, ...patch };
    setHousehold(optimistic);
    const { error } = await supabase
      .from("household")
      .update(patch)
      .eq("id", HOUSEHOLD_ID);
    if (error) setError(error.message);
  }, []);

  // Award/deduct points, with daily streak bookkeeping
  const addPoints = useCallback(
    async (player: Player, delta: number) => {
      const current = hhRef.current;
      if (!current) return;
      const patch: Partial<Household> = {};
      if (player === 1) patch.p1_score = Math.max(0, current.p1_score + delta);
      else patch.p2_score = Math.max(0, current.p2_score + delta);

      // Only positive activity advances the streak
      if (delta > 0) {
        const today = todayStr();
        if (current.last_active !== today) {
          patch.streak =
            current.last_active === yesterdayStr() ? current.streak + 1 : 1;
          patch.last_active = today;
        }
      }
      await patchHousehold(patch);
    },
    [patchHousehold]
  );

  const bumpJar = useCallback(async () => {
    const current = hhRef.current;
    if (!current) return;
    await patchHousehold({ jar_count: current.jar_count + 1 });
  }, [patchHousehold]);

  const resetJar = useCallback(async () => {
    await patchHousehold({ jar_count: 0 });
  }, [patchHousehold]);

  // Phrase CRUD (optimistic where helpful)
  const addPhrase = useCallback(
    async (english: string, shona: string, setswana: string) => {
      const { error } = await supabase
        .from("phrases")
        .insert({ english, shona, setswana });
      if (error) setError(error.message);
    },
    []
  );

  const updatePhrase = useCallback(
    async (id: string, patch: Partial<Phrase>) => {
      setPhrases((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      const { error } = await supabase.from("phrases").update(patch).eq("id", id);
      if (error) setError(error.message);
    },
    []
  );

  const deletePhrase = useCallback(async (id: string) => {
    setPhrases((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from("phrases").delete().eq("id", id);
    if (error) setError(error.message);
  }, []);

  return {
    household,
    phrases,
    loading,
    error,
    reload: load,
    patchHousehold,
    addPoints,
    bumpJar,
    resetJar,
    addPhrase,
    updatePhrase,
    deletePhrase,
  };
}
