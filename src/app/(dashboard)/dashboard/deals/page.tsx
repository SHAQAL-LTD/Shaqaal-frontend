"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Deal, PageResponse } from "@/lib/types";
import { Badge, Card, EmptyState, GoldButton, SectionTitle, inputClass } from "@/components/ui-kit";
import {
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

function stageNumber(stage: string): number {
  const match = stage.match(/STAGE_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function stageBadge(stage: string): "gold" | "green" | "muted" {
  const n = stageNumber(stage);
  if (n >= 10) return "green";
  if (n >= 4 && n <= 6) return "gold";
  return "muted";
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
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up">
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && deals.length === 0 && (
        <EmptyState
          icon={Package}
          title="No deals in pipeline"
          description="Create a deal room to start tracking stages, parties and documents."
          actionLabel="New deal"
          actionHref="/dashboard/deals/new"
          actionIcon={<Plus size={16} />}
        />
      )}

      {/* Deals */}
      {!loading && filtered.length > 0 && (
        <Card>
          <SectionTitle
            title="Active deal book"
            subtitle="Each deal is an isolated, audit-locked room."
            action={
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search UTID, mineral, country…"
                    className={`${inputClass} pl-9 sm:w-64`}
                  />
                </div>
                <Link href="/dashboard/deals/new">
                  <GoldButton type="button">
                    <Plus size={16} /> New Deal
                  </GoldButton>
                </Link>
              </div>
            }
          />

          {/* Desktop table */}
          <div className="mt-5 hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">UTID</th>
                  <th className="py-3 pr-4 font-medium">Mineral</th>
                  <th className="py-3 pr-4 font-medium">Quantity</th>
                  <th className="py-3 pr-4 font-medium">Route</th>
                  <th className="py-3 pr-4 font-medium">Stage</th>
                  <th className="py-3 pr-4 font-medium">Created</th>
                  <th className="py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => (
                  <tr key={deal.id} className="border-b border-border/60 transition-colors hover:bg-secondary/40">
                    <td className="tnum py-4 pr-4 font-mono text-xs text-gold">{deal.utid || "—"}</td>
                    <td className="py-4 pr-4 font-medium capitalize">{deal.mineralType}</td>
                    <td className="tnum py-4 pr-4">{deal.quantityKg.toLocaleString()} kg</td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      <span className="uppercase">{deal.originCountry}</span>
                      <span className="mx-1.5 text-muted-foreground/60">→</span>
                      <span className="uppercase">{deal.destinationCountry}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge tone={stageBadge(deal.currentStage)}>
                        Stage {stageNumber(deal.currentStage)} · {STAGE_LABELS[deal.currentStage] || ""}
                      </Badge>
                    </td>
                    <td className="tnum py-4 pr-4 text-xs text-muted-foreground">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/dashboard/deals/${deal.id}`}
                        className="inline-flex rounded-lg border border-border p-2 text-muted-foreground transition hover:border-gold/50 hover:text-gold"
                        aria-label={`Open deal ${deal.utid || deal.id}`}
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-5 grid gap-3 lg:hidden">
            {filtered.map((deal) => (
              <Link
                key={deal.id}
                href={`/dashboard/deals/${deal.id}`}
                className="block rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:border-gold/40"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium capitalize">{deal.mineralType}</p>
                    <p className="tnum mt-1 truncate text-xs font-mono text-gold">
                      {deal.utid || "UTID pending"}
                    </p>
                  </div>
                  <Badge tone={stageBadge(deal.currentStage)}>
                    Stage {stageNumber(deal.currentStage)}
                  </Badge>
                </div>
                <div className="tnum mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{deal.quantityKg.toLocaleString()} kg</span>
                  <span className="uppercase">{deal.originCountry} → {deal.destinationCountry}</span>
                  <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <p className="tnum text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
