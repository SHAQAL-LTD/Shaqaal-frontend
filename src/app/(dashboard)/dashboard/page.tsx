"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Deal, PageResponse } from "@/lib/types";
import { Badge, Card, GoldButton, SectionTitle, Stat } from "@/components/ui-kit";
import {
  FileText,
  Plus,
  ArrowRight,
  Building2,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

function stageNumber(stage: string): number {
  const m = stage.match(/STAGE_(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function stageTone(stage: string): "gold" | "green" | "muted" {
  const n = stageNumber(stage);
  if (n >= 10) return "green";
  if (n >= 4 && n <= 6) return "gold";
  return "muted";
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res: PageResponse<Deal> = await api.deals.list(0, 8);
      setDeals(res.content);
      setTotalDeals(res.totalElements);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  const activeDeals = deals.filter((d) => !d.completed);
  const completedDeals = deals.filter((d) => d.completed);

  const greetingTime = new Date().getHours();
  const greeting = greetingTime < 12 ? "Good morning" : greetingTime < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {greeting}, <span className="text-gold">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Here&apos;s what&apos;s happening with your pipeline today.</p>
        </div>
        <Link href="/dashboard/deals/new" className="shrink-0">
          <GoldButton type="button">
            <Plus size={16} strokeWidth={2.5} /> New Deal
          </GoldButton>
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total deals" value={loading ? "…" : String(totalDeals)} />
        <Stat label="Active pipeline" value={loading ? "…" : String(activeDeals.length)} sub="+ live from deal rooms" />
        <Stat label="Completed" value={loading ? "…" : String(completedDeals.length)} sub="UTID-sealed" />
        <Stat label="Organizations" value="—" sub="KYB-registered" />
      </div>

      {/* ── Quick Actions ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/deals/new", label: "Create Deal", desc: "Start a new commodity transaction", icon: Plus },
          { href: "/dashboard/organizations", label: "Organizations", desc: "Manage KYB-registered entities", icon: Building2 },
          { href: "/dashboard/deals", label: "View Pipeline", desc: "Browse all deals and stages", icon: TrendingUp },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="glass rounded-2xl border border-border p-5 transition-colors hover:border-gold/40 group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <action.icon size={20} className="text-gold" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm group-hover:text-gold transition-colors mb-0.5">{action.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
            </div>
            <ArrowUpRight size={16} className="text-muted-foreground/60 group-hover:text-gold transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
          </Link>
        ))}
      </div>

      {/* ── Recent Deals ─────────────────────────────── */}
      <Card>
        <SectionTitle
          title="Recent deals"
          subtitle="Each deal is an isolated, audit-locked room."
          action={
            <Link
              href="/dashboard/deals"
              className="text-xs font-medium text-gold hover:text-gold-bright transition-colors flex items-center gap-1.5 group"
            >
              View all
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          }
        />

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="text-gold animate-spin" />
          </div>
        )}

        {!loading && deals.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No deals yet. Create your first deal to get started.</p>
          </div>
        )}

        {/* Desktop table */}
        {!loading && deals.length > 0 && (
          <div className="mt-5 hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Deal</th>
                  <th className="py-3 pr-4 font-medium">Mineral</th>
                  <th className="py-3 pr-4 font-medium">Quantity</th>
                  <th className="py-3 pr-4 font-medium">Route</th>
                  <th className="py-3 pr-4 font-medium">Stage</th>
                  <th className="py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border/60 transition-colors hover:bg-secondary/40">
                    <td className="py-4 pr-4">
                      <Link href={`/dashboard/deals/${deal.id}`} className="tnum font-mono text-xs font-medium text-gold hover:text-gold-bright">
                        {deal.utid || `#${deal.id}`}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 capitalize">{deal.mineralType}</td>
                    <td className="tnum py-4 pr-4">{deal.quantityKg.toLocaleString()} kg</td>
                    <td className="py-4 pr-4 text-muted-foreground uppercase">
                      {deal.originCountry} <span className="mx-1 text-muted-foreground/60">→</span> {deal.destinationCountry}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge tone={stageTone(deal.currentStage)}>Stage {stageNumber(deal.currentStage)}</Badge>
                    </td>
                    <td className="tnum py-4 text-xs text-muted-foreground">
                      {new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && deals.length > 0 && (
          <div className="mt-5 grid gap-3 lg:hidden">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/dashboard/deals/${deal.id}`}
                className="block rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:border-gold/40"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium capitalize">{deal.mineralType}</p>
                    <p className="tnum mt-1 truncate text-xs font-mono text-gold">
                      {deal.utid || `Deal #${deal.id}`}
                    </p>
                  </div>
                  <Badge tone={stageTone(deal.currentStage)}>Stage {stageNumber(deal.currentStage)}</Badge>
                </div>
                <div className="tnum mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{deal.quantityKg.toLocaleString()} kg</span>
                  <span className="uppercase">{deal.originCountry} → {deal.destinationCountry}</span>
                  <span>{new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* ── Stage legend strip ───────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><Clock size={13} className="text-gold" /> Stage-gated pipeline</span>
        <span className="flex items-center gap-2"><CheckCircle size={13} className="text-success" /> UTID-sealed completions</span>
      </div>
    </div>
  );
}
