"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Deal, PageResponse } from "@/lib/types";
import { Badge, Card, EmptyState, GoldButton, SectionTitle, Stat } from "@/components/ui-kit";
import { Plus, Loader2, ArrowRight, Package } from "lucide-react";

function stageNumber(stage: string): number {
  const m = stage.match(/STAGE_(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function dealStatus(deal: Deal): { tone: "gold" | "green" | "muted"; label: string } {
  if (deal.completed) return { tone: "green", label: "Settled" };
  if (stageNumber(deal.currentStage) >= 9) return { tone: "gold", label: "Closing" };
  return { tone: "muted", label: "Active" };
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardOverview() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [orgCount, setOrgCount] = useState<number | null>(null);
  const [counterparties, setCounterparties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [res, orgRes] = await Promise.all([
        api.deals.list(0, 8),
        api.organizations.list(0, 1).catch(() => null),
      ]);
      setDeals(res.content);
      setTotalDeals(res.totalElements);
      if (orgRes) setOrgCount(orgRes.totalElements);

      const pairs = await Promise.all(
        res.content.map(async (d): Promise<[string, string]> => {
          try {
            const ps = await api.dealParties.list(d.id);
            if (ps.length === 0) return [d.id, ""];
            return [
              d.id,
              ps.length > 1
                ? `${ps[0].organizationName} +${ps.length - 1}`
                : ps[0].organizationName,
            ];
          } catch {
            return [d.id, ""];
          }
        }),
      );
      setCounterparties(Object.fromEntries(pairs));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setLastSync(fmtTime(new Date()));
    }
  }

  const activeCount = deals.filter((d) => !d.completed).length;
  const completedCount = deals.filter((d) => d.completed).length;
  const today = fmtDate(new Date());

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up">
      {/* ── Page actions: session metadata + primary action (title/subtitle
           live in the sticky shell header, matching every other page) ── */}
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        <p className="tnum text-xs text-muted-foreground">
          {today}
          {lastSync ? ` · Last sync ${lastSync}` : loading ? " · Syncing…" : ""}
        </p>
        <Link href="/dashboard/deals/new" className="shrink-0">
          <GoldButton type="button">
            <Plus size={16} strokeWidth={2.5} /> New deal
          </GoldButton>
        </Link>
      </div>

      {/* ── Stats ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total deals"
          value={loading ? "…" : String(totalDeals)}
          className="p-5"
          valueClassName="text-3xl"
        />
        <Stat
          label="Active pipeline"
          value={loading ? "…" : String(activeCount)}
          className="p-5"
          valueClassName="text-3xl"
        />
        <Stat
          label="Completed"
          value={loading ? "…" : String(completedCount)}
          className="p-5"
          valueClassName="text-3xl"
        />
        <Stat
          label="Organizations"
          value={orgCount !== null ? String(orgCount) : loading ? "…" : "—"}
          className="p-5"
          valueClassName="text-3xl"
        />
      </div>

      {/* ── Recent deals: dense table ────────────────── */}
      <Card>
        <SectionTitle
          title="Recent deals"
          action={
            <Link
              href="/dashboard/deals"
              className="text-xs font-medium text-gold hover:text-gold-bright transition-colors flex items-center gap-1.5"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          }
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-gold animate-spin" />
          </div>
        )}

        {!loading && deals.length === 0 && (
          <EmptyState
            inset
            icon={Package}
            title="No deals in pipeline"
            description="Create a deal room to start tracking stages, parties and documents."
            actionLabel="New deal"
            actionHref="/dashboard/deals/new"
            actionIcon={<Plus size={16} />}
          />
        )}

        {!loading && deals.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Deal</th>
                  <th className="py-2 pr-4 font-medium">Stage</th>
                  <th className="py-2 pr-4 font-medium">Counterparty</th>
                  <th className="py-2 pr-4 font-medium">Value</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const n = stageNumber(deal.currentStage);
                  const status = dealStatus(deal);
                  return (
                    <tr
                      key={deal.id}
                      className="border-b border-border/60 last:border-0 transition-colors hover:bg-secondary/40"
                    >
                      <td className="py-2.5 pr-4 min-w-[200px]">
                        <Link
                          href={`/dashboard/deals/${deal.id}`}
                          className="font-medium capitalize hover:text-gold transition-colors"
                        >
                          {deal.mineralType}
                        </Link>
                        <span className="tnum block text-[11px] font-mono text-muted-foreground">
                          {deal.utid || `#${deal.id}`}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright"
                              style={{ width: `${n * 10}%` }}
                            />
                          </div>
                          <span className="tnum text-xs text-muted-foreground">{n}/10</span>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate py-2.5 pr-4 text-muted-foreground">
                        {counterparties[deal.id] || "—"}
                      </td>
                      <td className="tnum py-2.5 pr-4">
                        {deal.manualPriceUsd != null ? `$${deal.manualPriceUsd.toLocaleString("en-US")}` : "—"}
                      </td>
                      <td className="py-2.5">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
