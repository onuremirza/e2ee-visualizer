"use client";

import { cn } from "@/lib/utils";

const steps = [
  { key: "generate", label: "Anahtar Üret" },
  { key: "handshake", label: "Handshake" },
  { key: "encrypt", label: "Şifrele" },
  { key: "send", label: "Gönder (Ağ)" },
  { key: "verify", label: "İmzayı Doğrula" },
  { key: "decrypt", label: "Çöz" },
] as const;

export type StepKey = (typeof steps)[number]["key"];

export function StepFlow({ active }: { active: StepKey }) {
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.key === active)
  );
  return (
    <div className="relative grid grid-cols-5 gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-col items-center">
          <div
            className={cn(
              "h-8 w-8 rounded-full border grid place-items-center text-xs font-semibold",
              i < idx
                ? "bg-emerald-500 text-white border-emerald-500"
                : i === idx
                ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500"
            )}
            aria-current={i === idx}
            title={s.label}
          >
            {i + 1}
          </div>
          <div className="mt-1 text-[11px] text-center text-gray-600 dark:text-gray-400">
            {s.label}
          </div>
        </div>
      ))}
      <div className="pointer-events-none absolute left-0 right-0 top-4 -z-10 h-0.5  from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
    </div>
  );
}
