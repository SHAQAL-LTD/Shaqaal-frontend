"use client";

import React, { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { AdminPaymentRow, WebhookEventRow } from "@/lib/types";
import { CreditCard, Search, Webhook } from "lucide-react";
import {
  Badge, Card, ErrorNote, FlashNote, KV, Modal, Pager, ReasonInput, Spinner,
  StatusBadge, fmtMoney, fmtTs, selectCls, titleize, useAction,
} from "./ui";

const PAGE_SIZE = 50;

const PAYMENT_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
const WEBHOOK_STATUSES = ["PROCESSED", "FAILED", "REJECTED_SIGNATURE", "REPLAY", "REJECTED"];
const PROVIDERS = ["PAYSTACK", "NOWPAYMENTS"];

/** Manual reconciliation — for when a webhook is confirmed missed. Reason is mandatory. */
function ReconcileModal({
  payment,
  onClose,
  onDone,
}: {
  payment: AdminPaymentRow;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { busy, error, setError, run } = useAction();
  const [status, setStatus] = useState("COMPLETED");
  const [reason, setReason] = useState("");

  async function confirm() {
    if (!reason.trim()) {
      setError("A reason is required — it is written to the audit trail.");
      return;
    }
    const ok = await run(() => api.admin.reconcilePayment(payment.id, status, reason.trim()));
    if (ok) onDone(`Payment ${payment.reference || String(payment.id).slice(0, 8)} → ${titleize(status)}`);
  }

  return (
    <Modal
      title="Reconcile payment"
      subtitle={`${fmtMoney(payment.amount)} · ${payment.reference || payment.txHash || payment.id}`}
      onClose={onClose}
      onConfirm={confirm}
      confirmLabel="Apply status"
      danger={status === "FAILED"}
      busy={busy}
      error={error}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border/60 px-3 py-2">
          <KV k="Current status" v={<StatusBadge status={payment.status} />} />
          <KV k="Deal" v={payment.dealUtid || payment.dealId} />
          <KV k="Payer" v={payment.payerName || "—"} />
          <KV k="Payee" v={payment.payeeName || "—"} />
          <KV k="Method" v={titleize(payment.method)} />
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            New status
          </span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
        </div>
        <ReasonInput
          value={reason}
          onChange={setReason}
          placeholder="e.g. Paystack dashboard shows charge.success received — webhook missed during deploy"
        />
        <p className="text-[11px] text-muted-foreground">
          Marking COMPLETED notifies the payer in-app, exactly as the webhook would have.
        </p>
      </div>
    </Modal>
  );
}

/** Platform-wide transaction feed (Paystack + NOWPayments). */
function Transactions({ onFlash }: { onFlash: (msg: string) => void }) {
  const [draftQ, setDraftQ] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<AdminPaymentRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconcile, setReconcile] = useState<AdminPaymentRow | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .payments({
        status: status || undefined,
        provider: provider || undefined,
        q: q || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then((d) => {
        if (!alive) return;
        setRows(d.content || []);
        setTotal(typeof d.totalElements === "number" ? d.totalElements : null);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(apiErrorMessage(e, "Failed to load payments"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [q, status, provider, page]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-dark-700 bg-dark-800 px-3 py-2 focus-within:border-gold-500">
          <Search size={14} className="shrink-0 text-gray-muted" />
          <input
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(0);
                setQ(draftQ.trim());
              }
            }}
            placeholder="Reference, tx hash, description or id…"
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-neutral-600 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
          className={selectCls + " w-auto"}
        >
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleize(s)}
            </option>
          ))}
        </select>
        <select
          value={provider}
          onChange={(e) => {
            setPage(0);
            setProvider(e.target.value);
          }}
          className={selectCls + " w-auto"}
        >
          <option value="">All providers</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {titleize(p)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading payments…" />
      ) : error ? (
        <ErrorNote message={error} />
      ) : rows.length === 0 ? (
        <div className="py-12 text-center">
          <CreditCard size={26} className="mx-auto text-dark-500" />
          <p className="mt-2 text-[13px] text-gray-muted">No payments match these filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-muted">
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium">Deal</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Method</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Payer → Payee</th>
                  <th className="px-2 py-2 font-medium">Reference</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-border/60 transition hover:bg-white/[0.02]">
                    <td className="px-2 py-2.5 text-[11px] text-dark-500">{fmtTs(p.created_at)}</td>
                    <td className="px-2 py-2.5">
                      <p className="font-medium text-foreground">{p.dealUtid || String(p.dealId).slice(0, 8)}</p>
                      <p className="text-[10px] text-dark-500">{titleize(p.type)}</p>
                    </td>
                    <td className="px-2 py-2.5 font-medium tnum text-foreground">{fmtMoney(p.amount)}</td>
                    <td className="px-2 py-2.5">
                      <Badge tone="muted">{titleize(p.method)}</Badge>
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-2 py-2.5 text-muted-foreground">
                      {p.payerName || "—"} → {p.payeeName || "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-2 py-2.5 font-mono text-[11px] text-dark-500">
                      {p.reference || p.txHash || "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => setReconcile(p)}
                        className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                      >
                        Reconcile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
        </>
      )}

      {reconcile && (
        <ReconcileModal
          payment={reconcile}
          onClose={() => setReconcile(null)}
          onDone={(msg) => {
            setReconcile(null);
            onFlash(msg);
          }}
        />
      )}
    </>
  );
}

/** Inbound webhook events — including failures that used to vanish into logs. */
function WebhookFeed() {
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<WebhookEventRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .webhookEvents({
        status: status || undefined,
        provider: provider || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then((d) => {
        if (!alive) return;
        setRows(d.content || []);
        setTotal(typeof d.totalElements === "number" ? d.totalElements : null);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(apiErrorMessage(e, "Failed to load webhook events"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [status, provider, page]);

  const failureCount = rows.filter(
    (r) => r.status === "FAILED" || r.status === "REJECTED_SIGNATURE",
  ).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
          className={selectCls + " w-auto"}
        >
          <option value="">All event statuses</option>
          {WEBHOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleize(s)}
            </option>
          ))}
        </select>
        <select
          value={provider}
          onChange={(e) => {
            setPage(0);
            setProvider(e.target.value);
          }}
          className={selectCls + " w-auto"}
        >
          <option value="">All providers</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {titleize(p)}
            </option>
          ))}
        </select>
        {!status && (
          <span className="text-[11px] text-gray-muted">
            {failureCount > 0 ? (
              <span className="text-danger">{failureCount} failure(s) on this page</span>
            ) : (
              "No failures on this page"
            )}
          </span>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading webhook events…" />
      ) : error ? (
        <ErrorNote message={error} />
      ) : rows.length === 0 ? (
        <div className="py-12 text-center">
          <Webhook size={26} className="mx-auto text-dark-500" />
          <p className="mt-2 text-[13px] text-gray-muted">No webhook events recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {rows.map((e) => (
              <details key={e.id} className="rounded-xl border border-border/60 bg-dark-800/40 px-4 py-3">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                  <StatusBadge status={e.status} />
                  <Badge tone={e.provider === "PAYSTACK" ? "info" : "warn"}>{titleize(e.provider)}</Badge>
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
                    {e.externalReference || "—"}
                    {e.paymentId ? ` · payment ${String(e.paymentId).slice(0, 8)}` : ""}
                  </span>
                  <span className="text-[10px] text-dark-500">{fmtTs(e.receivedAt)}</span>
                </summary>
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                  {e.errorMessage && (
                    <p className="rounded-lg border border-danger/40 bg-danger/10 p-2 text-[11px] text-danger">
                      {e.errorMessage}
                    </p>
                  )}
                  {e.payload && (
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-dark-900/70 p-2 text-[11px] text-muted-foreground">
                      {e.payload}
                    </pre>
                  )}
                </div>
              </details>
            ))}
          </div>
          <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
        </>
      )}
    </>
  );
}

/** Payments — transactions + webhook events, with audited manual reconciliation. */
export default function PaymentsSection() {
  const [tab, setTab] = useState<"tx" | "hooks">("tx");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Payments</h1>
          <p className="text-[13px] text-gray-muted">
            Paystack + NOWPayments platform-wide — and the webhook events that used to fail silently.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border p-1">
            <button
              onClick={() => setTab("tx")}
              className={
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition " +
                (tab === "tx" ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground")
              }
            >
              <CreditCard size={13} /> Transactions
            </button>
            <button
              onClick={() => setTab("hooks")}
              className={
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition " +
                (tab === "hooks" ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground")
              }
            >
              <Webhook size={13} /> Webhook events
            </button>
          </div>
        </div>
      </div>

      <FlashNote message={flash} />

      <Card>
        {tab === "tx" ? <Transactions onFlash={setFlash} /> : <WebhookFeed />}
      </Card>
    </div>
  );
}
