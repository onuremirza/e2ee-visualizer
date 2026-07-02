import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E2EE Visualizer | Onur Emirza",
  description:
    "Uçtan uca şifrelemeyi (E2EE) canlı izleyin: AES-GCM içerik şifreleme, RSA-OAEP anahtar sarma ve RSA-PSS imza akışı — gerçek Web Crypto ile.",
  openGraph: {
    title: "E2EE Visualizer",
    description:
      "Uçtan uca şifrelemeyi canlı izleyin — AES-GCM · RSA-OAEP · RSA-PSS.",
    type: "website",
  },
};

// FOUC önleyici: boyamadan önce temayı uygula (localStorage > sistem tercihi)
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
