"use client";

import { cn } from "@/lib/utils";

const steps = [
  { key: "generate", label: "Anahtar Üret" },
  { key: "handshake", label: "Handshake" },
  { key: "encrypt", label: "Şifrele" },
  { key: "send", label: "Gönder (Ağ)" },
  { key: "verify", label: "İmza Doğrula" },
  { key: "decrypt", label: "Çöz" },
] as const;

export type StepKey = (typeof steps)[number]["key"];

export function StepFlow({ active }: { active: StepKey }) {
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.key === active)
  );
  const pct = steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0;

  return (
    <div>
      <div className="relative grid grid-cols-6 gap-1.5">
        {/* zemin çizgisi */}
        <div className="pointer-events-none absolute left-0 right-0 top-4 -z-10 h-0.5 bg-panel-border" />
        {/* ilerleme çizgisi */}
        <div
          className="pointer-events-none absolute left-0 top-4 -z-10 h-0.5 bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-col items-center">
            <div
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                i < idx
                  ? "border-accent bg-accent text-[#04110b]"
                  : i === idx
                  ? "border-accent bg-accent/15 text-accent animate-pulse-glow"
                  : "border-panel-border bg-panel/60 text-muted"
              )}
              aria-current={i === idx ? "step" : undefined}
              title={s.label}
            >
              {i + 1}
            </div>
            {/* etiketler yalnız sm+ (mobilde sıkışmasın) */}
            <div className="mt-1 hidden text-center text-[11px] leading-tight text-muted sm:block">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* mobil: yalnız aktif adım etiketi */}
      <div className="mt-2 text-center text-xs font-medium text-accent sm:hidden">
        {idx + 1}/{steps.length} · {steps[idx].label}
      </div>
    </div>
  );
}
