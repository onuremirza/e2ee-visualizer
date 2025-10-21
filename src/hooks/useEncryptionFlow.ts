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

  async function publishMyKeys() {
    if (direction === "A→B") {
      if (
        !alice.encPub ||
        !alice.signPub ||
        !aliceThumbs.enc ||
        !aliceThumbs.sign
      )
        return;
      publishToDirectory({
        userId: "alice",
        encPub: alice.encPub,
        signPub: alice.signPub,
        encThumbprintHex: aliceThumbs.enc,
        signThumbprintHex: aliceThumbs.sign,
        updatedAt: Date.now(),
      });
      setPublishedA(true);
    } else {
      if (!bob.encPub || !bob.signPub || !bobThumbs.enc || !bobThumbs.sign)
        return;
      publishToDirectory({
        userId: "bob",
        encPub: bob.encPub,
        signPub: bob.signPub,
        encThumbprintHex: bobThumbs.enc,
        signThumbprintHex: bobThumbs.sign,
        updatedAt: Date.now(),
      });
      setPublishedB(true);
    }
  }

  async function fetchPeerKeys() {
    if (direction === "A→B") {
      const rec = fetchFromDirectory("bob");
      if (rec) setPeerFetchedA(true);
    } else {
      const rec = fetchFromDirectory("alice");
      if (rec) setPeerFetchedB(true);
    }
  }

  function verifyPeerFingerprints(): { ok: boolean; reason?: string } {
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
  };
}
