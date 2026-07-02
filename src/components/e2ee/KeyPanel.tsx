"use client";
import { useState } from "react";

export type ActorKeys = {
  encPub?: JsonWebKey;
  encPriv?: JsonWebKey;
  signPub?: JsonWebKey;
  signPriv?: JsonWebKey;
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function KeyRow({ title, jwk }: { title: string; jwk?: JsonWebKey }) {
  const [open, setOpen] = useState(false);
  const link =
    "text-xs text-muted underline-offset-2 transition hover:text-accent hover:underline";
  return (
    <div className="rounded-xl border border-panel-border bg-panel/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <div className="flex items-center gap-3">
          <button
            className={link}
            onClick={() =>
              jwk && navigator.clipboard.writeText(JSON.stringify(jwk))
            }
          >
            Kopyala
          </button>
          <button
            className={link}
            onClick={() =>
              jwk && downloadJson(`${title.replace(/\s+/g, "_")}.json`, jwk)
            }
          >
            İndir
          </button>
          <button className={link} onClick={() => setOpen((o) => !o)}>
            {open ? "Kapat" : "Göster"}
          </button>
        </div>
      </div>
      {open && (
        <pre className="mt-2 overflow-auto rounded-lg bg-panel/60 p-2 text-[11px] leading-tight text-muted">
          {JSON.stringify(jwk ?? {}, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function KeyPanel({ alice, bob }: { alice: ActorKeys; bob: ActorKeys }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Alice (Gönderici)</h3>
        <KeyRow title="Alice Sign Public (RSA-PSS)" jwk={alice.signPub} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Bob (Alıcı)</h3>
        <KeyRow title="Bob Encrypt Public (RSA-OAEP)" jwk={bob.encPub} />
        <KeyRow title="Bob Encrypt Private (RSA-OAEP)" jwk={bob.encPriv} />
      </div>
    </div>
  );
}
