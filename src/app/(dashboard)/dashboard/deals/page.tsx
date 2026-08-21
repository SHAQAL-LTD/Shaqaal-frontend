"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Deal, PageResponse } from "@/lib/types";
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Loader2,
  Package,
  ArrowRight,
} from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  STAGE_01_REGISTRATION: "Registration",
  STAGE_02_SUPPLIER_VERIFICATION: "Supplier Verification",
  STAGE_03_BUYER_ONBOARDING: "Buyer Onboarding",
  STAGE_04_SPA_SIGNATURE: "SPA Signature",
  STAGE_05_PROOF_OF_FUNDS: "Proof of Funds",
  STAGE_06_ADVANCE_PAYMENT: "Advance Payment",
  STAGE_07_ORIGIN_LOGISTICS: "Origin Logistics",
  STAGE_08_SHIPPING: "Shipping",
  STAGE_09_DESTINATION_CLEARANCE: "Destination Clearance",
  STAGE_10_SETTLEMENT: "Settlement",
};

const STAGE_COLORS: Record<string, string> = {
  STAGE_01_REGISTRATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  STAGE_02_SUPPLIER_VERIFICATION: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  STAGE_03_BUYER_ONBOARDING: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  STAGE_04_SPA_SIGNATURE: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  STAGE_05_PROOF_OF_FUNDS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  STAGE_06_ADVANCE_PAYMENT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  STAGE_07_ORIGIN_LOGISTICS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  STAGE_08_SHIPPING: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  STAGE_09_DESTINATION_CLEARANCE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  STAGE_10_SETTLEMENT: "bg-green-500/10 text-green-400 border-green-500/20",
};

function stageNumber(stage: string): number {
  const match = stage.match(/STAGE_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDeals();
  }, [page]);

  async function loadDeals() {
    setLoading(true); setError("");
    try {
      const res: PageResponse<Deal> = await api.deals.list(page, 10);
      setDeals(res.content);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }

  const filtered = deals.filter((d) =>
    search === "" ||
    d.utid?.toLowerCase().includes(search.toLowerCase()) ||
    d.mineralType.toLowerCase().includes(search.toLowerCase()) ||
    d.originCountry.toLowerCase().includes(search.toLowerCase()) ||
    d.destinationCountry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deals</h2>
          <p className="text-gray-muted mt-1">Manage your commodity transactions across 10 stages.</p>
        </div>
        <Link
          href="/dashboard/deals/new"
          className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> New Deal
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by UTID, mineral, country..."
          className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && deals.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Package size={48} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
          <p className="text-gray-muted text-sm mb-6">Create your first deal to get started with the pipeline.</p>
          <Link href="/dashboard/deals/new" className="button-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm font-medium">
            <Plus size={16} /> Create Deal
          </Link>
        </div>
      )}

      {/* Deals Table */}
      {!loading && filtered.length > 0 && (
        <div className="glass-panel rounded-xl border border-dark-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-800 bg-dark-900/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">UTID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">Mineral</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">Route</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">Stage</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-muted uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => (
                  <tr key={deal.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gold-500">{deal.utid || "—"}</td>
                    <td className="px-6 py-4 font-medium capitalize">{deal.mineralType}</td>
                    <td className="px-6 py-4 text-gray-300">{deal.quantityKg.toLocaleString()} kg</td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="uppercase">{deal.originCountry}</span>
                      <span className="text-dark-600 mx-1.5">→</span>
                      <span className="uppercase">{deal.destinationCountry}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STAGE_COLORS[deal.currentStage] || "bg-dark-800 text-gray-400 border-dark-700"}`}>
                        Stage {stageNumber(deal.currentStage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-muted text-xs">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/deals/${deal.id}`} className="text-gold-500 hover:text-gold-400 transition p-2 rounded-lg hover:bg-gold-500/10 inline-flex">
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-800 bg-dark-900/30">
              <p className="text-xs text-gray-muted">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-dark-700 text-gray-muted hover:bg-dark-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-dark-700 text-gray-muted hover:bg-dark-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
