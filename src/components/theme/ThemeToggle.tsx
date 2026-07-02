"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
      title={dark ? "Aydınlık tema" : "Karanlık tema"}
      className="inline-grid h-9 w-9 place-items-center rounded-xl border border-panel-border bg-panel/70 text-foreground/80 transition hover:text-foreground hover:glow-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
