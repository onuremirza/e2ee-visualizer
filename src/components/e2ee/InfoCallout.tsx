"use client";

export function InfoCallout() {
  return (
    <div className="rounded-2xl border p-4 text-sm text-gray-700 dark:text-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950">
      <p className="font-semibold mb-1">E2EE nedir?</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>
          Mesaj içerik anahtarı rastgele üretilir (AES-GCM ile payload
          şifrelenir).
        </li>
        <li>
          Bu anahtar alıcının public anahtarıyla (RSA-OAEP) <em>sarılır</em> ve
          ağdan birlikte gönderilir.
        </li>
        <li>
          Alıcı private anahtarıyla sarmayı açar, imzayı (RSA-PSS) doğrular,
          içeriği çözer.
        </li>
        <li>
          Sunucu mesaj gövdesini <strong>okuyamaz</strong>; anahtarlar uçlarda
          kalır.
        </li>
      </ul>
    </div>
  );
}
