"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, KeyRound, Handshake, Lock, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "1 · Anahtarlar tarayıcında üretilir",
    body: "Alice ve Bob için RSA anahtar çiftleri Web Crypto ile oluşturulur. Private anahtar sayfayı asla terk etmez.",
  },
  {
    icon: <Handshake className="h-5 w-5" />,
    title: "2 · Handshake & parmak izi",
    body: "Public anahtarlar dizine yayınlanır, indirilir ve parmak izleri karşılaştırılarak doğrulanır.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "3 · Şifrele & gönder",
    body: "Mesaj AES-GCM ile şifrelenir; bu anahtar alıcının RSA-OAEP anahtarıyla sarılıp ağdan gönderilir.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "4 · Doğrula & çöz",
    body: "Alıcı imzayı (RSA-PSS) doğrular ve mesajı çözer. Sunucu/saldırgan içeriği okuyamaz.",
  },
];

const KEY = "e2ee-tour-seen";

export function Tour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  const last = i === STEPS.length - 1;
  const s = STEPS[i];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Tanıtım turu"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            className="surface w-full max-w-md rounded-3xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent glow-accent">
                {s.icon}
              </div>
              <button
                onClick={close}
                aria-label="Turu kapat"
                className="rounded-lg p-1 text-muted transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.body}</p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === i ? "w-5 bg-accent" : "w-1.5 bg-panel-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => (last ? close() : setI((v) => v + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-[#04110b] transition hover:brightness-110"
              >
                {last ? "Başla" : "İleri"}
                {!last && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
