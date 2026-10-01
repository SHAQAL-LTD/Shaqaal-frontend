"use client";

import React, { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { AuditEventRow } from "@/lib/types";
import { Activity, ChevronDown, RefreshCw, Search } from "lucide-react";
import {
  Badge, Card, ErrorNote, Pager, Spinner, fmtTs, inputCls, titleize,
} from "./ui";

/** Audit before/after payloads arrive as JSONB strings — pretty-print defensively. */
export function prettyJson(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "string") {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return null;
  }
}

function actionTone(action?: string): "gold" | "success" | "danger" | "warn" | "muted" {
  const a = (action || "").toUpperCase();
  if (/(FAIL|REJECT|REVOK|DEACTIVAT|DEMOTE|ERROR|FORCE)/.test(a)) return "danger";
  if (/(APPROVE|ACTIVAT|CREATE|COMPLETED|PAID|VERIFIED|REACTIVAT)/.test(a)) return "success";
  if (/(UPDATE|CHANGED|RECONCIL|SUBMIT)/.test(a)) return "warn";
  return "gold";
}

/**
 * One audit_event row — shared by the Audit Trail tab and the per-user audit modal
 * inside the Users tab.
 */
export function AuditRow({ event }: { event: AuditEventRow }) {
  const before = prettyJson(event.before_json);
  const after = prettyJson(event.after_json);
  return (
    <details className="group rounded-xl border border-border/60 bg-dark-800/40 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={actionTone(event.action)}>{titleize(event.action)}</Badge>
            <span className="text-[11px] text-gray-muted">{event.module}</span>
            <span className="rounded-full bg-dark-700/70 px-2 py-0.5 text-[10px] text-dark-500">
              {event.entity_type} · {String(event.entity_id || "").slice(0, 8)}
            </span>
          </span>
          <span className="mt-1 block text-[11px] text-gray-muted">
            {event.actor_name || "System"}
            {event.actor_email ? ` (${event.actor_email})` : ""}
            {event.actor_role ? ` · ${titleize(event.actor_role)}` : ""}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[10px] text-dark-500">
          {fmtTs(event.occurred_at)}
          <ChevronDown size={13} className="transition group-open:rotate-180" />
        </span>
      </summary>
      {(before || after || event.ip_address || event.correlation_id) && (
        <div className="mt-3 grid gap-3 border-t border-border/60 pt-3 md:grid-cols-2">
          {before && (
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-muted">Before</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-dark-900/70 p-2 text-[11px] text-muted-foreground">
                {before}
              </pre>
            </div>
          )}
          {after && (
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-muted">After</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-dark-900/70 p-2 text-[11px] text-muted-foreground">
                {after}
              </pre>
            </div>
          )}
          {(event.ip_address || event.correlation_id) && (
            <div className="text-[11px] text-dark-500 md:col-span-2">
              {event.ip_address ? `IP ${event.ip_address}` : ""}
              {event.ip_address && event.correlation_id ? " · " : ""}
              {event.correlation_id ? `trace ${event.correlation_id}` : ""}
            </div>
          )}
        </div>
      )}
    </details>
  );
}

const PAGE_SIZE = 50;

/** Platform-wide audit trail — server-paged, client-filterable. */
export default function AuditSection() {
  const [events, setEvents] = useState<AuditEventRow[]>([]);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api.admin
      .auditTrail(page, PAGE_SIZE)
      .then((rows) => {
        if (!alive) return;
        setEvents(Array.isArray(rows) ? rows : []);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(apiErrorMessage(e, "Failed to load audit trail"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, reloadKey]);

  const needle = filter.trim().toLowerCase();
  const visible = needle
    ? events.filter((e) =>
        [e.action, e.module, e.entity_type, e.entity_id, e.actor_name, e.actor_email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle)),
      )
    : events;

  // The endpoint returns a bare array — a short page is the last one.
  const total = events.length < PAGE_SIZE ? page * PAGE_SIZE + events.length : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Audit trail</h1>
          <p className="text-[13px] text-gray-muted">
            Append-only event log — every mutation platform-wide, tagged with the acting identity.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-dark-700 bg-dark-800 px-3 py-2 focus-within:border-gold-500">
          <Search size={15} className="shrink-0 text-gray-muted" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by action, module, entity or actor…"
            className={inputCls}
          />
        </div>

        {loading ? (
          <Spinner label="Loading audit trail…" />
        ) : error ? (
          <ErrorNote message={error} />
        ) : (
          <>
            <div className="space-y-2">
              {visible.length === 0 && (
                <div className="py-10 text-center">
                  <Activity size={26} className="mx-auto text-dark-500" />
                  <p className="mt-2 text-[13px] text-gray-muted">No audit events match.</p>
                </div>
              )}
              {visible.map((e) => (
                <AuditRow key={e.id} event={e} />
              ))}
            </div>
            <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
          </>
        )}
      </Card>
    </div>
  );
}
