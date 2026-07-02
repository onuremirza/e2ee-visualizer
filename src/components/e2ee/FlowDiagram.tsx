"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Lock,
  Unlock,
  Send,
  ServerCog,
  ShieldAlert,
  KeyRound,
  FileText,
} from "lucide-react";
import type { Envelope } from "@/lib/crypto/e2ee";
import type { StepKey } from "./StepFlow";
import { ScrambleText } from "./ScrambleText";
import { InfoDot } from "@/components/ui/InfoDot";

type EnvelopeLite = Pick<
  Envelope,
  "iv" | "ciphertext" | "wrappedKey" | "signature"
>;

export function FlowDiagram({
  plain,
  envelope,
  decrypted,
  direction = "A→B",
  step,
  attacker = false,
}: {
  plain: string;
  envelope?: EnvelopeLite | null;
  decrypted?: string;
  direction?: "A→B" | "B→A";
  step: StepKey;
  attacker?: boolean;
}) {
  const reduce = useReducedMotion();
  const left = direction === "A→B" ? "Alice" : "Bob";
  const right = direction === "A→B" ? "Bob" : "Alice";

  const encrypted = Boolean(envelope);
  const sending = step === "encrypt" || step === "send";
  const receiving = step === "verify" || step === "decrypt";

  return (
    <div className="surface relative overflow-hidden rounded-3xl p-5 sm:p-7">
      {/* başlık şeridi */}
      <div className="mb-5 flex items-center justify-center gap-2 text-xs text-muted">
        <span className="font-medium text-foreground">{left}</span>
        <Arrow reduce={reduce} />
        <span className="rounded-full border border-panel-border px-2 py-0.5">
          ağ
        </span>
        <Arrow reduce={reduce} delay={0.3} />
        <span className="font-medium text-foreground">{right}</span>
      </div>

      {/* boş durum ipucu */}
      {!encrypted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center text-[11px] text-muted"
        >
          Bir mesaj yazıp <span className="text-accent">“Şifrele”</span>’ye
          basın — paketin ağdan geçişini canlı izleyin.
        </motion.p>
      )}

      {/* düğümler + aralarındaki akan connector'lar (flex → hizalama garantili) */}
      <div className="flex flex-col items-stretch md:flex-row md:items-center">
        <Node
          className="md:flex-1"
          active={step === "encrypt"}
          icon={<Send className="h-4 w-4" />}
          title={`${left} · Gönderici`}
          tone="accent"
        >
          <Field label="Düz metin" icon={<FileText className="h-3.5 w-3.5" />}>
            <span className="text-foreground/90">{plain || "—"}</span>
          </Field>
          <div className="mt-2 text-[11px] text-muted">
            AES-GCM anahtarı üretilir, içerik şifrelenir; anahtar alıcının
            RSA-OAEP public anahtarıyla sarılır.
          </div>
        </Node>

        <Connector active={sending} color="var(--accent-3)" reduce={reduce} />

        <Node
          className="md:flex-1"
          active={sending || receiving}
          icon={<ServerCog className="h-4 w-4" />}
          title="Ağ / Sunucu"
          tone={attacker ? "danger" : "cyan"}
        >
          <Field
            label="Ciphertext"
            info="AES-GCM ile şifrelenmiş mesaj gövdesi. Anahtar olmadan okunamaz."
          >
            <ScrambleText
              text={envelope?.ciphertext?.slice(0, 44) || "—"}
              encrypted={encrypted}
              className="line-clamp-2 break-all text-foreground/80"
            />
          </Field>
          <Field
            label="IV"
            info="Initialization Vector — AES-GCM için her mesajda benzersiz, gizli değil."
          >
            <span className="line-clamp-1 break-all font-mono text-muted">
              {envelope?.iv || "—"}
            </span>
          </Field>
          <Field
            label="Sarılı AES anahtarı"
            icon={<KeyRound className="h-3.5 w-3.5" />}
            info="İçerik anahtarının RSA-OAEP ile sarılmış hâli. Yalnız alıcı açabilir."
          >
            <span className="line-clamp-1 break-all font-mono text-muted">
              {envelope?.wrappedKey?.slice(0, 36) || "—"}
            </span>
          </Field>

          {attacker && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-start gap-2 rounded-lg border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-2 py-1.5 text-[11px] text-foreground/90"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
              <span>
                <b>Saldırgan</b> paketi görüyor ama içeriği <b>okuyamıyor</b> —
                yalnız şifreli baytlar. E2EE’nin değeri tam burada.
              </span>
            </motion.div>
          )}
        </Node>

        <Connector active={receiving} color="var(--accent-2)" reduce={reduce} />

        <Node
          className="md:flex-1"
          active={step === "decrypt" || step === "verify"}
          icon={
            decrypted ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )
          }
          title={`${right} · Alıcı`}
          tone="indigo"
        >
          <Field label="Çözülmüş metin">
            <AnimatePresence mode="wait">
              <motion.span
                key={decrypted || "empty"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={decrypted ? "font-medium text-accent" : "text-muted"}
              >
                {decrypted || "—"}
              </motion.span>
            </AnimatePresence>
          </Field>
          <div className="mt-2 text-[11px] text-muted">
            Private anahtarla sarma açılır, RSA-PSS imzası doğrulanır, içerik
            çözülür.
          </div>
        </Node>
      </div>
    </div>
  );
}

/** Kartlar arasındaki akan hat + gezen şifreli paket. Connector kartlar
 *  arasında yaşadığı için uçlar her zaman kart kenarına hizalı kalır. */
function Connector({
  active,
  color,
  reduce,
}: {
  active: boolean;
  color: string;
  reduce: boolean | null;
}) {
  return (
    <div className="relative flex shrink-0 items-center justify-center self-center py-1 md:w-12 md:py-0 lg:w-16">
      {/* masaüstü: yatay */}
      <div className="relative hidden h-8 w-full md:block">
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            className="animate-dash"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
        {active && (
          <motion.div
            className="absolute top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md glow-accent"
            style={{ background: color }}
            initial={{ left: "0%", opacity: 0 }}
            animate={
              reduce
                ? { left: "50%", opacity: 1 }
                : { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }
            }
            transition={
              reduce
                ? { duration: 0.2 }
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Lock className="h-3 w-3 text-[#04110b]" />
          </motion.div>
        )}
      </div>

      {/* mobil: dikey */}
      <div className="relative h-7 w-8 md:hidden">
        <svg className="absolute inset-0 h-full w-full">
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            className="animate-dash"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
        {active && (
          <motion.div
            className="absolute left-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md glow-accent"
            style={{ background: color }}
            initial={{ top: "0%", opacity: 0 }}
            animate={
              reduce
                ? { top: "50%", opacity: 1 }
                : { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }
            }
            transition={
              reduce
                ? { duration: 0.2 }
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Lock className="h-2.5 w-2.5 text-[#04110b]" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Arrow({ reduce, delay = 0 }: { reduce: boolean | null; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      animate={reduce ? {} : { x: [0, 4, 0] }}
      transition={{ repeat: Infinity, duration: 1.6, delay }}
    >
      →
    </motion.span>
  );
}

function Node({
  title,
  icon,
  active,
  tone,
  className = "",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  tone: "accent" | "cyan" | "indigo" | "danger";
  className?: string;
  children: React.ReactNode;
}) {
  const ring =
    tone === "danger"
      ? "var(--danger)"
      : tone === "cyan"
      ? "var(--accent-3)"
      : tone === "indigo"
      ? "var(--accent-2)"
      : "var(--accent)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative min-w-0 rounded-2xl border border-panel-border bg-panel/60 p-4 transition-shadow ${className}`}
      style={
        active
          ? { boxShadow: `0 0 0 1px ${ring}, 0 0 28px -6px ${ring}`, borderColor: ring }
          : undefined
      }
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span style={{ color: ring }}>{icon}</span>
        {title}
        {active && (
          <span
            className="ml-auto h-2 w-2 animate-pulse-glow rounded-full"
            style={{ background: ring }}
          />
        )}
      </div>
      <div className="mt-3 space-y-2 text-xs">{children}</div>
    </motion.div>
  );
}

function Field({
  label,
  icon,
  info,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  info?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
        {icon}
        {label}
        {info && <InfoDot label={label}>{info}</InfoDot>}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
