import Link from "next/link";
import { Gem, ShieldCheck, Fingerprint, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Brand mark — shared by landing, auth pages and the dashboard shell.
 * DESIGN.md §3 (app-shell.tsx).
 *
 * `href={null}` renders a NON-interactive mark: inside the dashboard shell the
 * logo must never navigate away (signing out happens only via the account
 * menu's Sign Out), so the shell passes `href={null}`.
 *
 * `short` drops the "Trade" wordmark — the landing page presents the brand as
 * "Shaqal" only.
 */
export function Brand({ href = "/", className, short = false }: { href?: string | null; className?: string; short?: boolean }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10">
        <Gem className="h-4 w-4 text-gold" />
      </span>
      <span className="font-display text-base font-semibold tracking-tight">
        Shaqal{short ? null : <> <span className="text-gold">Trade</span></>}
      </span>
    </>
  );
  if (href === null) {
    return (
      <div aria-label={short ? "Shaqal" : "Shaqal Trade"} className={cn("flex items-center gap-2.5", className)}>
        {content}
      </div>
    );
  }
  return (
    <Link href={href} aria-label={short ? "Shaqal" : undefined} className={cn("flex items-center gap-2.5", className)}>
      {content}
    </Link>
  );
}

const AUTH_FEATURES = [
  { icon: ShieldCheck, text: "Compliance-gated deal rooms" },
  { icon: Fingerprint, text: "UTID-sealed completions" },
  { icon: Lock, text: "Encrypted document vault" },
];

/**
 * Split-screen auth shell from DESIGN.md §2 (auth.tsx):
 * left brand/hero panel hidden below lg, right form column.
 * Pages pass their own heading + form as children.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between border-r border-border bg-sidebar/70 p-12 lg:flex">
        <Brand />
        <div>
          <h1 className="max-w-md font-display text-4xl font-semibold leading-tight">
            Move gold, minerals and trust through one{" "}
            <span className="text-gold">audited pipeline</span>.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ten linear deal stages, cryptographic transaction IDs and an immutable audit log —
            purpose-built for brokers, buyers and compliance officers.
          </p>
          <div className="mt-10 grid gap-3">
            {AUTH_FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10">
                  <f.icon className="h-4 w-4 text-gold" />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <p className="tnum text-xs text-muted-foreground">
          ISO 27001 · FATF aligned · 4,182 deals settled
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}
