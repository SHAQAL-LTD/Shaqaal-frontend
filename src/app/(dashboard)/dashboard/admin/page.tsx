"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Loader2, AlertCircle, Search, UserX, UserCheck, BadgeCheck, X } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      loadData();
      loadStats();
    }
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.admin.listUsers(search || undefined);
      setUsers(res.content || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const s = await api.admin.stats();
      setStats(s);
    } catch {}
  }

  useEffect(() => {
    const timer = setTimeout(() => { if (isAdmin) loadData(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-muted">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-xs text-gray-muted mb-1">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-xs text-gray-muted mb-1">Active Users</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.activeUsers}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-xs text-gray-muted mb-1">Platform Fees</p>
            <p className="text-2xl font-bold text-gold-500">${stats.totalPlatformFees}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:border-gold-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-gold-500" /></div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-muted py-8">No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-sm font-bold text-gold-500">
                  {u.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-[11px] text-gray-muted">{u.email} &middot; {u.role} &middot; {u.country}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${u.emailVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                  {u.emailVerified ? "Verified" : "Unverified"}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${u.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {u.active ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-1">
                  {u.active ? (
                    <button onClick={async () => { await api.admin.deactivateUser(u.id); loadData(); loadStats(); }}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Deactivate">
                      <UserX size={14} />
                    </button>
                  ) : (
                    <button onClick={async () => { await api.admin.reactivateUser(u.id); loadData(); loadStats(); }}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition" title="Reactivate">
                      <UserCheck size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
