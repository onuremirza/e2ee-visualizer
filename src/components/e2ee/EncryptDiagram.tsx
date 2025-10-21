"use client";
import { motion } from "framer-motion";
import { Lock, Unlock, Send, Mail, ArrowRightLeft } from "lucide-react";
import type { Envelope } from "@/lib/crypto/e2ee";
import { MethodBadges } from "./MethodBadges";

type EnvelopeLite = Pick<Envelope, "iv" | "ciphertext" | "wrappedKey">;

export function EncryptDiagram({
  plain,
  envelope,
  decrypted,
  direction = "A→B",
}: {
  plain: string;
  envelope?: EnvelopeLite | null;
  decrypted?: string;
  direction?: "A→B" | "B→A";
}) {
  const left = direction === "A→B" ? "Alice (Gönderici)" : "Bob (Gönderici)";
  const right = direction === "A→B" ? "Bob (Alıcı)" : "Alice (Alıcı)";

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <ArrowRightLeft className="h-4 w-4" /> Yön:{" "}
        <span className="font-medium">{direction}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6">
        {/* Sender */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Send className="h-4 w-4" /> {left}
          </div>
          <div className="mt-2 text-xs">
            <div>
              <span className="font-medium">Düz Metin:</span> {plain || "—"}
            </div>
          </div>
        </motion.div>

        {/* Network */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4" /> Ağ (Gönderilen Paket)
          </div>
          <div className="mt-2 text-xs break-all">
            <div className="font-medium">Ciphertext:</div>
            <div className="line-clamp-3">{envelope?.ciphertext || "—"}</div>
            <div className="mt-2 font-medium">IV:</div>
            <div className="break-all line-clamp-1">{envelope?.iv || "—"}</div>
            <div className="mt-2 font-medium">Sarılı AES Anahtarı:</div>
            <div className="break-all line-clamp-1">
              {envelope?.wrappedKey || "—"}
            </div>
          </div>
        </motion.div>

        {/* Recipient */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Unlock className="h-4 w-4" /> {right}
          </div>
          <div className="mt-2 text-xs">
            <div>
              <span className="font-medium">Çözülmüş Metin:</span>{" "}
              {decrypted || "—"}
            </div>
          </div>
        </motion.div>
      </div>

      <MethodBadges />
      <div className="flex items-center justify-center text-[11px] text-gray-500">
        İçerik şifreleme: AES-GCM • Anahtar sarması: RSA-OAEP • İmza: RSA-PSS
      </div>
    </div>
  );
}
