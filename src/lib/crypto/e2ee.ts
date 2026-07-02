export type JwkPair = { publicJwk: JsonWebKey; privateJwk: JsonWebKey };

export type Envelope = {
  alg: "RSA-OAEP" | "AES-GCM";
  iv: string;
  ciphertext: string;
  wrappedKey: string;
  signature: string;
};

const te = new TextEncoder();
const td = new TextDecoder();

export function toBase64Bytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
export function toBase64(buf: ArrayBuffer): string {
  return toBase64Bytes(new Uint8Array(buf));
}
export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function generateRsaOaepKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}
export async function generateRsaPssKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
}
export async function exportKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}
export async function importRsaOaepPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}
export async function importRsaOaepPrivate(
  jwk: JsonWebKey
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}
export async function importRsaPssPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["verify"]
  );
}
export async function importRsaPssPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );
}

async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}
function randomIv(len = 12): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(len));
}

export async function encryptMessage(
  message: string,
  recipientEncPubKey: CryptoKey,
  senderSignPrivKey: CryptoKey
): Promise<Envelope> {
  const ivBytes = randomIv();
  const msgBytes = te.encode(message);
  const msgBuf = toArrayBuffer(msgBytes);
  const aesKey = await generateAesKey();
  const ivBuf = toArrayBuffer(ivBytes);

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBuf },
    aesKey,
    msgBuf
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const wrappedKeyBuf = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientEncPubKey,
    rawAesKey
  );

  const signatureBuf = await crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    senderSignPrivKey,
    ciphertextBuf
  );

  return {
    alg: "RSA-OAEP",

    iv: toBase64Bytes(ivBytes),
    ciphertext: toBase64(ciphertextBuf),
    wrappedKey: toBase64(wrappedKeyBuf),
    signature: toBase64(signatureBuf),
  };
}

export async function decryptMessage(
  envelope: Envelope,
  recipientEncPrivKey: CryptoKey,
  senderSignPubKey: CryptoKey
): Promise<{ ok: boolean; message?: string; reason?: string }> {
  try {
    const { iv, ciphertext, wrappedKey, signature } = envelope;

    const wrappedKeyBytes = fromBase64(wrappedKey);
    const wrappedKeyBuf = toArrayBuffer(wrappedKeyBytes);
    const rawAesKey = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      recipientEncPrivKey,
      wrappedKeyBuf
    );
    const aesKey = await crypto.subtle.importKey(
      "raw",
      rawAesKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const ciphertextBytes = fromBase64(ciphertext);
    const sigBytes = fromBase64(signature);
    const ciphertextAB = toArrayBuffer(ciphertextBytes);
    const sigAB = toArrayBuffer(sigBytes);

    const verified = await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      senderSignPubKey,
      sigAB,
      ciphertextAB
    );
    if (!verified)
      return { ok: false, reason: "Signature verification failed" };

    const ivBytes = fromBase64(iv);
    const ivAB = toArrayBuffer(ivBytes);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivAB },
      aesKey,
      ciphertextAB
    );

    return { ok: true, message: td.decode(plainBuf) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg ?? "Decrypt error" };
  }
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(
    u8.byteOffset,
    u8.byteLength + u8.byteOffset
  ) as ArrayBuffer;
}

function toHex(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, "0");
  return s;
}

async function sha256(data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  return crypto.subtle.digest("SHA-256", toArrayBuffer(bytes));
}

export async function jwkThumbprintRSA(jwk: JsonWebKey): Promise<string> {
  if (jwk.kty !== "RSA" || !jwk.n || !jwk.e) {
    throw new Error("Thumbprint expects RSA public JWK with n/e");
  }
  const canonical = JSON.stringify({ e: jwk.e, kty: "RSA", n: jwk.n });
  const hash = await sha256(new TextEncoder().encode(canonical));
  return toHex(hash);
}
