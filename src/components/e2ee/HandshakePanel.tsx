"use client";
import { CheckCircle2, UploadCloud, Download, Fingerprint, XCircle } from "lucide-react";

export function HandshakePanel({
  direction,
  publishMyKeys,
  fetchPeerKeys,
  verify,
  published,
  fetched,
  myThumbs,
  peerThumbs,
}: {
  direction: "A→B" | "B→A";
  publishMyKeys: () => Promise<void> | void;
  fetchPeerKeys: () => Promise<void> | void;
  verify: () => { ok: boolean; reason?: string };
  published: boolean;
  fetched: boolean;
  myThumbs: { enc?: string; sign?: string };
  peerThumbs: { enc?: string; sign?: string };
}) {
  const v = verify();
  const whoAmI = direction === "A→B" ? "Alice" : "Bob";
  const peer = direction === "A→B" ? "Bob" : "Alice";

  const btn =
    "mt-2 rounded-lg border border-panel-border px-3 py-1.5 text-xs transition hover:border-accent disabled:opacity-40 disabled:hover:border-panel-border";

  return (
    <div className="surface rounded-2xl p-4">
      <div className="text-sm font-semibold">Handshake (Anahtar Dağıtımı)</div>
      <p className="mt-1 text-xs text-muted">
        1) {whoAmI} public anahtarlarını dizine <strong>yayınlar</strong>. 2){" "}
        {peer}’in public anahtarlarını <strong>indirir</strong>. 3) Parmak izleri{" "}
        <strong>doğrulanır</strong>.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-panel-border p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <UploadCloud className="h-4 w-4 text-accent" /> Yayınla
          </div>
          <button className={btn} onClick={() => publishMyKeys()} disabled={published}>
            {published ? "Yayınlandı ✓" : "Public anahtarlarımı yayınla"}
          </button>
        </div>

        <div className="rounded-xl border border-panel-border p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Download className="h-4 w-4 text-accent-3" /> İndir
          </div>
          <button className={btn} onClick={() => fetchPeerKeys()} disabled={!published || fetched}>
            {!published
              ? "Önce yayınla"
              : fetched
              ? `${peer} indirildi ✓`
              : `${peer} public anahtarlarını indir`}
          </button>
        </div>

        <div className="rounded-xl border border-panel-border p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Fingerprint className="h-4 w-4 text-accent-2" /> Doğrula
          </div>
          <div className="mt-2 space-y-0.5 text-[11px] text-muted">
            <div className="opacity-80">Benim parmak izim:</div>
            <div className="break-all font-mono">ENC: {myThumbs.enc?.slice(0, 24) ?? "—"}…</div>
            <div className="break-all font-mono">SIG: {myThumbs.sign?.slice(0, 24) ?? "—"}…</div>
            <div className="mt-1.5 opacity-80">{peer} için beklenen:</div>
            <div className="break-all font-mono">ENC: {peerThumbs.enc?.slice(0, 24) ?? "—"}…</div>
            <div className="break-all font-mono">SIG: {peerThumbs.sign?.slice(0, 24) ?? "—"}…</div>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                v.ok
                  ? "bg-accent/15 text-accent"
                  : "bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] text-[var(--danger)]"
              }`}
            >
              {v.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {v.ok ? "Doğrulandı" : `Hatalı: ${v.reason ?? "eşleşmiyor"}`}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted">
        Not: Gerçekte bu doğrulama QR kod, kısa kod (SAS), güvenilir dizin ya da
        sertifika zinciri ile yapılır.
      </p>
    </div>
  );
}
