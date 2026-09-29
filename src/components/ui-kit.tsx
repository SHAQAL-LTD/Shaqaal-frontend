import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("glass rounded-2xl p-5 shadow-2xl shadow-black/40", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

type Tone = "gold" | "green" | "red" | "muted";

const toneMap: Record<Tone, string> = {
  gold: "border-gold/40 bg-gold/10 text-gold-bright",
  green: "border-success/40 bg-success/10 text-success",
  red: "border-danger/40 bg-danger/10 text-danger",
  muted: "border-border bg-secondary text-muted-foreground",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneMap[tone],
      )}
    >
      {children}
    </span>
  );
}

export function GoldButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:text-gold-bright",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/60 focus:ring-2 focus:ring-gold/20";

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="tnum mt-2 font-display text-2xl font-semibold text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gold">{sub}</p> : null}
    </Card>
  );
}
