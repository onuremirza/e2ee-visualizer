"use client";
import { useState } from "react";

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
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
          focus
            ? "ring-2 ring-emerald-400 border-emerald-300"
            : "border-gray-200"
        } dark:bg-gray-950 dark:border-gray-800`}
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
        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 dark:border-gray-800"
      >
        Şifrele
      </button>
      <button
        onClick={onDecrypt}
        disabled={!canDecrypt}
        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 dark:border-gray-800"
      >
        Çöz
      </button>
      <p id="e2ee-helper" className="md:col-span-3 text-xs text-gray-500">
        E2EE: Mesaj AES-GCM ile şifrelenir; bu anahtar alıcının RSA-OAEP public
        anahtarıyla sarılır. İmza RSA-PSS.
      </p>
    </div>
  );
}
