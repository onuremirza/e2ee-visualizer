# e2ee-visualizer

**İnteraktif uçtan-uca şifreleme (E2EE) görselleştirici.** Alice ↔ Bob arasındaki güvenli mesajlaşma
akışını — anahtar üretimi, handshake (parmak izi doğrulama), simetrik şifreleme, imzalama ve çözme —
tarayıcının **gerçek Web Crypto API**'siyle adım adım canlandıran bir öğretici/demo uygulaması.

Tüm kriptografi istemci tarafında (`"use client"`) çalışır — **backend, sunucu veya gizli değer yoktur**;
hiçbir veri tarayıcıdan çıkmaz.

> ⚠️ **Eğitim amaçlıdır.** Kavramları göstermek için tasarlanmıştır; üretim kriptografi kütüphanesi
> olarak kullanılmamalıdır.

## Kriptografik ilkeler

| Amaç | İlke |
|---|---|
| Anahtar sarma (key wrap) | **RSA-OAEP 2048** — AES oturum anahtarını alıcının public key'iyle sarar |
| Mesaj şifreleme | **AES-GCM 256** — IV + ciphertext + auth tag |
| İmza / doğrulama | **RSA-PSS**, SHA-256, saltLength 32 |
| Parmak izi / handshake | **RFC-7638 JWK thumbprint** — anahtar kimliği & MITM tespiti |

Hepsi tarayıcıda yerleşik Web Crypto ile yapılır; harici kripto bağımlılığı yoktur.

## Özellikler

- **Adım-adım akış:** `Üret → Handshake → Şifrele → Gönder → Doğrula → Çöz`, çift yön (A→B / B→A).
- **Animasyonlu diyagram:** şifreli paketin yolculuğu, adım-senkron vurgulama, "scramble" şifrelenme efekti.
- **Saldırı senaryoları:** pasif ağ dinleme (saldırgan içeriği okuyamaz) + MITM anahtar-değiştirme
  (parmak izi doğrulaması başarısız).
- **Rehberli tur**, dark/light tema, alan açıklama tooltip'leri, paylaşılabilir durum-linki.
- **Erişilebilirlik:** `prefers-reduced-motion`, aria-live durum duyuruları, klavye/odak desteği, responsive.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

Docker ile:

```bash
docker compose up --build
```

## Teknoloji

Next.js 15 (App Router, Turbopack) · TypeScript (strict) · React 19 · Tailwind CSS v4 ·
framer-motion · lucide-react · tarayıcı **Web Crypto API**.

## Proje yapısı

```
src/
  app/                   Next.js App Router (tek rota: /)
  components/
    e2ee/                akış/diyagram/panel bileşenleri
    theme/               tema toggle
    ui/                   tooltip, toast
  hooks/
    useEncryptionFlow.ts adım-bazlı durum makinesi
  lib/
    crypto/e2ee.ts       kripto çekirdeği (Web Crypto sarmalayıcıları)
    sim/directory.ts     simüle anahtar dizini (handshake / parmak izi)
```

Kripto mantığı UI'dan bağımsızdır: görsel katman durum makinesinin `activeStep()` çıktısını **tüketir**,
kriptoyu değiştirmez.

## Lisans / amaç

Kişisel/eğitici demo. Kripto uygulamasını gerçek güvenlik ihtiyaçları için temel almayın.
