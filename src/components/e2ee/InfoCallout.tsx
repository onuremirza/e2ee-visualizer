"use client";
import { Info } from "lucide-react";

export function InfoCallout() {
  return (
    <div className="surface rounded-2xl p-5 text-sm text-foreground/90">
      <p className="mb-2 inline-flex items-center gap-2 font-semibold">
        <Info className="h-4 w-4 text-accent" /> E2EE nedir?
      </p>
      <ul className="ml-1 space-y-1.5">
        {[
          "Mesaj içerik anahtarı rastgele üretilir (AES-GCM ile payload şifrelenir).",
          "Bu anahtar alıcının public anahtarıyla (RSA-OAEP) sarılır ve ağdan birlikte gönderilir.",
          "Alıcı private anahtarıyla sarmayı açar, imzayı (RSA-PSS) doğrular, içeriği çözer.",
          "Sunucu mesaj gövdesini okuyamaz; anahtarlar uçlarda kalır.",
        ].map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span dangerouslySetInnerHTML={{ __html: t }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
