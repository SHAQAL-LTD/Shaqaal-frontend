"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KycQueueRow } from "@/lib/types";
import { CheckCircle2, RefreshCw, Scale, ShieldAlert } from "lucide-react";
import {
  Badge, Card, ErrorNote, FlashNote, Modal, Pager, ReasonInput, Spinner, StatusBadge,
  selectCls, titleize,
} from "./ui";

const PAGE_SIZE = 50;

/** Statuses the compliance service will still accept a decision on. */
const DECIDABLE = new Set(["PENDING", "UNDER_REVIEW", "INFO_REQUESTED"]);

const RISK_TONES: Record<string, "danger" | "warn" | "success"> = {
  HIGH: "danger",
  MEDIUM: "warn",
  LOW: "success",
};

type Decision = "APPROVE" | "REJECT" | "REQUEST_INFO";

/** Bulk approve/reject/request-info — note mandatory for REJECT and REQUEST_INFO. */
function BulkDecideModal({
  ids,
  onClose,
  onDone,
}: {
  ids: string[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>("APPROVE");
  const [note, setNote] = useState("");

  const noteRequired = decision !== "APPROVE";

  async function confirm() {
    if (noteRequired && !note.trim()) {
      setError("A note is required for this decision — it is written to the audit trail.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const out = await api.admin.kycBulkDecide(ids, decision, note.trim());
      const processed = out?.processed ?? 0;
      const errors = out?.errors ?? [];
      const verb = decision === "APPROVE" ? "approved" : decision === "REJECT" ? "rejected" : "flagged for info";
      let msg = `${processed} submission(s) ${verb}`;
      if (errors.length > 0) {
        msg += ` · ${errors.length} failed — ${errors[0].error || "unknown error"}`;
      }
      onDone(msg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk decision failed");
    } finally {
      setBusy(false);
    }
  }

  const OPTIONS: { value: Decision; label: string; danger?: boolean }[] = [
    { value: "APPROVE", label: "Approve" },
    { value: "REJECT", label: "Reject", danger: true },
    { value: "REQUEST_INFO", label: "Request info" },
  ];

  return (
    <Modal
      title={`Bulk decision on ${ids.length} submission(s)`}
      subtitle="Same transitions, notifications and audit rows as the compliance officer queue — you are the acting reviewer."
      onClose={onClose}
      onConfirm={confirm}
      confirmLabel={`Confirm ${titleize(decision)}`}
      danger={decision === "REJECT"}
      busy={busy}
      error={error}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setDecision(o.value);
                setError(null);
              }}
              className={
                "rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition " +
                (decision === o.value
                  ? o.danger
                    ? "border-danger/60 bg-danger/15 text-danger"
                    : "border-gold/60 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        <ReasonInput
          value={note}
          onChange={setNote}
          placeholder={
            decision === "APPROVE"
              ? "Note (optional) — e.g. escalated approval, documents verified offline"
              : "Note (required) — e.g. passport image illegible, please re-upload"
          }
        />
      </div>
    </Modal>
  );
}

/** Compliance/KYC — the officer queue mirrored for admin escalations, with bulk actions. */
export default function KycSection() {
  const [status, setStatus] = useState("");
  const [minAgeHours, setMinAgeHours] = useState("");
  const [risk, setRisk] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<KycQueueRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api.admin
      .kycQueue({
        status: status || undefined,
        minAgeHours: minAgeHours || undefined,
        risk: risk || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then((d) => {
        if (!alive) return;
        setRows(d.content || []);
        setTotal(typeof d.totalElements === "number" ? d.totalElements : null);
        setSelected(new Set());
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load KYC queue");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [status, minAgeHours, risk, page, reloadKey]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 8000);
    return () => clearTimeout(t);
  }, [flash]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectableIds = rows.filter((r) => DECIDABLE.has(r.status)).map((r) => String(r.id));
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Compliance / KYC</h2>
          <p className="text-[13px] text-gray-muted">
            Escalation mirror of the review queue — filter by age or risk, decide in bulk.
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
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
            className={selectCls + " w-auto"}
          >
            <option value="">Open submissions</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="INFO_REQUESTED">Info requested</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={minAgeHours}
            onChange={(e) => {
              setPage(0);
              setMinAgeHours(e.target.value);
            }}
            className={selectCls + " w-auto"}
          >
            <option value="">Any age</option>
            <option value="6">Waiting ≥ 6h</option>
            <option value="24">Waiting ≥ 24h</option>
            <option value="48">Waiting ≥ 48h</option>
            <option value="72">Waiting ≥ 72h</option>
          </select>
          <select
            value={risk}
            onChange={(e) => {
              setPage(0);
              setRisk(e.target.value);
            }}
            className={selectCls + " w-auto"}
          >
            <option value="">Any risk</option>
            <option value="HIGH">High risk (≥ 72h)</option>
            <option value="MEDIUM">Medium risk (≥ 24h)</option>
            <option value="LOW">Low risk (&lt; 24h)</option>
          </select>
          {selectableIds.length > 0 && (
            <button
              onClick={() =>
                setSelected(allSelected ? new Set() : new Set(selectableIds))
              }
              className="rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              {allSelected ? "Clear selection" : "Select all"}
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 p-3">
            <p className="flex-1 text-[12px] font-semibold text-gold">
              {selected.size} submission(s) selected
            </p>
            <button
              onClick={() => setBulkOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-gold-bright to-gold px-4 py-2 text-[12px] font-semibold text-dark-950 transition hover:brightness-105"
            >
              <CheckCircle2 size={13} /> Decide…
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <Spinner label="Loading review queue…" />
        ) : error ? (
          <ErrorNote message={error} />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <Scale size={26} className="mx-auto text-dark-500" />
            <p className="mt-2 text-[13px] text-gray-muted">No submissions match these filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {rows.map((r) => {
                const decidable = DECIDABLE.has(r.status);
                const isSel = selected.has(String(r.id));
                return (
                  <div
                    key={r.id}
                    className={
                      "flex flex-wrap items-center gap-3 rounded-xl border p-3 transition " +
                      (isSel ? "border-gold/50 bg-gold/5" : "border-border/60 bg-dark-800/40 hover:border-gold/30")
                    }
                  >
                    <input
                      type="checkbox"
                      disabled={!decidable}
                      checked={isSel}
                      onChange={() => toggle(String(r.id))}
                      className="h-4 w-4 shrink-0 accent-[#dab249]"
                      aria-label={`Select submission of ${r.user_name || r.user_email}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-semibold">{r.user_name || r.user_email}</p>
                        <Badge tone={RISK_TONES[r.risk] || "muted"}>{r.risk} risk</Badge>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="truncate text-[11px] text-gray-muted">
                        {r.user_email} · {titleize(r.role)} · {titleize(r.country)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12px] font-medium tnum text-muted-foreground">
                        {Math.round(Number(r.age_hours) || 0)}h waiting
                      </p>
                      <p className="text-[10px] text-dark-500">
                        {r.document_count ?? 0} doc(s) · submitted {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    {!decidable && (
                      <span className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] text-dark-500">
                        <ShieldAlert size={11} /> closed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
          </>
        )}
      </Card>

      {bulkOpen && (
        <BulkDecideModal
          ids={Array.from(selected)}
          onClose={() => setBulkOpen(false)}
          onDone={(msg) => {
            setBulkOpen(false);
            setSelected(new Set());
            setFlash(msg);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
