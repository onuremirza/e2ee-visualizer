# CHANGELOG — e2ee-visualizer

Format: [Keep a Changelog](https://keepachangelog.com) · SemVer.

## [Unreleased]
### Eklendi (görsel gelişim)
- **Animasyonlu akış diyagramı** (`FlowDiagram`): gezen şifreli paket, akan SVG hatlar, adım-senkron glow, metin "scramble" şifrelenme efekti, kilit/açma durumu.
- **Tema sistemi:** karanlık/aydınlık toggle (no-FOUC), kripto temalı palet + gradient başlık + grid/ışık arka plan.
- **Etkileşim:** şifreli alanlarda (IV, ciphertext, wrappedKey) bilgi tooltip'leri; rehberli tanıtım turu (ilk ziyaret).
- **Saldırı senaryoları:** pasif ağ dinleme (saldırgan içeriği okuyamaz) ve MITM anahtar-değiştirme (parmak izi doğrulaması başarısız) simülasyonları.
- **Paylaşılabilir demo linki** (durum URL'e serialize), kopyalama toast'ı, sıfırla.
- **Erişilebilirlik/cila:** `prefers-reduced-motion` desteği, aria-live durum duyuruları, odak halkaları, responsive mobil dikey akış.

### Düzeltildi
- **Handshake UX:** A→B yönünde "İndir" artık çalışıyor — peer (Bob) indirme anında dizine otomatik tohumlanıyor; kullanıcının yön değiştirip karşı tarafı elle yayınlaması gerekmiyor (`publishActor` yardımcısı).
- `StepFlow`: 6 adım için `grid-cols-6` (taşma giderildi) ve görünür ilerleme çizgisi; mobilde etiketler sadeleşti (aktif adım başlığı).
- `Toast`: StrictMode çift-bildirim (updater içi yan etki → `useRef` sayaç).
- `FlowDiagram`: kablo hizalaması flex connector'lara taşındı (her breakpoint'te hizalı); boş durum ipucu eklendi.
- `InfoDot`: `aria-describedby` ile erişilebilirlik; hero başlığı `leading` kırpılması.
- Font çakışması: body artık Geist kullanıyor (Arial override kaldırıldı).
- `MethodBadges` çift render'ı giderildi (orphan `EncryptDiagram` kaldırıldı).
- `KeyPanel` indirme dosya adındaki hatalı regex (`\\s` → `\s`).
