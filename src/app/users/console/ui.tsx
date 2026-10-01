"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Layout ──────────────────────────────────────────────────────────

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-panel rounded-2xl p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-dark-700/60 pb-3">
          <div className="min-w-0">
            {title && <h3 className="text-[14px] font-semibold">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12px] text-gray-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "warn";
}) {
  const toneCls = {
    neutral: "text-white",
    success: "text-success",
    danger: "text-danger",
    warn: "text-gold-bright",
  }[tone];
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tnum", toneCls)}>{value}</p>
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────

type Tone = "gold" | "success" | "danger" | "warn" | "muted" | "info";

const TONES: Record<Tone, string> = {
  gold: "bg-gold/10 text-gold-bright border-gold/40",
  success: "bg-success/10 text-success border-success/40",
  danger: "bg-danger/10 text-danger border-danger/40",
  warn: "bg-chart-1/10 text-chart-1 border-chart-1/40",
  info: "bg-chart-2/10 text-chart-2 border-chart-2/40",
  muted: "bg-secondary text-muted-foreground border-border",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold", TONES[tone])}>
      {children}
    </span>
  );
}

/** Map a raw backend status (SCREAMING_SNAKE or lower) to title text + tone. */
export function statusBadge(raw?: string | null): { label: string; tone: Tone } {
  const s = (raw || "unknown").toUpperCase();
  const label = s.replace(/_/g, " ").toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  const tone: Tone =
    ["COMPLETED", "APPROVED", "PAID", "VERIFIED", "PROCESSED", "SENT", "UP", "ACTIVE", "LOCKED"].includes(s) ? "success"
    : ["FAILED", "REJECTED", "REJECTED_SIGNATURE", "DOWN", "REJECTED_KYC"].includes(s) ? "danger"
    : ["PENDING", "PROCESSING", "UNDER_REVIEW", "PENDING_REVIEW", "INFO_REQUESTED", "REPLAY", "DEGRADED", "UNLOCKED"].includes(s) ? "warn"
    : "muted";
  return { label, tone };
}

export function StatusBadge({ status }: { status?: string | null }) {
  const { label, tone } = statusBadge(status);
  return <Badge tone={tone}>{label}</Badge>;
}

// ─── Form bits ───────────────────────────────────────────────────────

export const inputCls =
  "w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-[13px] text-white placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none transition";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-gray-muted">{hint}</span>}
    </label>
  );
}

// ─── Modal (portal — immune to transformed ancestors) ────────────────

export function Modal({
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
  error,
  size = "md",
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  size?: "md" | "lg";
  children?: React.ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={busy ? undefined : onClose} />
      <div className={"relative max-h-[85vh] w-full overflow-y-auto rounded-2xl border border-border bg-popover/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl animate-scale-in " + (size === "lg" ? "max-w-3xl" : "max-w-md")}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>

        {children && <div className="space-y-4">{children}</div>}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
            <AlertCircle size={14} className="shrink-0 text-danger" />
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {(onConfirm || true) && (
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-border px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-secondary/60 disabled:opacity-50"
            >
              Cancel
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={busy}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition disabled:opacity-50",
                  danger
                    ? "bg-danger text-white hover:bg-danger/90"
                    : "bg-gradient-to-b from-gold-bright to-gold text-dark-950 hover:brightness-105",
                )}
              >
                {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Textarea for the mandatory audit reason, shared by every mutating modal. */
export function ReasonInput({
  value,
  onChange,
  placeholder = "Why is this action being taken?",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label="Reason (required — written to the audit trail)">
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "resize-none")}
      />
    </Field>
  );
}

/** Small helper: local state for a modal-driven action with busy + error handling. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, setError, run };
}

// ─── Formatting ──────────────────────────────────────────────────────

export function fmtTs(raw?: string | number | null): string {
  if (raw == null) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtMoney(v?: string | number | null): string {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function titleize(v?: string | null): string {
  if (!v) return "—";
  return v.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/(^|\s)(\p{L})/gu, (_m, s: string, c: string) => s + c.toUpperCase());
}

/** A compact row for detail lists inside modals/drawers. */
export function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[12px]">
      <span className="shrink-0 text-gray-muted">{k}</span>
      <span className="min-w-0 truncate text-right font-medium text-foreground">{v}</span>
    </div>
  );
}

// ─── Shared domain maps ─────────────────────────────────────────────

/** Human labels for the 10-stage deal pipeline (overview + deals). */
export const STAGE_LABELS: Record<string, string> = {
  STAGE_01_REGISTRATION: "Registration",
  STAGE_02_BROKER_ASSIGNMENT: "Broker",
  STAGE_03_BUYER_REGISTRATION: "Buyer",
  STAGE_04_SPA_SIGNATURE: "SPA",
  STAGE_05_PROOF_OF_FUNDS: "Proof of Funds",
  STAGE_06_ADVANCE_PAYMENT: "Payment",
  STAGE_07_ORIGIN_LOGISTICS: "Logistics",
  STAGE_08_SHIPPING: "Shipping",
  STAGE_09_DESTINATION_CLEARANCE: "Clearance",
  STAGE_10_SETTLEMENT: "Settlement",
};

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));

// ─── Feedback + paging ──────────────────────────────────────────────

/** Use for any <select> — matches {@link inputCls}. */
export const selectCls = inputCls;

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      <p className="text-[12px] text-gray-muted">{label}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
      <AlertCircle size={14} className="shrink-0 text-danger" />
      <p className="text-[12px] text-danger">{message}</p>
    </div>
  );
}

/** Success flash after a mutating action lands. */
export function FlashNote({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3">
      <AlertCircle size={14} className="shrink-0 text-success" />
      <p className="text-[12px] text-success">{message}</p>
    </div>
  );
}

/** Prev/Next pager for server-paged feeds (total optional — Next hides when short page). */
export function Pager({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total?: number | null;
  onPage: (p: number) => void;
}) {
  const totalPages = total != null ? Math.max(1, Math.ceil(total / size)) : null;
  const atEnd = totalPages != null ? page + 1 >= totalPages : null;
  return (
    <div className="flex items-center justify-between gap-3 pt-3">
      <span className="text-[11px] text-gray-muted">
        Page {page + 1}
        {totalPages != null ? ` of ${totalPages}` : atEnd ? "" : " +"}
      </span>
      <div className="flex gap-2">
        <button className={cn(btnGhost, "disabled:opacity-40")} disabled={page === 0} onClick={() => onPage(page - 1)}>
          Prev
        </button>
        <button
          className={cn(btnGhost, "disabled:opacity-40")}
          disabled={atEnd === true}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const btnGhost =
  "rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground";

export const btnGold =
  "rounded-xl bg-gradient-to-b from-gold-bright to-gold px-4 py-2 text-[13px] font-semibold text-dark-950 transition hover:brightness-105";

export const btnDanger =
  "rounded-xl bg-danger px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-danger/90";
