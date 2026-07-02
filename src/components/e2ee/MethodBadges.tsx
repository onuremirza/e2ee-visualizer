"use client";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";

const items = [
  { icon: Lock, label: "İçerik", value: "AES-GCM (256-bit)", color: "var(--accent)" },
  { icon: KeyRound, label: "Anahtar Sarma", value: "RSA-OAEP (SHA-256)", color: "var(--accent-3)" },
  { icon: ShieldCheck, label: "İmza", value: "RSA-PSS (SHA-256)", color: "var(--accent-2)" },
];

export function MethodBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
      {items.map(({ icon: Icon, label, value, color }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-xl border border-panel-border bg-panel/50 px-3 py-2"
        >
          <Icon className="h-4 w-4" style={{ color }} /> {label}:{" "}
          <b className="text-foreground">{value}</b>
        </span>
      ))}
    </div>
  );
}
