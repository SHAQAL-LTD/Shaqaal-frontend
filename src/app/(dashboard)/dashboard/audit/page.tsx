"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import type { AuditEvent, Deal } from "@/lib/types";
import { ClipboardList, Search, Loader2, AlertCircle, Download, Clock, User, ArrowRight, FileText } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  STAGE_ADVANCED: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  DEAL_CREATED: "bg-success/10 text-success border-success/40",
  DOCUMENT_UPLOADED: "bg-chart-2/10 text-chart-2 border-chart-2/40",
  PARTY_ADDED: "bg-chart-1/10 text-chart-1 border-chart-1/40",
  COMMISSION_LOCKED: "bg-gold/10 text-gold-bright border-gold/40",
};

function formatAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function AuditPage() {
  const [dealId, setDealId] = useState("");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!dealId.trim()) { setError("Enter a deal ID"); return; }
    setLoading(true); setError(""); setEvents([]); setDeal(null); setSearched(true);
    try {
      const [auditEvents, dealData] = await Promise.all([
        api.audit.getDealAudit(dealId.trim()),
        api.deals.get(dealId.trim()).catch(() => null),
      ]);
      setEvents(auditEvents);
      setDeal(dealData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit trail");
    } finally { setLoading(false); }
  }

  async function handleExport() {
    if (!dealId.trim()) return;
    try {
      const bundle = await api.audit.exportDeal(dealId.trim());
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `audit-${dealId.trim()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up">
      <p className="max-w-2xl text-sm text-muted-foreground">Search a deal to view its full lifecycle history — every transition is hash-chained and exportable.</p>

      {/* Search */}
      <div className="glass-panel-elevated rounded-2xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              type="text"
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter deal UUID..."
              className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition font-mono"
            />
          </div>
          <button onClick={handleSearch} disabled={loading || !dealId.trim()}
            className="button-gold px-6 rounded-xl flex items-center gap-2 text-sm font-semibold disabled:opacity-50 shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
          {events.length > 0 && (
            <button onClick={handleExport}
              className="border border-dark-700 px-5 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-muted hover:bg-dark-800 hover:text-white transition shrink-0">
              <Download size={16} /> Export JSON
            </button>
          )}
        </div>
      </div>

      {error && <div className="flex items-center gap-3 bg-danger/10 border border-danger/40 rounded-xl p-4"><AlertCircle size={18} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>}

      {/* Deal Summary */}
      {deal && (
        <div className="glass-panel-elevated rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText size={18} className="text-gold-500" />
            <h3 className="font-semibold">Deal Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">UTID</p><p className="text-sm font-mono text-gold-500">{deal.utid || "—"}</p></div>
            <div><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Mineral</p><p className="text-sm font-medium capitalize">{deal.mineralType}</p></div>
            <div><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Quantity</p><p className="text-sm font-medium">{deal.quantityKg.toLocaleString()} kg</p></div>
            <div><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Route</p><p className="text-sm font-medium uppercase">{deal.originCountry} → {deal.destinationCountry}</p></div>
            <div><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Status</p><p className="text-sm font-medium">{deal.completed ? "Completed" : "Active"}</p></div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!loading && searched && events.length === 0 && !error && (
        <div className="glass-panel-elevated rounded-2xl p-12 text-center">
          <ClipboardList size={40} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No audit events</h3>
          <p className="text-gray-muted text-sm">This deal has no recorded audit events yet.</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-muted uppercase tracking-wider">Timeline ({events.length} events)</h3>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-dark-700" />

            {events.map((event, i) => (
              <div key={event.id} className="relative mb-6 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-dark-800 border-2 border-gold-500/50" />

                <div className="glass-panel rounded-xl p-5 card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ACTION_COLORS[event.action] || "bg-dark-800 text-gray-400 border-dark-700"}`}>
                        {formatAction(event.action)}
                      </span>
                      <span className="text-xs text-gray-muted">{event.module}/{event.entityType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-muted">
                      <Clock size={12} />
                      {new Date(event.occurredAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {event.actorUserId && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-muted mb-2">
                      <User size={12} />
                      Actor: {event.actorUserId.slice(0, 8)}... ({event.actorRole || "unknown"})
                    </div>
                  )}

                  {(event.beforeJson || event.afterJson) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {event.beforeJson && (
                        <div className="bg-dark-800/50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Before</p>
                          <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all">{JSON.stringify(event.beforeJson, null, 2)}</pre>
                        </div>
                      )}
                      {event.afterJson && (
                        <div className="bg-dark-800/50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">After</p>
                          <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all">{JSON.stringify(event.afterJson, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
