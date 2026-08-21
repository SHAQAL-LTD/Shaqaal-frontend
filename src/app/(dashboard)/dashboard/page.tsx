"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Deal, PageResponse } from "@/lib/types";
import {
  FileText,
  Plus,
  ArrowRight,
  Building2,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  STAGE_01_REGISTRATION: "#3b82f6",
  STAGE_02_SUPPLIER_VERIFICATION: "#6366f1",
  STAGE_03_BUYER_ONBOARDING: "#8b5cf6",
  STAGE_04_SPA_SIGNATURE: "#D4AF37",
  STAGE_05_PROOF_OF_FUNDS: "#f59e0b",
  STAGE_06_ADVANCE_PAYMENT: "#f97316",
  STAGE_07_ORIGIN_LOGISTICS: "#06b6d4",
  STAGE_08_SHIPPING: "#14b8a6",
  STAGE_09_DESTINATION_CLEARANCE: "#10b981",
  STAGE_10_SETTLEMENT: "#22c55e",
};

function stageShort(stage: string): string {
  const m = stage.match(/STAGE_(\d+)/);
  return m ? m[1].replace(/^0/, "") : "1";
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
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {greeting}, <span className="text-gradient-gold">{firstName}</span>
          </h1>
          <p className="text-gray-muted mt-2 text-[15px]">Here&apos;s what&apos;s happening with your pipeline today.</p>
        </div>
        <Link
          href="/dashboard/deals/new"
          className="button-gold px-6 py-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-lg shadow-gold-500/20"
        >
          <Plus size={18} strokeWidth={2.5} /> New Deal
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-in">
        {[
          {
            label: "Total Deals",
            value: totalDeals,
            icon: FileText,
            gradient: "from-gold-500/20 to-gold-600/5",
            iconBg: "bg-gold-500/10",
            iconColor: "text-gold-500",
            accent: "bg-gold-500",
          },
          {
            label: "Active Pipeline",
            value: activeDeals.length,
            icon: Clock,
            gradient: "from-blue-500/20 to-blue-600/5",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-400",
            accent: "bg-blue-500",
          },
          {
            label: "Completed",
            value: completedDeals.length,
            icon: CheckCircle,
            gradient: "from-emerald-500/20 to-emerald-600/5",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            accent: "bg-emerald-500",
          },
          {
            label: "Organizations",
            value: "—",
            icon: Building2,
            gradient: "from-violet-500/20 to-violet-600/5",
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-400",
            accent: "bg-violet-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-panel-elevated rounded-2xl p-5 card-hover border-glow cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.iconColor} strokeWidth={1.5} />
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${stat.accent} opacity-60`} />
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight mb-1">
              {loading ? (
                <span className="inline-block w-10 h-9 skeleton rounded-lg" />
              ) : stat.value}
            </p>
            <p className="text-xs text-gray-muted font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-in">
        {[
          { href: "/dashboard/deals/new", label: "Create Deal", desc: "Start a new commodity transaction", icon: Plus, accent: "gold" },
          { href: "/dashboard/organizations", label: "Organizations", desc: "Manage KYB-registered entities", icon: Building2, accent: "blue" },
          { href: "/dashboard/deals", label: "View Pipeline", desc: "Browse all deals and stages", icon: TrendingUp, accent: "emerald" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="glass-panel rounded-2xl p-5 card-hover border-glow group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 transition-colors">
              <action.icon size={20} className="text-gold-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm group-hover:text-gold-500 transition-colors mb-0.5">{action.label}</p>
              <p className="text-xs text-gray-muted leading-relaxed">{action.desc}</p>
            </div>
            <ArrowUpRight size={16} className="text-dark-600 group-hover:text-gold-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
          </Link>
        ))}
      </div>

      {/* ── Recent Deals ─────────────────────────────── */}
      <div className="glass-panel-elevated rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-gold-500" />
            <h3 className="font-semibold text-[15px]">Recent Deals</h3>
          </div>
          <Link
            href="/dashboard/deals"
            className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1.5 group"
          >
            View all
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="text-gold-500 animate-spin" />
          </div>
        )}

        {!loading && deals.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-dark-600" />
            </div>
            <p className="text-gray-muted text-sm">No deals yet. Create your first deal to get started.</p>
          </div>
        )}

        {!loading && deals.length > 0 && (
          <div className="divide-y divide-white/[0.03]">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/dashboard/deals/${deal.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all group"
              >
                {/* Mineral icon with stage color */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase"
                  style={{ background: `${STAGE_COLORS[deal.currentStage] || "#D4AF37"}20`, color: STAGE_COLORS[deal.currentStage] || "#D4AF37" }}
                >
                  {deal.mineralType.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize group-hover:text-gold-500 transition-colors">
                    {deal.mineralType}
                    <span className="text-gray-muted font-normal mx-2">·</span>
                    <span className="text-gray-muted font-normal">{deal.quantityKg.toLocaleString()} kg</span>
                  </p>
                  <p className="text-xs text-gray-muted mt-0.5">
                    {deal.utid || "UTID pending"}
                    <span className="mx-1.5">→</span>
                    <span className="uppercase">{deal.originCountry}</span>
                    <span className="mx-1">→</span>
                    <span className="uppercase">{deal.destinationCountry}</span>
                  </p>
                </div>

                {/* Stage badge */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    background: `${STAGE_COLORS[deal.currentStage] || "#D4AF37"}10`,
                    color: STAGE_COLORS[deal.currentStage] || "#D4AF37",
                    borderColor: `${STAGE_COLORS[deal.currentStage] || "#D4AF37"}20`,
                  }}
                >
                  S{stageShort(deal.currentStage)}
                </div>

                <span className="text-xs text-gray-muted hidden md:block w-24 text-right">
                  {new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>

                <ArrowRight size={14} className="text-dark-600 group-hover:text-gold-500 transition-all group-hover:translate-x-0.5 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
