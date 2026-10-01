"use client";

import React, { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { AdminDealRow, DealBlockers } from "@/lib/types";
import {
  AlertTriangle, CheckCircle2, FileText, RefreshCw, Search, XCircle,
} from "lucide-react";
import {
  Badge, Card, ErrorNote, FlashNote, KV, Modal, Pager, ReasonInput, Spinner,
  STAGE_LABELS, STAGE_OPTIONS, fmtMoney, fmtTs, selectCls, titleize, useAction,
} from "./ui";

const PAGE_SIZE = 50;

interface Filters {
  stage: string;
  status: string;
  mineral: string;
  country: string;
  q: string;
}

const EMPTY: Filters = { stage: "", status: "", mineral: "", country: "", q: "" };

/**
 * "Why is this deal stuck?" inspector: dry-runs every stage gate (missing document,
 * compliance, payments, parties) and offers the audited force-advance with a mandatory
 * reason that lands in the deal's stage notes + audit trail.
 */
function DealInspector({
  deal,
  onClose,
  onDone,
}: {
  deal: AdminDealRow;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { busy, error, setError, run } = useAction();
  const [info, setInfo] = useState<DealBlockers | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let alive = true;
    api.admin
      .dealBlockers(deal.id)
      .then((d) => {
        if (alive) setInfo(d);
      })
      .catch((e) => {
        if (alive) setLoadErr(apiErrorMessage(e, "Failed to analyse deal"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [deal.id]);

  async function forceAdvance() {
    if (!reason.trim()) {
      setError("A reason is required — it is written to the deal audit trail.");
      return;
    }
    const ok = await run(() => api.admin.forceAdvance(deal.id, reason.trim()));
    if (ok) onDone(`Deal ${deal.utid || deal.id} force-advanced one stage`);
  }

  const blockers = info?.blockers || [];
  const payments = info?.payments;
  const isCompleted = !!info?.completed;
  const docs = info?.documents || [];

  return (
    <Modal
      title={`Inspect deal ${deal.utid || String(deal.id).slice(0, 8)}`}
      subtitle={`${STAGE_LABELS[info?.stage ?? ""] || titleize(info?.stage) || titleize(deal.stage)} · ${deal.mineral || "—"} · ${deal.origin || "—"} → ${deal.destination || "—"}`}
      onClose={onClose}
      size="lg"
      onConfirm={isCompleted || !info ? undefined : forceAdvance}
      confirmLabel="Force advance"
      danger
      busy={busy}
      error={error}
    >
      {loading ? (
        <Spinner label="Running stage-gate analysis…" />
      ) : loadErr ? (
        <ErrorNote message={loadErr} />
      ) : (
        <div className="space-y-4">
          {/* Gate verdict */}
          <div className="space-y-2">
            {blockers.length === 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3">
                <CheckCircle2 size={15} className="shrink-0 text-success" />
                <p className="text-[12px] text-success">No blocking gates — this deal can advance normally.</p>
              </div>
            )}
            {blockers.map((b, i) => (
              <div
                key={i}
                className={
                  "flex items-start gap-2 rounded-xl border p-3 " +
                  (b.ok ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10")
                }
              >
                {b.ok ? (
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <XCircle size={15} className="mt-0.5 shrink-0 text-danger" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {titleize(b.gate)}
                  </p>
                  <p className={"text-[12px] " + (b.ok ? "text-success" : "text-danger")}>{b.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Context snapshot */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 px-3 py-2">
              <KV k="Stage" v={STAGE_LABELS[info?.stage ?? ""] || titleize(info?.stage)} />
              <KV k="Completed" v={isCompleted ? "Yes" : "No"} />
              <KV k="Parties" v={(info?.partyRoles || []).map(titleize).join(", ") || "—"} />
              <KV k="Documents" v={String(docs.length)} />
            </div>
            <div className="rounded-xl border border-border/60 px-3 py-2">
              <KV k="Payments completed" v={String(payments?.completedCount ?? 0)} />
              <KV k="Payments failed" v={String(payments?.failedCount ?? 0)} />
              <KV k="Payments pending" v={String(payments?.pendingCount ?? 0)} />
              <KV k="Price" v={fmtMoney(deal.price)} />
            </div>
          </div>

          {docs.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-muted">Documents on file</p>
              <div className="flex flex-wrap gap-1.5">
                {docs.map((d, i) => (
                  <Badge key={i} tone="muted">
                    {titleize(d.type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Force advance */}
          {isCompleted ? (
            <div className="rounded-xl border border-border/60 bg-dark-800/50 p-3 text-[12px] text-muted-foreground">
              This deal is already completed — nothing to advance.
            </div>
          ) : (
            <div className="rounded-xl border border-danger/40 bg-danger/5 p-4">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-danger">
                <AlertTriangle size={14} /> Force advance — bypasses every gate above
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Advances exactly one stage.                The reason is written to the deal&apos;s stage notes
                and to the audit trail under your identity.
              </p>
              <div className="mt-3">
                <ReasonInput
                  value={reason}
                  onChange={setReason}
                  placeholder="e.g. Off-chain SPA countersigned — paper copy verified by legal"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/** Deals — every deal platform-wide, filterable, with blocker analysis + force advance. */
export default function DealsSection() {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<AdminDealRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [inspect, setInspect] = useState<AdminDealRow | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .deals({
        stage: filters.stage || undefined,
        status: filters.status || undefined,
        mineral: filters.mineral || undefined,
        country: filters.country || undefined,
        q: filters.q || undefined,
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
        if (alive) setError(apiErrorMessage(e, "Failed to load deals"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [filters, page, reloadKey]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  const apply = () => {
    setPage(0);
    setFilters({ ...draft });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Deals</h1>
          <p className="text-[13px] text-gray-muted">
            Every deal across all organizations — inspect blockers and force-advance with an audit reason.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <FlashNote message={flash} />

      <Card>
        {/* Filters */}
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select
            value={draft.stage}
            onChange={(e) => setDraft({ ...draft, stage: e.target.value })}
            className={selectCls}
          >
            <option value="">All stages</option>
            {STAGE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            className={selectCls}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <input
            value={draft.mineral}
            onChange={(e) => setDraft({ ...draft, mineral: e.target.value })}
            placeholder="Mineral…"
            className={selectCls}
          />
          <input
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            placeholder="Country…"
            className={selectCls}
          />
          <input
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="UTID or deal id…"
            className={selectCls}
          />
          <button
            onClick={apply}
            className="flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-[13px] font-semibold text-dark-950 transition hover:bg-gold-400"
          >
            <Search size={14} /> Apply filters
          </button>
        </div>

        {loading ? (
          <Spinner label="Loading deals…" />
        ) : error ? (
          <ErrorNote message={error} />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={26} className="mx-auto text-dark-500" />
            <p className="mt-2 text-[13px] text-gray-muted">No deals match these filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-muted">
                    <th className="px-2 py-2 font-medium">Deal</th>
                    <th className="px-2 py-2 font-medium">Route</th>
                    <th className="px-2 py-2 font-medium">Stage</th>
                    <th className="px-2 py-2 font-medium">Price</th>
                    <th className="px-2 py-2 font-medium">Creator</th>
                    <th className="px-2 py-2 font-medium">Docs</th>
                    <th className="px-2 py-2 font-medium">Paid</th>
                    <th className="px-2 py-2 font-medium">Updated</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id} className="border-t border-border/60 transition hover:bg-white/[0.02]">
                      <td className="px-2 py-2.5">
                        <p className="font-semibold text-foreground">{d.utid || String(d.id).slice(0, 8)}</p>
                        <p className="text-[10px] text-dark-500">{d.mineral || "—"}</p>
                      </td>
                      <td className="px-2 py-2.5 text-muted-foreground">
                        {d.origin || "—"} → {d.destination || "—"}
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge tone={d.completed ? "success" : "gold"}>
                          {d.completed ? "Completed" : STAGE_LABELS[d.stage] || titleize(d.stage)}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 tnum text-muted-foreground">{fmtMoney(d.price)}</td>
                      <td className="px-2 py-2.5">
                        <p className="truncate text-muted-foreground">{d.creator_name || "—"}</p>
                        <p className="truncate text-[10px] text-dark-500">{d.creator_email || ""}</p>
                      </td>
                      <td className="px-2 py-2.5 tnum text-muted-foreground">{d.document_count ?? 0}</td>
                      <td className="px-2 py-2.5 tnum text-muted-foreground">{d.completed_payments ?? 0}</td>
                      <td className="px-2 py-2.5 text-[11px] text-dark-500">{fmtTs(d.updated_at)}</td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => setInspect(d)}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                        >
                          Inspect
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
      </Card>

      {inspect && (
        <DealInspector
          deal={inspect}
          onClose={() => setInspect(null)}
          onDone={(msg) => {
            setInspect(null);
            setFlash(msg);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
