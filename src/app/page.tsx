"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { StepFlow, type StepKey } from "@/components/e2ee/StepFlow";
import { FlowDiagram } from "@/components/e2ee/FlowDiagram";
import { KeyPanel, type ActorKeys } from "@/components/e2ee/KeyPanel";
import { InfoCallout } from "@/components/e2ee/InfoCallout";
import { ControlsBar } from "@/components/e2ee/ControlsBar";
import { RoleSwitch } from "@/components/e2ee/RoleSwitch";
import { HandshakePanel } from "@/components/e2ee/HandshakePanel";
import { MethodBadges } from "@/components/e2ee/MethodBadges";
import { ScenarioBar } from "@/components/e2ee/ScenarioBar";
import { Tour } from "@/components/e2ee/Tour";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ToastProvider } from "@/components/ui/Toast";
import { useEncryptionFlow } from "@/hooks/useEncryptionFlow";

export default function Page() {
  const f = useEncryptionFlow();
  const step = f.activeStep() as StepKey;

  return (
    <ToastProvider>
      <Tour />
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* ——— Hero ——— */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel/60 px-3 py-1 text-xs text-muted"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Gerçek Web Crypto · uçtan uca
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="brand-gradient mt-3 pb-1 text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl"
            >
              E2EE Visualizer
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="mt-2 max-w-xl text-sm text-muted sm:text-base"
            >
              Bir mesajın şifrelenip ağdan geçişini ve alıcıda çözülüşünü canlı
              izleyin. Anahtarlar tarayıcınızda üretilir; private anahtar sayfayı
              terk etmez.
            </motion.p>
          </div>
          <ThemeToggle />
        </header>

        {/* ——— Adım göstergesi + yön ——— */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <StepFlow active={step} />
          </div>
          <RoleSwitch value={f.direction} onChange={f.setDirection} />
        </div>

        {/* ——— Handshake (yalnız o adımda) ——— */}
        {step === "handshake" && (
          <div className="mt-6">
            <HandshakePanel
              direction={f.direction}
              publishMyKeys={f.publishMyKeys}
              fetchPeerKeys={f.fetchPeerKeys}
              verify={f.verifyPeerFingerprints}
              published={f.direction === "A→B" ? f.publishedA : f.publishedB}
              fetched={f.direction === "A→B" ? f.peerFetchedA : f.peerFetchedB}
              myThumbs={f.direction === "A→B" ? f.aliceThumbs : f.bobThumbs}
              peerThumbs={f.direction === "A→B" ? f.bobThumbs : f.aliceThumbs}
            />
          </div>
        )}

        {/* ——— Kontroller ——— */}
        <div className="mt-6">
          <ControlsBar
            onEncrypt={f.runEncrypt}
            onDecrypt={f.runDecrypt}
            canEncrypt={f.canRun}
            canDecrypt={Boolean(f.envelope)}
            value={f.plain}
            onChange={f.setPlain}
          />
        </div>

        {/* ——— Senaryolar ——— */}
        <div className="mt-4">
          <ScenarioBar
            attacker={f.attacker}
            setAttacker={f.setAttacker}
            tamper={f.tamper}
            setTamper={f.setTamper}
            buildShareUrl={f.buildShareUrl}
            reset={f.reset}
          />
        </div>

        {/* ——— Durum (aria-live) ——— */}
        <div aria-live="polite" className="min-h-[1.5rem]">
          {f.status === "error" && (
            <div className="mt-3 rounded-xl border border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
              Hata: {f.error}
            </div>
          )}
          {f.status === "ok" && f.decrypted && (
            <div className="mt-3 rounded-xl border border-accent bg-accent/10 px-3 py-2 text-sm text-accent">
              Mesaj başarıyla çözüldü ve imza doğrulandı.
            </div>
          )}
        </div>

        {/* ——— Animasyonlu akış ——— */}
        <div className="mt-6">
          <FlowDiagram
            plain={f.plain}
            envelope={f.envelope ?? undefined}
            decrypted={f.decrypted}
            direction={f.direction}
            step={step}
            attacker={f.attacker}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <MethodBadges />
        </div>

        {/* ——— Anahtarlar ——— */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Anahtarlar</h2>
          <p className="mt-1 text-sm text-muted">
            Public/Private anahtarlar tarayıcıda üretilir. Private anahtar sayfayı
            terk etmez.
          </p>
          <div className="mt-3">
            <KeyPanel alice={f.alice as ActorKeys} bob={f.bob as ActorKeys} />
          </div>
        </section>

        <div className="mt-10">
          <InfoCallout />
        </div>

        <footer className="mt-10 text-xs text-muted">
          Demo amaçlıdır. Gerçek projelerde kanıtlanmış kripto kütüphaneleri ve
          güvenli anahtar yönetimi kullanın.
        </footer>
      </div>
    </ToastProvider>
  );
}
