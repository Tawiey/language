"use client";

import { useState } from "react";
import type { useHousehold } from "../lib/useHousehold";
import type { Phrase } from "../lib/types";
import VoiceNote from "./VoiceNote";

type Store = ReturnType<typeof useHousehold>;

function PhraseRow({
  store,
  phrase,
}: {
  store: Store;
  phrase: Phrase;
}) {
  const [editing, setEditing] = useState(false);
  const [english, setEnglish] = useState(phrase.english);
  const [shona, setShona] = useState(phrase.shona);
  const [setswana, setSetswana] = useState(phrase.setswana);

  function save() {
    store.updatePhrase(phrase.id, { english, shona, setswana });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-2xl bg-surface/80 p-4 shadow-card">
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="English"
          className="w-full rounded-lg border border-hair/15 bg-field px-3 py-2 font-display text-lg text-ink outline-none focus:border-ochre"
        />
        <input
          value={shona}
          onChange={(e) => setShona(e.target.value)}
          placeholder="Shona"
          className="mt-2 w-full rounded-lg border border-hair/15 bg-field px-3 py-2 outline-none focus:border-ochre"
        />
        <input
          value={setswana}
          onChange={(e) => setSetswana(e.target.value)}
          placeholder="Setswana"
          className="mt-2 w-full rounded-lg border border-hair/15 bg-field px-3 py-2 outline-none focus:border-ochre"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={save}
            className="flex-1 rounded-lg bg-leaf py-2 text-sm font-semibold text-cream active:translate-y-0.5"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-hair/20 px-4 py-2 text-sm font-semibold text-ink/70"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface/70 p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold text-ink">
            {phrase.english}
          </div>
          <div className="mt-1 text-sm">
            <span className="font-semibold text-clay">Shona:</span>{" "}
            <span className="text-ink/80">{phrase.shona || "—"}</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-leaf">Setswana:</span>{" "}
            <span className="text-ink/80">{phrase.setswana || "—"}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-ochre"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this phrase?")) store.deletePhrase(phrase.id);
            }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-berry/80"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Voice notes for each language */}
      <div className="mt-3 border-t border-hair/10 pt-2">
        <VoiceNote
          phraseId={phrase.id}
          lang="shona"
          label="Shona"
          color="text-clay"
          url={phrase.shona_audio}
          onSave={(u) => store.updatePhrase(phrase.id, { shona_audio: u })}
          onClear={() => store.updatePhrase(phrase.id, { shona_audio: null })}
        />
        <VoiceNote
          phraseId={phrase.id}
          lang="setswana"
          label="Setswana"
          color="text-leaf"
          url={phrase.setswana_audio}
          onSave={(u) => store.updatePhrase(phrase.id, { setswana_audio: u })}
          onClear={() => store.updatePhrase(phrase.id, { setswana_audio: null })}
        />
      </div>
    </div>
  );
}

export default function Phrases({ store }: { store: Store }) {
  const [adding, setAdding] = useState(false);
  const [english, setEnglish] = useState("");
  const [shona, setShona] = useState("");
  const [setswana, setSetswana] = useState("");

  function add() {
    if (!english.trim()) return;
    store.addPhrase(english.trim(), shona.trim(), setswana.trim());
    setEnglish("");
    setShona("");
    setSetswana("");
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-bold text-ink">Phrases</h2>
        <span className="text-sm text-ink/50">{store.phrases.length} total</span>
      </div>

      {adding ? (
        <div className="rounded-2xl bg-surface/80 p-4 shadow-card animate-popin">
          <input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="English sentence"
            autoFocus
            className="w-full rounded-lg border border-hair/15 bg-field px-3 py-2 font-display text-lg text-ink outline-none focus:border-ochre"
          />
          <input
            value={shona}
            onChange={(e) => setShona(e.target.value)}
            placeholder="Shona translation"
            className="mt-2 w-full rounded-lg border border-hair/15 bg-field px-3 py-2 outline-none focus:border-ochre"
          />
          <input
            value={setswana}
            onChange={(e) => setSetswana(e.target.value)}
            placeholder="Setswana translation"
            className="mt-2 w-full rounded-lg border border-hair/15 bg-field px-3 py-2 outline-none focus:border-ochre"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={add}
              className="flex-1 rounded-lg bg-ochre py-2 text-sm font-bold text-cream active:translate-y-0.5"
            >
              Add phrase
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-hair/20 px-4 py-2 text-sm font-semibold text-ink/70"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border-2 border-dashed border-ochre/40 py-3 font-semibold text-ochre active:translate-y-0.5"
        >
          + Add a new phrase
        </button>
      )}

      <div className="space-y-3">
        {store.phrases.map((p) => (
          <PhraseRow key={p.id} store={store} phrase={p} />
        ))}
        {store.phrases.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">
            No phrases yet — add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
