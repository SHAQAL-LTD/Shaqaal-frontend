"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CommissionTreeRow } from "@/lib/types";
import { GitBranch, RefreshCw } from "lucide-react";
import {
  Badge, Card, ErrorNote, Pager, Spinner, StatTile, StatusBadge,
  STAGE_LABELS, fmtMoney, fmtTs, titleize,
} from "./ui";

const PAGE_SIZE = 50;

const ISSUE_META: Record<string, { label: string; tone: "danger" | "warn" | "info" }> = {
  total_mismatch: { label: "Total ≠ 100%", tone: "danger" },
  unlocked: { label: "Unlocked", tone: "warn" },
  missing_payouts: { label: "Missing payouts", tone: "danger" },
  failed_payouts: { label: "Failed payouts", tone: "danger" },
  pending_payouts: { label: "Pending payouts", tone: "warn" },
};

/** Commission trees — platform-wide lock/disbursement oversight. */
export default function CommissionSection() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CommissionTreeRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api.admin
      .commissionTrees(page, PAGE_SIZE)
      .then((d) => {
        if (!alive) return;
        setRows(d.content || []);
        setTotal(typeof d.totalElements === "number" ? d.totalElements : null);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load commission trees");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, reloadKey]);

  const treesWithIssues = rows.filter((r) => (r.issues || []).length > 0).length;
  const lockedCount = rows.filter((r) => r.locked).length;
  const failedPayouts = rows.reduce((acc, r) => acc + (Number(r.payouts_failed) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Commission trees</h2>
          <p className="text-[13px] text-gray-muted">
            Allocation totals, lock state and disbursement — catch trees that don&apos;t total 100% or never paid out.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Trees (this page)" value={rows.length} />
        <StatTile label="Locked" value={lockedCount} tone={lockedCount === rows.length && rows.length > 0 ? "success" : "warn"} />
        <StatTile label="With issues" value={treesWithIssues} tone={treesWithIssues > 0 ? "danger" : "success"} />
        <StatTile label="Failed payouts" value={failedPayouts} tone={failedPayouts > 0 ? "danger" : "success"} />
      </div>

      <Card>
        {loading ? (
          <Spinner label="Loading commission trees…" />
        ) : error ? (
          <ErrorNote message={error} />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <GitBranch size={26} className="mx-auto text-dark-500" />
            <p className="mt-2 text-[13px] text-gray-muted">No commission trees yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-muted">
                    <th className="px-2 py-2 font-medium">Deal</th>
                    <th className="px-2 py-2 font-medium">Stage</th>
                    <th className="px-2 py-2 font-medium">Total %</th>
                    <th className="px-2 py-2 font-medium">Nodes</th>
                    <th className="px-2 py-2 font-medium">Lock</th>
                    <th className="px-2 py-2 font-medium">Payouts (paid/pending/failed)</th>
                    <th className="px-2 py-2 font-medium">Payout total</th>
                    <th className="px-2 py-2 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => {
                    const pct = Number(t.total_percent) || 0;
                    const mismatch = pct > 0 && Math.abs(pct - 100) > 0.0001;
                    const issues: string[] = t.issues || [];
                    return (
                      <tr key={t.id} className="border-t border-border/60 transition hover:bg-white/[0.02]">
                        <td className="px-2 py-2.5">
                          <p className="font-semibold text-foreground">{t.utid || String(t.deal_id).slice(0, 8)}</p>
                          <p className="text-[10px] text-dark-500">{fmtTs(t.created_at)}</p>
                        </td>
                        <td className="px-2 py-2.5">
                          <Badge tone={t.completed ? "success" : "gold"}>
                            {t.completed ? "Settled" : STAGE_LABELS[t.current_stage] || titleize(t.current_stage)}
                          </Badge>
                        </td>
                        <td className={"px-2 py-2.5 font-semibold tnum " + (mismatch ? "text-danger" : "text-foreground")}>
                          {pct.toFixed(pct % 1 === 0 ? 0 : 2)}%
                        </td>
                        <td className="px-2 py-2.5 tnum text-muted-foreground">{t.node_count ?? 0}</td>
                        <td className="px-2 py-2.5">
                          <StatusBadge status={t.locked ? "LOCKED" : "UNLOCKED"} />
                        </td>
                        <td className="px-2 py-2.5 tnum text-muted-foreground">
                          {t.payouts_paid ?? 0}/{t.payouts_pending ?? 0}/
                          <span className={Number(t.payouts_failed) > 0 ? "text-danger font-semibold" : ""}>
                            {t.payouts_failed ?? 0}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 tnum text-muted-foreground">{fmtMoney(t.payout_total)}</td>
                        <td className="px-2 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {issues.length === 0 && <span className="text-[11px] text-success">OK</span>}
                            {issues.map((issue) => {
                              const meta = ISSUE_META[issue] || { label: titleize(issue), tone: "warn" as const };
                              return (
                                <Badge key={issue} tone={meta.tone}>
                                  {meta.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
          </>
        )}
      </Card>
    </div>
  );
}
