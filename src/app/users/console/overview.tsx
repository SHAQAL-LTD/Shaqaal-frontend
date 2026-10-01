"use client";

import React, { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { PlatformStats, SystemHealth } from "@/lib/types";
import {
  Activity, AlertTriangle, ArrowRight, FileText, RefreshCw,
  TrendingUp, UserCheck, Users,
} from "lucide-react";
import {
  Card, ErrorNote, Spinner, StatTile, STAGE_LABELS, fmtMoney, titleize,
} from "./ui";

/**
 * Overview — platform pulse at a glance: headline stats, a live health strip that
 * alerts visually when the platform is degraded (with a shortcut into System Health),
 * and the role / stage / payment breakdowns.
 */
export default function OverviewSection({ onNavigate }: { onNavigate: (key: string) => void }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([api.admin.stats(), api.admin.systemHealth()])
      .then(([s, h]) => {
        if (!alive) return;
        setStats(s);
        setHealth(h);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(apiErrorMessage(e, "Failed to load overview"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  if (loading) return <Spinner label="Loading platform overview…" />;
  if (error) return <ErrorNote message={error} />;
  if (!stats) return <ErrorNote message="No statistics available" />;

  const degraded = health?.status === "DEGRADED";
  const reasons: string[] = health?.degradedReasons ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="text-[13px] text-gray-muted">Platform pulse across users, deals and money movement.</p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Live health strip — alerts visually, never just reports numbers. */}
      <div
        className={
          "flex flex-wrap items-center gap-3 rounded-2xl border p-4 " +
          (degraded ? "border-danger/50 bg-danger/10" : "border-success/40 bg-success/10")
        }
      >
        {degraded ? (
          <AlertTriangle size={18} className="shrink-0 text-danger" />
        ) : (
          <Activity size={18} className="shrink-0 text-success" />
        )}
        <div className="min-w-0 flex-1">
          <p className={"text-[13px] font-semibold " + (degraded ? "text-danger" : "text-success")}>
            {degraded ? "System degraded" : "All systems operational"}
          </p>
          {degraded && reasons.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[12px] text-danger/90">
              {reasons.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => onNavigate("health")}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:border-gold/50 hover:text-gold"
        >
          System health <ArrowRight size={13} />
        </button>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total users" value={stats.totalUsers ?? 0} />
        <StatTile label="Active users" value={stats.activeUsers ?? 0} tone="success" />
        <StatTile label="Verified (KYC)" value={stats.verifiedUsers ?? 0} />
        <StatTile label="Total deals" value={stats.totalDeals ?? 0} />
        <StatTile label="New users (30d)" value={stats.recentUsers ?? 0} />
        <StatTile label="New deals (30d)" value={stats.recentDeals ?? 0} />
        <StatTile label="KYC submissions" value={stats.totalKyc ?? 0} />
        <StatTile label="Inactive users" value={Math.max(0, (stats.totalUsers ?? 0) - (stats.activeUsers ?? 0))} tone="warn" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Users by role" subtitle="Distribution of platform accounts">
          <div className="space-y-3">
            {(stats.usersByRole || []).map((r) => {
              const pct = stats.totalUsers > 0 ? (r.count / stats.totalUsers) * 100 : 0;
              return (
                <div key={r.role} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-[12px] text-gray-muted">{titleize(r.role)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: pct + "%" }} />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-[12px] text-gray-muted tnum">{r.count}</span>
                </div>
              );
            })}
            {(!stats.usersByRole || stats.usersByRole.length === 0) && (
              <p className="py-4 text-center text-[12px] text-gray-muted">No users yet</p>
            )}
          </div>
        </Card>

        <Card title="Deals by stage" subtitle="Where the pipeline sits right now">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(stats.dealsByStage || []).map((s) => (
              <div key={s.stage} className="rounded-xl bg-dark-800/60 p-3 text-center">
                <p className="text-lg font-bold tnum">{s.count}</p>
                <p className="mt-1 text-[10px] text-gray-muted">
                  {STAGE_LABELS[s.stage] || titleize(s.stage)}
                </p>
              </div>
            ))}
            {(!stats.dealsByStage || stats.dealsByStage.length === 0) && (
              <p className="col-span-5 py-4 text-center text-[12px] text-gray-muted">No deals</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Payments" subtitle="Platform-wide payment volume by status">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(stats.paymentSummary || []).map((p) => (
            <div key={p.status} className="rounded-xl bg-dark-800/60 p-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-muted">{titleize(p.status)}</p>
              <p className="mt-1 text-xl font-bold tnum">{p.count}</p>
              <p className="mt-0.5 text-[12px] text-gray-muted tnum">{fmtMoney(p.total)}</p>
            </div>
          ))}
          {(!stats.paymentSummary || stats.paymentSummary.length === 0) && (
            <p className="col-span-4 py-4 text-center text-[12px] text-gray-muted">No payments yet</p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Quick links" subtitle="Jump straight into an operations workflow">
          <div className="grid gap-2">
            {[
              { key: "users", label: "Manage users, roles & sessions", icon: Users },
              { key: "deals", label: "Inspect stuck deals & force-advance", icon: FileText },
              { key: "payments", label: "Reconcile missed payment webhooks", icon: TrendingUp },
              { key: "kyc", label: "Escalate bulk KYC decisions", icon: UserCheck },
            ].map((l) => (
              <button
                key={l.key}
                onClick={() => onNavigate(l.key)}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-[13px] text-muted-foreground transition hover:border-gold/40 hover:bg-gold/5 hover:text-foreground"
              >
                <l.icon size={15} className="shrink-0 text-gold" />
                <span className="flex-1 truncate">{l.label}</span>
                <ArrowRight size={14} className="shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        <Card title="Recent activity" subtitle="Last 30 days">
          <div className="grid grid-cols-2 gap-4">
            <StatTile label="New users" value={stats.recentUsers ?? 0} tone="success" />
            <StatTile label="New deals" value={stats.recentDeals ?? 0} />
          </div>
          <p className="mt-4 flex items-center gap-2 text-[12px] text-gray-muted">
            <Activity size={13} className="text-gold" />
            Every admin action from this console is written to the immutable audit trail.
          </p>
        </Card>
      </div>
    </div>
  );
}
