"use client";
import { useState } from "react";

export function CodeCard({
  title,
  text,
  clamp = 6,
}: {
  title: string;
  text?: string;
  clamp?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border p-3 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </h4>
        <div className="flex items-center gap-2">
          <button
            className="text-xs underline"
            onClick={() => text && navigator.clipboard.writeText(text)}
            aria-label={`${title} kopyala`}
          >
            Kopyala
          </button>
          <button
            className="text-xs underline"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Kapat" : "Genişlet"}
          </button>
        </div>
      </div>
      <pre
        className={`mt-2 overflow-auto text-[11px] leading-tight ${
          open ? "" : `line-clamp-${clamp}`
        }`}
      >
        {text || "—"}
      </pre>
    </div>
  );
}
