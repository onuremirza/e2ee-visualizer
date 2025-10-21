"use client";
import { CheckCircle2, UploadCloud, Download, Fingerprint } from "lucide-react";

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

  return (
    <div className="rounded-2xl border p-4 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="text-sm font-semibold">Handshake (Anahtar Dağıtımı)</div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        1) {whoAmI} public anahtarlarını dizine <strong>yayınlar</strong>. 2){" "}
        {peer}’in public anahtarlarını <strong>indirir</strong>. 3) Parmak
        izleri <strong>doğrulanır</strong>.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border p-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs font-medium">
            <UploadCloud className="h-4 w-4" /> Yayınla
          </div>
          <button
            className="mt-2 rounded-lg border px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => publishMyKeys()}
            disabled={published}
          >
            {published ? "Yayınlandı" : "Public anahtarlarımı yayınla"}
          </button>
        </div>

        <div className="rounded-xl border p-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Download className="h-4 w-4" /> İndir
          </div>
          <button
            className="mt-2 rounded-lg border px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => fetchPeerKeys()}
            disabled={!published || fetched}
          >
            {!published
              ? "Önce yayınla"
              : fetched
              ? `${peer} indirildi`
              : `${peer} public anahtarlarını indir`}
          </button>
        </div>

        <div className="rounded-xl border p-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Fingerprint className="h-4 w-4" /> Doğrula
          </div>
          <div className="mt-2 text-[11px]">
            <div className="opacity-70">Benim parmak izim:</div>
            <div className="break-all">ENC: {myThumbs.enc ?? "—"}</div>
            <div className="break-all">SIG: {myThumbs.sign ?? "—"}</div>
            <div className="mt-2 opacity-70">{peer} için beklenen:</div>
            <div className="break-all">ENC: {peerThumbs.enc ?? "—"}</div>
            <div className="break-all">SIG: {peerThumbs.sign ?? "—"}</div>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                v.ok
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />{" "}
              {v.ok ? "Doğrulandı" : `Hatalı: ${v.reason ?? "eşleşmiyor"}`}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-gray-500">
        Not: Gerçekte bu doğrulama QR kod, kısa kod (SAS), güvenilir dizin ya da
        sertifika zinciri ile yapılır.
      </p>
    </div>
  );
}
