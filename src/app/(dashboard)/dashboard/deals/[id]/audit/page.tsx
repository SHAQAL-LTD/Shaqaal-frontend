"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { AuditEvent, Deal } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  AlertCircle,
  Download,
  Clock,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  STAGE_ADVANCED: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  DEAL_CREATED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DOCUMENT_UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTY_ADDED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  PARTY_REMOVED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMMISSION_LOCKED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMMISSION_NODE_ADDED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  KYC_SUBMITTED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  KYC_APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  KYC_REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DealAuditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canExport = user?.role === "compliance_officer" || user?.role === "admin";

  useEffect(() => {
    loadData();
  }, [dealId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [eventsData, dealData] = await Promise.all([
        api.audit.getDealAudit(dealId),
        api.deals.get(dealId).catch(() => null),
      ]);
      setEvents(eventsData);
      setDeal(dealData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const bundle = await api.audit.exportDeal(dealId);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-${dealId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm"
      >
        <ArrowLeft size={16} /> Back to deal
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-gray-muted mt-1">Full lifecycle history for this deal.</p>
        </div>
        {events.length > 0 && canExport && (
          <button
            onClick={handleExport}
            className="border border-dark-700 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-muted hover:bg-dark-800 hover:text-white transition"
          >
            <Download size={16} /> Export JSON
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Deal Summary */}
      {!loading && deal && (
        <div className="glass-panel-elevated rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText size={18} className="text-gold-500" />
            <h3 className="font-semibold">Deal Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">UTID</p>
              <p className="text-sm font-mono text-gold-500">{deal.utid || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Mineral</p>
              <p className="text-sm font-medium capitalize">{deal.mineralType}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Quantity</p>
              <p className="text-sm font-medium">{deal.quantityKg.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Route</p>
              <p className="text-sm font-medium uppercase">{deal.originCountry} → {deal.destinationCountry}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Status</p>
              <p className="text-sm font-medium">{deal.completed ? "Completed" : "Active"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && !error && (
        <div className="glass-panel-elevated rounded-2xl p-12 text-center">
          <ClipboardList size={40} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No audit events</h3>
          <p className="text-gray-muted text-sm">This deal has no recorded audit events yet.</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-muted uppercase tracking-wider">
            Timeline ({events.length} event{events.length !== 1 ? "s" : ""})
          </h3>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-dark-700" />

            {events.map((event) => (
              <div key={event.id} className="relative mb-6 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-dark-800 border-2 border-gold-500/50" />

                <div className="glass-panel rounded-xl p-5 card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          ACTION_COLORS[event.action] || "bg-dark-800 text-gray-400 border-dark-700"
                        }`}
                      >
                        {formatAction(event.action)}
                      </span>
                      <span className="text-xs text-gray-muted">
                        {event.module}/{event.entityType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-muted">
                      <Clock size={12} />
                      {new Date(event.occurredAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                          <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">
                            Before
                          </p>
                          <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all">
                            {JSON.stringify(event.beforeJson, null, 2)}
                          </pre>
                        </div>
                      )}
                      {event.afterJson && (
                        <div className="bg-dark-800/50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">
                            After
                          </p>
                          <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all">
                            {JSON.stringify(event.afterJson, null, 2)}
                          </pre>
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
