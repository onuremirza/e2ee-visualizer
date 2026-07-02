"use client";

import { Eye, UserX, Share2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function Toggle({
  on,
  onClick,
  icon,
  label,
  danger,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
        on
          ? danger
            ? "glow-danger border-[var(--danger)] text-[var(--danger)]"
            : "glow-accent border-accent text-accent"
          : "border-panel-border bg-panel/60 text-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function ScenarioBar({
  attacker,
  setAttacker,
  tamper,
  setTamper,
  buildShareUrl,
  reset,
}: {
  attacker: boolean;
  setAttacker: (v: boolean) => void;
  tamper: boolean;
  setTamper: (v: boolean) => void;
  buildShareUrl: () => string;
  reset: () => void;
}) {
  const toast = useToast();

  async function share() {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast("Demo linki kopyalandı");
    } catch {
      toast("Kopyalanamadı");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-medium text-muted">Senaryo:</span>
      <Toggle
        on={attacker}
        onClick={() => setAttacker(!attacker)}
        icon={<Eye className="h-3.5 w-3.5" />}
        label="Ağı dinle (pasif saldırgan)"
      />
      <Toggle
        on={tamper}
        onClick={() => setTamper(!tamper)}
        icon={<UserX className="h-3.5 w-3.5" />}
        label="MITM: anahtarı değiştir"
        danger
      />
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-xl border border-panel-border bg-panel/60 px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
        >
          <Share2 className="h-3.5 w-3.5" /> Paylaş
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl border border-panel-border bg-panel/60 px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
        </button>
      </div>
    </div>
  );
}
