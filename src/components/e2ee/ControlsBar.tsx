"use client";
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

export function ControlsBar({
  onEncrypt,
  onDecrypt,
  canEncrypt,
  canDecrypt,
  value,
  onChange,
}: {
  onEncrypt: () => void;
  onDecrypt: () => void;
  canEncrypt: boolean;
  canDecrypt: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <label className="sr-only" htmlFor="e2ee-message">
        Mesaj
      </label>
      <input
        id="e2ee-message"
        className={`w-full rounded-xl border bg-panel/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted ${
          focus ? "border-accent glow-accent" : "border-panel-border"
        }`}
        placeholder="Şifrelenecek mesajı yazın…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-describedby="e2ee-helper"
      />
      <button
        onClick={onEncrypt}
        disabled={!canEncrypt}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-[#04110b] transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
      >
        <Lock className="h-4 w-4" /> Şifrele
      </button>
      <button
        onClick={onDecrypt}
        disabled={!canDecrypt}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-panel-border bg-panel/60 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent disabled:opacity-40 disabled:hover:border-panel-border"
      >
        <Unlock className="h-4 w-4" /> Çöz
      </button>
      <p id="e2ee-helper" className="text-xs text-muted md:col-span-3">
        E2EE: Mesaj AES-GCM ile şifrelenir; bu anahtar alıcının RSA-OAEP public
        anahtarıyla sarılır. İmza RSA-PSS.
      </p>
    </div>
  );
}
