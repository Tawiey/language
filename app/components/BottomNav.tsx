"use client";

export type Tab = "home" | "phrases" | "duel" | "settings";

const items: { key: Tab; label: string; icon: JSX.Element }[] = [
  {
    key: "home",
    label: "Score",
    icon: (
      <path d="M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z" />
    ),
  },
  {
    key: "phrases",
    label: "Phrases",
    icon: (
      <path d="M4 5h16v2H4zM4 9h16v2H4zM4 13h10v2H4zM4 17h10v2H4z" />
    ),
  },
  {
    key: "duel",
    label: "Duel",
    icon: (
      <path d="M6 3l3 3-2 2 4 4 2-2 3 3-2 6-9-9zM18 3l3 3-6 6-3-3z" />
    ),
  },
  {
    key: "settings",
    label: "Settings",
    icon: (
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-2 1 1 2-2 2-2-1-1 2h-2l-1-2-2 1-2-2 1-2-2-1V11l2-1-1-2 2-2 2 1 1-2h2l1 2 2-1 2 2-1 2 2 1z" />
    ),
  },
];

export default function BottomNav({
  tab,
  setTab,
  jar,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  jar: number;
}) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto max-w-md px-3 pt-2">
        <div className="flex items-center justify-around rounded-3xl border border-cocoa/10 bg-cream/95 px-2 py-2 shadow-card backdrop-blur">
          {items.map((it) => {
            const active = tab === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setTab(it.key)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-colors ${
                  active ? "text-ochre" : "text-cocoa/45"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                  aria-hidden
                >
                  {it.icon}
                </svg>
                <span className="text-[11px] font-semibold">{it.label}</span>
                {it.key === "duel" && jar > 0 && null}
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-ochre" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
