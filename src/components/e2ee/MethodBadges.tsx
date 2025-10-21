"use client";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";

export function MethodBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
      <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 dark:border-gray-800">
        <Lock className="h-4 w-4" /> İçerik: <b>AES-GCM (256-bit)</b>
      </span>
      <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 dark:border-gray-800">
        <KeyRound className="h-4 w-4" /> Anahtar Sarma:{" "}
        <b>RSA-OAEP (SHA-256)</b>
      </span>
      <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 dark:border-gray-800">
        <ShieldCheck className="h-4 w-4" /> İmza: <b>RSA-PSS (SHA-256)</b>
      </span>
    </div>
  );
}
