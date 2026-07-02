"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEF0123456789+/=αβγδλΣΩ#@$%&";

/**
 * Metni "şifreleniyormuş" gibi gösterir: encrypted=true iken karakterler
 * rastgele glifler arasında akar ve sabitlenir. encrypted=false iken düz metin.
 */
export function ScrambleText({
  text,
  encrypted,
  className = "",
}: {
  text: string;
  encrypted: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const raf = useRef<number | null>(null);

  // Görüntülenen metni prop'lara göre senkronlar / animasyonu sürer;
  // effect içindeki setDisplay kasıtlıdır (RAF animasyon + prop-sync).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!encrypted) {
      setDisplay(text);
      return;
    }
    if (reduce) {
      // hareketsiz: tek seferde sabit bir karışık dizi
      setDisplay(
        Array.from(text)
          .map((c, i) => (c === " " ? " " : GLYPHS[(i * 7) % GLYPHS.length]))
          .join("")
      );
      return;
    }

    const target = Array.from(text);
    let tick = 0;
    const totalTicks = 28;

    const step = () => {
      tick += 1;
      const progress = tick / totalTicks;
      setDisplay(
        target
          .map((c, i) => {
            if (c === " ") return " ";
            // ilerledikçe daha çok karakter "kilitlenir" (deterministik glif)
            const locked = i / target.length < progress;
            const g =
              GLYPHS[(i * 13 + frame.current * 7) % GLYPHS.length];
            return locked ? g : GLYPHS[(i + frame.current) % GLYPHS.length];
          })
          .join("")
      );
      frame.current += 1;
      if (tick < totalTicks) {
        raf.current = requestAnimationFrame(step);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [text, encrypted, reduce]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <span className={`font-mono ${className}`} aria-hidden={encrypted}>
      {display || "—"}
    </span>
  );
}
