# 🔐 Next.js E2EE Visualizer

E2EE Visualizer is a **visual and interactive demonstration** of how **End‑to‑End Encryption (E2EE)** works in modern web applications.  
It runs **entirely client‑side** using the **Web Crypto API** and is built with **Next.js 15 (App Router)**, **TypeScript**, and **Framer Motion**.

> ✨ Goal: To help developers and learners clearly understand every stage of secure communication — from key generation to encryption, transmission, decryption, and signature verification.

---

## 🚀 Features

- 🔑 **RSA‑OAEP (2048‑bit)** for AES key wrapping
- ✍️ **RSA‑PSS (SHA‑256)** for signing and verifying ciphertexts
- 🔒 **AES‑GCM (256‑bit)** for message encryption
- 🤝 **Handshake simulation** (key publishing, fingerprint validation)
- 📡 **Network visualization**: ciphertext, IV, wrapped key, signature
- 🔁 **Bidirectional communication** — Alice ↔ Bob
- 🧩 **Stepper flow**: Generate → Handshake → Encrypt → Send → Verify → Decrypt
- 🌗 **Light/Dark themes** + **Framer Motion** animations
- 🧠 Clean, modular architecture with separated logic (crypto / UI / hooks)

---

## 🧱 Project Structure

```
src/
├─ app/
│  └─ e2ee-visualizer/
│     ├─ page.tsx
│     ├─ components/
│     │  ├─ EncryptDiagram.tsx
│     │  ├─ KeyPanel.tsx
│     │  ├─ StatusBar.tsx
│     │  ├─ StepFlow.tsx
│     │  ├─ HandshakePanel.tsx
│     │  ├─ RoleSwitch.tsx
│     │  ├─ ControlsBar.tsx
│     │  ├─ MethodBadges.tsx
│     │  ├─ Legend.tsx
│     │  └─ InfoCallout.tsx
│     └─ hooks/
│        └─ useEncryptionFlow.ts
│
├─ lib/
│  ├─ crypto/
│  │  └─ e2ee.ts         # AES‑GCM + RSA‑OAEP + RSA‑PSS logic
│  └─ sim/
│     └─ directory.ts    # Simulated key directory (publish/fetch)
│
└─ styles/ (optional)
```

---

## 🧩 Setup

### 1. Clone & install

```bash
git clone https://github.com/onuremirza/e2ee-visualizer.git
cd e2ee-visualizer
pnpm install
# or npm/yarn install
```

### 2. Run locally

```bash
pnpm dev
# or npm run dev
```

Then open **http://localhost:3000/e2ee-visualizer**

---

## 🐳 Run with Docker

A `docker-compose.yml` is included:

```bash
docker compose up --build
```

> This builds and runs the app inside a container, exposing port **80** → **3000**.

---

## 🧠 How It Works

1. **Generate Keys:** Each actor (Alice & Bob) generates RSA‑OAEP (encryption) and RSA‑PSS (signature) key pairs.
2. **Handshake:** Each publishes public keys to a simulated directory and verifies peer fingerprints (RFC‑7638 style).
3. **Encrypt:** Alice encrypts a message using AES‑GCM, wraps the AES key with Bob’s RSA‑OAEP key, and signs ciphertext with RSA‑PSS.
4. **Send:** The ciphertext, IV, wrapped key, and signature are “sent” through the visual network layer.
5. **Decrypt & Verify:** Bob unwraps the AES key, verifies the RSA‑PSS signature, and decrypts the message.
6. **Reverse:** The same process can occur in reverse (Bob → Alice).

---

## 🧩 Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Web Crypto API** (native browser cryptography)
- **Framer Motion** for animations
- **Tailwind CSS** + optional **shadcn/ui**
- **ESLint + TypeScript strict**

---

## 🛡️ Disclaimer

This project is intended for **educational and visualization purposes only**.  
It does not perform secure key exchange or persistent storage.  
Do not use it as-is in production systems.

---

## 📜 License

MIT © 2025 Onur Emirza
