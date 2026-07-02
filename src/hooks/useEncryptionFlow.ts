"use client";

import { useEffect, useMemo, useState } from "react";
import {
  decryptMessage,
  encryptMessage,
  exportKeyJwk,
  generateRsaOaepKeyPair,
  generateRsaPssKeyPair,
  importRsaOaepPrivate,
  importRsaOaepPublic,
  importRsaPssPrivate,
  importRsaPssPublic,
  jwkThumbprintRSA,
  type Envelope,
} from "@/lib/crypto/e2ee";
import { publishToDirectory, fetchFromDirectory } from "@/lib/sim/directory";

export type ActorKeys = {
  encPub?: JsonWebKey;
  encPriv?: JsonWebKey;
  signPub?: JsonWebKey;
  signPriv?: JsonWebKey;
};

type Dir = "A→B" | "B→A";

type Step =
  | "generate"
  | "handshake"
  | "encrypt"
  | "send"
  | "verify"
  | "decrypt";

export function useEncryptionFlow() {
  const [alice, setAlice] = useState<ActorKeys>({});
  const [bob, setBob] = useState<ActorKeys>({});

  const [direction, setDirection] = useState<Dir>("A→B");

  const [plainAB, setPlainAB] = useState("Merhaba Bob!");
  const [plainBA, setPlainBA] = useState("Merhaba Alice!");

  // Saldırı simülasyonları
  const [attacker, setAttacker] = useState(false); // ağ dinleme görünümü
  const [tamper, setTamper] = useState(false); // MITM: anahtar değiştirme

  // URL'den başlangıç durumunu oku (paylaşılabilir demo linki)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const dir = p.get("dir");
      if (dir === "A→B" || dir === "B→A") setDirection(dir);
      const msg = p.get("msg");
      if (msg) {
        if (dir === "B→A") setPlainBA(msg);
        else setPlainAB(msg);
      }
      if (p.get("atk") === "1") setAttacker(true);
    } catch {}
  }, []);

  const [envAB, setEnvAB] = useState<Envelope | null>(null);
  const [envBA, setEnvBA] = useState<Envelope | null>(null);
  const [decAB, setDecAB] = useState("");
  const [decBA, setDecBA] = useState("");

  const [status, setStatus] = useState<
    "idle" | "encrypting" | "decrypting" | "ok" | "error"
  >("idle");
  const [error, setError] = useState("");

  const [publishedA, setPublishedA] = useState(false);
  const [publishedB, setPublishedB] = useState(false);
  const [peerFetchedA, setPeerFetchedA] = useState(false);
  const [peerFetchedB, setPeerFetchedB] = useState(false);

  const [aliceThumbs, setAliceThumbs] = useState<{
    enc?: string;
    sign?: string;
  }>({});
  const [bobThumbs, setBobThumbs] = useState<{ enc?: string; sign?: string }>(
    {}
  );

  useEffect(() => {
    (async () => {
      const [aEnc, aSign, bEnc, bSign] = await Promise.all([
        generateRsaOaepKeyPair(),
        generateRsaPssKeyPair(),
        generateRsaOaepKeyPair(),
        generateRsaPssKeyPair(),
      ]);

      setAlice({
        encPub: await exportKeyJwk(aEnc.publicKey),
        encPriv: await exportKeyJwk(aEnc.privateKey),
        signPub: await exportKeyJwk(aSign.publicKey),
        signPriv: await exportKeyJwk(aSign.privateKey),
      });

      setBob({
        encPub: await exportKeyJwk(bEnc.publicKey),
        encPriv: await exportKeyJwk(bEnc.privateKey),
        signPub: await exportKeyJwk(bSign.publicKey),
        signPriv: await exportKeyJwk(bSign.privateKey),
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (alice.encPub && alice.signPub) {
        setAliceThumbs({
          enc: await jwkThumbprintRSA(alice.encPub),
          sign: await jwkThumbprintRSA(alice.signPub),
        });
      }
      if (bob.encPub && bob.signPub) {
        setBobThumbs({
          enc: await jwkThumbprintRSA(bob.encPub),
          sign: await jwkThumbprintRSA(bob.signPub),
        });
      }
    })();
  }, [alice.encPub, alice.signPub, bob.encPub, bob.signPub]);

  // Bir aktörün public anahtarlarını dizine yayınlar (parmak izleriyle).
  function publishActor(userId: "alice" | "bob"): boolean {
    const a = userId === "alice" ? alice : bob;
    const t = userId === "alice" ? aliceThumbs : bobThumbs;
    if (!a.encPub || !a.signPub || !t.enc || !t.sign) return false;
    publishToDirectory({
      userId,
      encPub: a.encPub,
      signPub: a.signPub,
      encThumbprintHex: t.enc,
      signThumbprintHex: t.sign,
      updatedAt: Date.now(),
    });
    return true;
  }

  async function publishMyKeys() {
    const me = direction === "A→B" ? "alice" : "bob";
    if (!publishActor(me)) return;
    if (me === "alice") setPublishedA(true);
    else setPublishedB(true);
  }

  async function fetchPeerKeys() {
    const peer = direction === "A→B" ? "bob" : "alice";
    // Peer'in kendi anahtarını daha önce dizine kaydettiğini varsay
    // (tek kullanıcılı demoda karşı tarafı otomatik tohumla).
    publishActor(peer);
    const rec = fetchFromDirectory(peer);
    if (!rec) return;
    if (peer === "bob") setPeerFetchedA(true);
    else setPeerFetchedB(true);
  }

  function verifyPeerFingerprints(): { ok: boolean; reason?: string } {
    // MITM simülasyonu: saldırgan araya girip anahtarı değiştirmiş gibi davran
    if (tamper)
      return {
        ok: false,
        reason: "MITM — beklenen parmak iziyle eşleşmiyor",
      };
    if (direction === "A→B") {
      const rec = fetchFromDirectory("bob");
      if (!rec || !bobThumbs.enc || !bobThumbs.sign)
        return { ok: false, reason: "Peer yok" };
      if (rec.encThumbprintHex !== bobThumbs.enc)
        return { ok: false, reason: "ENC fingerprint uyumsuz" };
      if (rec.signThumbprintHex !== bobThumbs.sign)
        return { ok: false, reason: "SIGN fingerprint uyumsuz" };
      return { ok: true };
    } else {
      const rec = fetchFromDirectory("alice");
      if (!rec || !aliceThumbs.enc || !aliceThumbs.sign)
        return { ok: false, reason: "Peer yok" };
      if (rec.encThumbprintHex !== aliceThumbs.enc)
        return { ok: false, reason: "ENC fingerprint uyumsuz" };
      if (rec.signThumbprintHex !== aliceThumbs.sign)
        return { ok: false, reason: "SIGN fingerprint uyumsuz" };
      return { ok: true };
    }
  }

  function reset() {
    setEnvAB(null);
    setEnvBA(null);
    setDecAB("");
    setDecBA("");
    setStatus("idle");
    setError("");
  }

  function buildShareUrl(): string {
    const p = new URLSearchParams();
    p.set("dir", direction);
    p.set("msg", direction === "A→B" ? plainAB : plainBA);
    if (attacker) p.set("atk", "1");
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }

  const canRunAB = useMemo(
    () => !!(alice.signPriv && bob.encPub),
    [alice, bob]
  );
  const canRunBA = useMemo(
    () => !!(bob.signPriv && alice.encPub),
    [alice, bob]
  );

  async function runEncrypt() {
    try {
      setStatus("encrypting");
      setError("");

      if (direction === "A→B") {
        const recipientPub = await importRsaOaepPublic(bob.encPub!);
        const senderSignPriv = await importRsaPssPrivate(alice.signPriv!);
        const env = await encryptMessage(plainAB, recipientPub, senderSignPriv);
        setEnvAB(env);
      } else {
        const recipientPub = await importRsaOaepPublic(alice.encPub!);
        const senderSignPriv = await importRsaPssPrivate(bob.signPriv!);
        const env = await encryptMessage(plainBA, recipientPub, senderSignPriv);
        setEnvBA(env);
      }

      setStatus("ok");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function runDecrypt() {
    try {
      setStatus("decrypting");
      setError("");

      if (direction === "A→B") {
        if (!envAB) return;
        const recipientPriv = await importRsaOaepPrivate(bob.encPriv!);
        const senderSignPub = await importRsaPssPublic(alice.signPub!);
        const res = await decryptMessage(envAB, recipientPriv, senderSignPub);
        if (res.ok) setDecAB(res.message || "");
        else {
          setStatus("error");
          setError(res.reason || "Decrypt failed");
          return;
        }
      } else {
        if (!envBA) return;
        const recipientPriv = await importRsaOaepPrivate(alice.encPriv!);
        const senderSignPub = await importRsaPssPublic(bob.signPub!);
        const res = await decryptMessage(envBA, recipientPriv, senderSignPub);
        if (res.ok) setDecBA(res.message || "");
        else {
          setStatus("error");
          setError(res.reason || "Decrypt failed");
          return;
        }
      }

      setStatus("ok");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function activeStep(): Step {
    const env = direction === "A→B" ? envAB : envBA;
    const dec = direction === "A→B" ? decAB : decBA;

    const pubOk = direction === "A→B" ? publishedA : publishedB;
    const fetchOk = direction === "A→B" ? peerFetchedA : peerFetchedB;
    const v = verifyPeerFingerprints();
    const handshakeDone = pubOk && fetchOk && v.ok;

    if (!canRunAB && !canRunBA) return "generate";
    if (!handshakeDone) return "handshake";
    if (!env) return "encrypt";
    if (env && !dec) return "send";
    return "decrypt";
  }

  return {
    alice,
    bob,
    direction,
    setDirection,
    plain: direction === "A→B" ? plainAB : plainBA,
    setPlain: direction === "A→B" ? setPlainAB : setPlainBA,
    envelope: direction === "A→B" ? envAB : envBA,
    decrypted: direction === "A→B" ? decAB : decBA,
    status,
    error,

    canRun: direction === "A→B" ? canRunAB : canRunBA,
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

    attacker,
    setAttacker,
    tamper,
    setTamper,
    reset,
    buildShareUrl,
  };
}
