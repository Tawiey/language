"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "pd-theme";

function applyTheme(t: Theme) {
  const dark =
    t === "dark" ||
    (t === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

const OPTIONS: { k: Theme; label: string; icon: string }[] = [
  { k: "light", label: "Light", icon: "☀︎" },
  { k: "dark", label: "Dark", icon: "☾" },
  { k: "system", label: "Auto", icon: "◑" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme) || "system";
    setTheme(stored);
  }, []);

  // Keep "Auto" in sync if the OS theme changes while selected.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function choose(t: Theme) {
    setTheme(t);
    localStorage.setItem(KEY, t);
    applyTheme(t);
  }

  return (
    <div className="rounded-2xl bg-surface/70 p-4 shadow-card">
      <div className="font-semibold text-ink">Appearance</div>
      <div className="mt-2 flex gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.k}
            onClick={() => choose(o.k)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              theme === o.k ? "bg-ochre text-cream" : "bg-field text-ink/60"
            }`}
          >
            <span className="mr-1">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
