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
} from "lucide-react";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res: PageResponse<Deal> = await api.deals.list(0, 5);
      setDeals(res.content);
      setTotalDeals(res.totalElements);
    } catch {
      // silently fail — dashboard is best-effort
    } finally {
      setLoading(false);
    }
  }

  const activeDeals = deals.filter((d) => !d.completed);
  const completedDeals = deals.filter((d) => d.completed);

  const stats = [
    { label: "Total Deals", value: totalDeals, icon: FileText, color: "text-gold-500" },
    { label: "Active", value: activeDeals.length, icon: Clock, color: "text-blue-400" },
    { label: "Completed", value: completedDeals.length, icon: CheckCircle, color: "text-emerald-400" },
  ];

  const greetingTime = new Date().getHours();
  const greeting = greetingTime < 12 ? "Good morning" : greetingTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{greeting}, {user?.fullName?.split(" ")[0] || "there"}</h2>
        <p className="text-gray-muted mt-1">Here&apos;s what&apos;s happening with your pipeline.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-muted font-semibold uppercase tracking-wider">{stat.label}</p>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-3xl font-bold tabular-nums">
              {loading ? <div className="w-8 h-8 bg-dark-800 rounded-lg animate-pulse" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/deals/new" className="glass-panel rounded-xl p-5 hover:bg-dark-800/50 hover:border-gold-500/20 transition group">
          <Plus size={20} className="text-gold-500 mb-3" />
          <p className="font-semibold text-sm group-hover:text-gold-500 transition">New Deal</p>
          <p className="text-xs text-gray-muted mt-1">Start a new commodity transaction</p>
        </Link>
        <Link href="/dashboard/organizations" className="glass-panel rounded-xl p-5 hover:bg-dark-800/50 hover:border-gold-500/20 transition group">
          <Building2 size={20} className="text-gold-500 mb-3" />
          <p className="font-semibold text-sm group-hover:text-gold-500 transition">Organizations</p>
          <p className="text-xs text-gray-muted mt-1">Manage your KYB-registered entities</p>
        </Link>
        <Link href="/dashboard/deals" className="glass-panel rounded-xl p-5 hover:bg-dark-800/50 hover:border-gold-500/20 transition group">
          <TrendingUp size={20} className="text-gold-500 mb-3" />
          <p className="font-semibold text-sm group-hover:text-gold-500 transition">View Pipeline</p>
          <p className="text-xs text-gray-muted mt-1">Browse all deals and stages</p>
        </Link>
      </div>

      {/* Recent Deals */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          <h3 className="font-semibold">Recent Deals</h3>
          <Link href="/dashboard/deals" className="text-xs text-gold-500 hover:text-gold-400 transition flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-gold-500 animate-spin" /></div>
        )}

        {!loading && deals.length === 0 && (
          <div className="p-8 text-center text-gray-muted text-sm">No deals yet. Create your first deal to get started.</div>
        )}

        {!loading && deals.length > 0 && (
          <div className="divide-y divide-dark-800/50">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/dashboard/deals/${deal.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-800/30 transition group">
                <div className="h-10 w-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-xs shrink-0 capitalize">{deal.mineralType.slice(0, 2)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize group-hover:text-gold-500 transition">{deal.mineralType} — {deal.quantityKg.toLocaleString()} kg</p>
                  <p className="text-xs text-gray-muted">{deal.utid || "UTID pending"} · {deal.originCountry.toUpperCase()} → {deal.destinationCountry.toUpperCase()}</p>
                </div>
                <span className="text-xs text-gray-muted hidden sm:block">{new Date(deal.createdAt).toLocaleDateString()}</span>
                <ArrowRight size={14} className="text-dark-600 group-hover:text-gold-500 transition shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
