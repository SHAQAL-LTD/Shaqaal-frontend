"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui-kit";
import {
  Users, Activity, Shield, Server, Search,
  UserCheck, UserX, TrendingUp, Database, FileText,
  Loader2, CheckCircle2, RefreshCw, BarChart3,
} from "lucide-react";

type Tab = "overview" | "users" | "audit" | "health";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "users", label: "Users", icon: Users },
  { key: "audit", label: "Audit Trail", icon: Activity },
  { key: "health", label: "System Health", icon: Server },
];

const ROLE_BADGES: Record<string, string> = {
  ADMIN: "bg-danger/10 text-danger border-danger/40",
  BUYER: "bg-chart-2/10 text-chart-2 border-chart-2/40",
  SUPPLIER: "bg-success/10 text-success border-success/40",
  BROKER: "bg-chart-1/10 text-chart-1 border-chart-1/40",
  FACILITATOR: "bg-chart-4/10 text-chart-4 border-chart-4/40",
  FINANCIER: "bg-secondary/60 text-muted-foreground border-border",
  COMPLIANCE_OFFICER: "bg-gold-500/10 text-gold-500 border-gold-500/20",
};

const STAGE_LABELS: Record<string, string> = {
  STAGE_01_REGISTRATION: "Registration", STAGE_02_BROKER_ASSIGNMENT: "Broker",
  STAGE_03_BUYER_REGISTRATION: "Buyer", STAGE_04_SPA_SIGNATURE: "SPA",
  STAGE_05_PROOF_OF_FUNDS: "Proof of Funds", STAGE_06_ADVANCE_PAYMENT: "Payment",
  STAGE_07_ORIGIN_LOGISTICS: "Logistics", STAGE_08_SHIPPING: "Shipping",
  STAGE_09_DESTINATION_CLEARANCE: "Clearance", STAGE_10_SETTLEMENT: "Settlement",
};

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (tab === "overview") {
      api.admin.stats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
    } else if (tab === "users") {
      api.admin.listUsers(undefined, undefined, 0, 100).then((d: any) => setUsers(d.content || [])).catch(() => setUsers([])).finally(() => setLoading(false));
    } else if (tab === "audit") {
      api.admin.auditTrail(0, 50).then(setAudit).catch(() => setAudit([])).finally(() => setLoading(false));
    } else if (tab === "health") {
      api.admin.systemHealth().then(setHealth).catch(() => setHealth(null)).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try { const d: any = await api.admin.listUsers(search, undefined, 0, 50); setUsers(d.content || []); } catch { setUsers([]); }
    setLoading(false);
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Deactivate this user?")) return;
    setActionLoading(userId);
    try { await api.admin.deactivateUser(userId, "Admin deactivation"); setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: false } : u)); } catch {}
    setActionLoading(null);
  };

  const handleReactivate = async (userId: string) => {
    setActionLoading(userId);
    try { await api.admin.reactivateUser(userId); setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: true } : u)); } catch {}
    setActionLoading(null);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20">
          <Shield size={20} className="text-dark-950" />
        </div>
        <div>
          <p className="text-[13px] text-gray-muted">Internal system management for Shaqal staff</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 glass-panel rounded-2xl w-fit max-w-full">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all " + (tab === t.key ? "bg-gold-500/10 text-gold-500 border border-gold-500/15" : "text-gray-muted hover:text-white hover:bg-white/[0.03] border border-transparent")}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {loading && <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-gold-500 animate-spin" /></div>}

      {!loading && tab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, bg: "bg-chart-2/10", fg: "text-chart-2" },
              { label: "Active Users", value: stats.activeUsers, icon: UserCheck, bg: "bg-success/10", fg: "text-success" },
              { label: "Verified", value: stats.verifiedUsers, icon: CheckCircle2, bg: "bg-gold-500/10", fg: "text-gold-500" },
              { label: "Total Deals", value: stats.totalDeals, icon: FileText, bg: "bg-chart-1/10", fg: "text-chart-1" },
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={"w-9 h-9 rounded-xl " + s.bg + " flex items-center justify-center"}><s.icon size={18} className={s.fg} /></div>
                  <p className="text-[11px] text-gray-muted font-medium uppercase tracking-wider">{s.label}</p>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-gold-500" /> Users by Role</h3>
            <div className="space-y-3">
              {(stats.usersByRole || []).map((r: any) => {
                const pct = stats.totalUsers > 0 ? (r.count / stats.totalUsers) * 100 : 0;
                return (
                  <div key={r.role} className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-muted w-36 truncate">{r.role?.replace(/_/g, " ")}</span>
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: pct + "%" }} />
                    </div>
                    <span className="text-[12px] font-mono text-gray-muted w-8 text-right">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-gold-500" /> Deals by Stage</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(stats.dealsByStage || []).map((s: any) => (
                <div key={s.stage} className="bg-dark-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-[10px] text-gray-muted mt-1">{STAGE_LABELS[s.stage] || s.stage?.replace("STAGE_", "S")}</p>
                </div>
              ))}
              {(!stats.dealsByStage || stats.dealsByStage.length === 0) && <p className="text-[12px] text-gray-muted col-span-5 text-center py-4">No deals</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-success" /><p className="text-[12px] text-gray-muted font-medium">New Users (30d)</p></div>
              <p className="text-2xl font-bold">{stats.recentUsers}</p>
            </div>
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2"><FileText size={16} className="text-chart-2" /><p className="text-[12px] text-gray-muted font-medium">New Deals (30d)</p></div>
              <p className="text-2xl font-bold">{stats.recentDeals}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === "users" && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <Search size={17} className="text-gray-muted shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search by name or email..." className="flex-1 bg-transparent text-[13px] text-white placeholder:text-dark-500 outline-none" />
            <button onClick={handleSearch} className="px-4 py-1.5 rounded-xl bg-gold-500 text-dark-950 text-[12px] font-semibold hover:bg-gold-400 transition">Search</button>
          </div>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="glass-panel rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.02] transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-[11px] shrink-0">
                  {user.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold truncate">{user.fullName}</p>
                    {!user.active && <span className="text-[9px] text-danger bg-danger/10 px-1.5 py-0.5 rounded-full font-semibold">INACTIVE</span>}
                    {user.emailVerified && <CheckCircle2 size={12} className="text-success shrink-0" />}
                  </div>
                  <p className="text-[11px] text-gray-muted truncate">{user.email}</p>
                </div>
                <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold border " + (ROLE_BADGES[user.role] || "bg-dark-700 text-gray-muted")}>{user.role?.replace(/_/g, " ")}</span>
                <p className="text-[11px] text-gray-muted hidden md:block">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</p>
                <div className="flex items-center gap-1">
                  {actionLoading === user.id ? <Loader2 size={14} className="text-gold-500 animate-spin" />
                    : user.active ? <button onClick={() => handleDeactivate(user.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition" title="Deactivate"><UserX size={14} /></button>
                    : <button onClick={() => handleReactivate(user.id)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition" title="Reactivate"><UserCheck size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === "audit" && (
        <div className="space-y-2">
          {audit.length === 0 && (
            <EmptyState
              icon={Activity}
              title="No audit events"
              description="Platform activity will appear here as it happens."
            />
          )}
          {audit.map((event: any) => (
            <div key={event.id} className="glass-panel rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center shrink-0 mt-0.5"><Activity size={14} className="text-gold-500" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold">{event.action}</span>
                  <span className="text-[10px] text-gray-muted bg-dark-700 px-2 py-0.5 rounded-full">{event.entity_type}</span>
                </div>
                <p className="text-[11px] text-gray-muted mt-1">{event.actor_name || "System"} {event.actor_email ? "(" + event.actor_email + ")" : ""}</p>
              </div>
              <p className="text-[10px] text-dark-500 whitespace-nowrap shrink-0">{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : ""}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "health" && health && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><Server size={20} className="text-success" /></div>
              <div>
                <h3 className="text-[14px] font-semibold">System Status</h3>
                <p className="text-[12px] text-success flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /> All Systems Operational</p>
              </div>
            </div>
          </div>
          {health.database && (
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2"><Database size={16} className="text-gold-500" /> Database</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[11px] text-gray-muted mb-1">Status</p><p className="text-[13px] font-semibold text-success">{health.database.status}</p></div>
                <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[11px] text-gray-muted mb-1">Type</p><p className="text-[13px] font-semibold">{health.database.type}</p></div>
                <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[11px] text-gray-muted mb-1">Size</p><p className="text-[13px] font-semibold">{health.database.sizeBytes ? (health.database.sizeBytes / 1024 / 1024).toFixed(1) + " MB" : "N/A"}</p></div>
              </div>
              <div className="mt-3 bg-dark-800/50 rounded-xl p-4"><p className="text-[11px] text-gray-muted mb-1">Tables</p><p className="text-[13px] font-semibold">{health.database.tables}</p></div>
            </div>
          )}
          <button onClick={() => { setLoading(true); api.admin.systemHealth().then(setHealth).finally(() => setLoading(false)); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 text-[12px] text-gray-muted hover:text-white hover:bg-white/[0.04] transition">
            <RefreshCw size={14} /> Refresh Health Check
          </button>
        </div>
      )}
    </div>
  );
}
