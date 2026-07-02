"use client";

import { useId, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Küçük bilgi noktası: üstüne gelince/odaklanınca açıklama gösterir.
 * Şifreli alanların (IV, ciphertext, wrappedKey, signature) ne olduğunu anlatmak için.
 */
export function InfoDot({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`${label} hakkında`}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-grid h-4 w-4 place-items-center rounded-full text-muted transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="surface absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl px-3 py-2 text-[11px] leading-relaxed text-foreground/90 shadow-xl"
        >
          {children}
        </span>
      )}
    </span>
  );
}
