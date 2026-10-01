"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SystemHealth } from "@/lib/types";
import {
  Activity, AlertTriangle, CheckCircle2, Database, RefreshCw, Server, WifiOff,
} from "lucide-react";
import { Card, ErrorNote, Spinner, StatTile, StatusBadge, titleize } from "./ui";

/**
 * System Health — real infrastructure status: DB pool pressure, Redis connectivity
 * (rate limiting fails open without it), per-provider webhook failures and notification
 * delivery. Every subsystem renders an alert state when degraded, never just a number.
 */
export default function HealthSection() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .systemHealth()
      .then((h) => {
        if (!alive) return;
        setHealth(h);
        setError(null);
        setCheckedAt(new Date().toLocaleTimeString());
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Health check failed");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  if (loading && !health) return <Spinner label="Checking infrastructure…" />;

  const degraded = health?.status === "DEGRADED";
  const reasons: string[] = health?.degradedReasons ?? [];
  const db = health?.database;
  const redis = health?.redis;
  const webhooks = health?.webhooks;
  const notif = health?.notifications;
  const poolAwaiting = Number(db?.pool?.awaiting) || 0;
  const redisDown = redis?.status !== "UP";
  const webhookFailures = Number(webhooks?.failures24h) || 0;
  const deliveryFailures = Number(notif?.failures24h) || 0;

  const refresh = () => setReloadKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">System health</h2>
          <p className="text-[13px] text-gray-muted">
            Live infrastructure status {checkedAt ? `· last checked ${checkedAt}` : ""}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Re-run checks
        </button>
      </div>

      <ErrorNote message={error} />

      {/* Overall banner */}
      <div
        className={
          "flex items-start gap-3 rounded-2xl border p-5 " +
          (degraded ? "border-danger/50 bg-danger/10" : "border-success/40 bg-success/10")
        }
      >
        {degraded ? (
          <AlertTriangle size={22} className="mt-0.5 shrink-0 text-danger" />
        ) : (
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
        )}
        <div className="min-w-0">
          <p className={"text-[15px] font-semibold " + (degraded ? "text-danger" : "text-success")}>
            {degraded ? "DEGRADED — attention required" : "All systems operational"}
          </p>
          {degraded && reasons.length > 0 && (
            <ul className="mt-1.5 space-y-1 text-[12px] text-danger/90">
              {reasons.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Database */}
        <Card
          title="Database"
          subtitle={db ? `${titleize(db.type)} · ${db.status === "UP" ? "reachable" : "UNREACHABLE"}` : undefined}
          actions={<StatusBadge status={db?.status} />}
        >
          {poolAwaiting > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
              <AlertTriangle size={14} className="shrink-0 text-danger" />
              <p className="text-[12px] text-danger">
                {poolAwaiting} request(s) waiting for a connection — pool exhausted.
              </p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-dark-800/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-muted">Active</p>
              <p className="mt-0.5 text-lg font-bold tnum">{db?.pool?.active ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-dark-800/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-muted">Idle</p>
              <p className="mt-0.5 text-lg font-bold tnum">{db?.pool?.idle ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-dark-800/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-muted">Awaiting</p>
              <p className={"mt-0.5 text-lg font-bold tnum " + (poolAwaiting > 0 ? "text-danger" : "")}>
                {db?.pool?.awaiting ?? "—"}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-dark-800/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-muted">Size</p>
              <p className="mt-0.5 text-[13px] font-semibold tnum">
                {(db?.sizeBytes ?? 0) > 0 ? ((db?.sizeBytes ?? 0) / 1024 / 1024).toFixed(1) + " MB" : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-dark-800/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-muted">Tables</p>
              <p className="mt-0.5 text-[13px] font-semibold tnum">{db?.tables ?? "—"}</p>
            </div>
          </div>
        </Card>

        {/* Redis */}
        <Card
          title="Redis"
          subtitle="Rate limiting depends on this — it fails OPEN when unreachable"
          actions={<StatusBadge status={redis?.status} />}
        >
          {redisDown ? (
            <div className="flex items-start gap-2 rounded-xl border border-danger/50 bg-danger/10 p-4">
              <WifiOff size={18} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="text-[13px] font-semibold text-danger">Redis unreachable</p>
                <p className="mt-1 text-[12px] text-danger/90">
                  Login rate limiting is running <strong>fail-open</strong> — brute-force
                  protection is currently OFF while the platform keeps accepting logins.
                </p>
                <p className="mt-2 rounded-lg bg-dark-900/60 p-2 font-mono text-[11px] text-muted-foreground">
                  rateLimiting: {redis?.rateLimiting || "unknown"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-success/40 bg-success/10 p-4">
              <Database size={18} className="mt-0.5 shrink-0 text-success" />
              <div>
                <p className="text-[13px] font-semibold text-success">Connected</p>
                <p className="mt-1 text-[12px] text-success/90">Rate limiting active and enforcing.</p>
                <p className="mt-2 rounded-lg bg-dark-900/60 p-2 font-mono text-[11px] text-muted-foreground">
                  rateLimiting: {redis?.rateLimiting || "active"}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Payment webhooks */}
        <Card
          title="Payment webhooks"
          subtitle="Paystack + NOWPayments, last 24h"
          actions={
            <Badgeish ok={webhookFailures === 0}>
              {webhookFailures} failure(s)
            </Badgeish>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="Failures (24h)"
              value={webhookFailures}
              tone={webhookFailures > 0 ? "danger" : "success"}
            />
            <StatTile label="Providers" value="Paystack + NOW" />
          </div>
          <div className="mt-3 space-y-2">
            {(webhooks?.last24h || []).length === 0 && (
              <p className="rounded-xl border border-border/60 bg-dark-800/40 p-3 text-[12px] text-gray-muted">
                No webhook events received in the last 24h.
              </p>
            )}
            {(webhooks?.last24h || []).map((row, i) => {
              const failing = row.status === "FAILED" || row.status === "REJECTED_SIGNATURE";
              return (
                <div
                  key={i}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3 " +
                    (failing ? "border-danger/40 bg-danger/10" : "border-border/60 bg-dark-800/40")
                  }
                >
                  <span className="w-32 shrink-0 text-[12px] font-semibold">{titleize(row.provider)}</span>
                  <StatusBadge status={row.status} />
                  <span className={"ml-auto text-[13px] font-bold tnum " + (failing ? "text-danger" : "text-muted-foreground")}>
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
          {webhookFailures > 0 && (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-danger">
              <AlertTriangle size={13} /> Open the Payments tab to inspect and reconcile affected payments.
            </p>
          )}
        </Card>

        {/* Notification delivery */}
        <Card
          title="Notification delivery"
          subtitle="Email / SMS / in-app, last 24h"
          actions={
            <Badgeish ok={deliveryFailures === 0}>
              {deliveryFailures} failure(s)
            </Badgeish>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="Delivery failures (24h)"
              value={deliveryFailures}
              tone={deliveryFailures > 0 ? "danger" : "success"}
            />
            <StatTile label="Unread in-app" value={notif?.unreadInApp ?? 0} />
          </div>
          <div className="mt-3 space-y-2">
            {(notif?.last24h || []).length === 0 && (
              <p className="rounded-xl border border-border/60 bg-dark-800/40 p-3 text-[12px] text-gray-muted">
                No delivery attempts logged in the last 24h.
              </p>
            )}
            {(notif?.last24h || []).map((row, i) => {
              const failing = row.status === "FAILED";
              return (
                <div
                  key={i}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3 " +
                    (failing ? "border-danger/40 bg-danger/10" : "border-border/60 bg-dark-800/40")
                  }
                >
                  <span className="w-24 shrink-0 text-[12px] font-semibold">{titleize(row.channel)}</span>
                  <StatusBadge status={row.status} />
                  <span className={"ml-auto text-[13px] font-bold tnum " + (failing ? "text-danger" : "text-muted-foreground")}>
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-[12px] text-gray-muted">
        <Activity size={13} className="text-gold" /> Checks run on demand — hit “Re-run checks” after restoring a subsystem.
        <Server size={13} className="ml-3 text-gold" /> Redis down also means in-memory rate-limit counters are gone.
      </p>
    </div>
  );
}

/** Small ok/failing pill used by the card headers. */
function Badgeish({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold " +
        (ok ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger")
      }
    >
      {children}
    </span>
  );
}
