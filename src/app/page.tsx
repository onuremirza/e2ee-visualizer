"use client";

import { motion } from "framer-motion";
import { StepFlow, type StepKey } from "@/components/e2ee/StepFlow";
import { EncryptDiagram } from "@/components/e2ee/EncryptDiagram";
import { KeyPanel, type ActorKeys } from "@/components/e2ee/KeyPanel";

import { InfoCallout } from "@/components/e2ee/InfoCallout";
import { ControlsBar } from "@/components/e2ee/ControlsBar";
import { RoleSwitch } from "@/components/e2ee/RoleSwitch";
import { HandshakePanel } from "@/components/e2ee/HandshakePanel";
import { MethodBadges } from "@/components/e2ee/MethodBadges";
import { useEncryptionFlow } from "@/hooks/useEncryptionFlow";

export default function Page() {
  const {
    alice,
    bob,
    direction,
    setDirection,
    plain,
    setPlain,
    envelope,
    decrypted,
    status,
    error,

    canRun,
    runEncrypt,
    runDecrypt,
    activeStep,

    publishMyKeys,
    fetchPeerKeys,
    verifyPeerFingerprints,
    publishedA,
    publishedB,
    peerFetchedA,
    peerFetchedB,
    aliceThumbs,
    bobThumbs,
  } = useEncryptionFlow();

  const step = activeStep() as StepKey;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight"
      >
        E2EE Visualizer
      </motion.h1>

      <div className="mt-4 flex items-center justify-between">
        <StepFlow active={step} />
        <RoleSwitch value={direction} onChange={setDirection} />
      </div>

      {step === "handshake" && (
        <div className="mt-6">
          <HandshakePanel
            direction={direction}
            publishMyKeys={publishMyKeys}
            fetchPeerKeys={fetchPeerKeys}
            verify={verifyPeerFingerprints}
            published={direction === "A→B" ? publishedA : publishedB}
            fetched={direction === "A→B" ? peerFetchedA : peerFetchedB}
            myThumbs={direction === "A→B" ? aliceThumbs : bobThumbs}
            peerThumbs={direction === "A→B" ? bobThumbs : aliceThumbs}
          />
        </div>
      )}

      <div className="mt-6">
        <ControlsBar
          onEncrypt={runEncrypt}
          onDecrypt={runDecrypt}
          canEncrypt={canRun}
          canDecrypt={Boolean(envelope)}
          value={plain}
          onChange={setPlain}
        />
      </div>

      {status === "error" && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Hata: {error}
        </div>
      )}

      <div className="mt-8">
        <EncryptDiagram
          plain={plain}
          envelope={envelope ?? undefined}
          decrypted={decrypted}
          direction={direction}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <MethodBadges />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Anahtarlar</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Public/Private anahtarlar tarayıcıda üretilir. Private anahtar sayfayı
          terk etmez.
        </p>
        <div className="mt-3">
          <KeyPanel alice={alice as ActorKeys} bob={bob as ActorKeys} />
        </div>
      </div>

      <div className="mt-10">
        <InfoCallout />
      </div>

      <footer className="mt-10 text-xs text-gray-500">
        Demo amaçlıdır. Gerçek projelerde kanıtlanmış kripto kütüphaneleri ve
        güvenli anahtar yönetimi kullanın.
      </footer>
    </div>
  );
}
