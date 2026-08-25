"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Users, ArrowLeft, Search, UserCheck, UserX, Loader2 } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  supplier: "bg-emerald-500/10 text-emerald-400",
  buyer: "bg-blue-500/10 text-blue-400",
  broker: "bg-purple-500/10 text-purple-400",
  facilitator: "bg-orange-500/10 text-orange-400",
  compliance_officer: "bg-gold-500/10 text-gold-500",
  admin: "bg-red-500/10 text-red-400",
  financier: "bg-cyan-500/10 text-cyan-400",
};

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = (q?: string) => {
    setLoading(true);
    api.admin
      .listUsers({ search: q || undefined, page: 0, size: 50 })
      .then((data: any) => setUsers(data.content || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    setActionLoading(userId);
    try {
      await api.admin.deactivateUser(userId, "Admin deactivation");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: false } : u)));
    } catch {}
    setActionLoading(null);
  };

  const handleReactivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.admin.reactivateUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: true } : u)));
    } catch {}
    setActionLoading(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/[0.04] text-gray-muted hover:text-white transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-[13px] text-gray-muted">Manage users, roles, and verification status</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <Search size={17} className="text-gray-muted shrink-0" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="flex-1 bg-transparent text-[13px] text-white placeholder:text-dark-500 outline-none" />
        <button type="submit" className="px-4 py-1.5 rounded-xl bg-gold-500 text-dark-950 text-[12px] font-semibold hover:bg-gold-400 transition">Search</button>
      </form>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-dark-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-1/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/3" />
                </div>
                <div className="h-6 w-16 bg-dark-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Users size={28} className="text-dark-600 mx-auto mb-3" />
          <p className="text-[13px] text-gray-muted">No users found</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-[11px] shrink-0">
                {user.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold truncate">{user.fullName}</p>
                  {!user.active && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">Inactive</span>}
                </div>
                <p className="text-[11px] text-gray-muted truncate">{user.email}</p>
              </div>
              <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold " + (ROLE_COLORS[user.role] || "bg-dark-700 text-gray-muted")}>
                {user.role?.replace("_", " ")}
              </span>
              <div className="flex items-center gap-2">
                {actionLoading === user.id ? (
                  <Loader2 size={16} className="text-gold-500 animate-spin" />
                ) : user.active ? (
                  <button onClick={() => handleDeactivate(user.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition" title="Deactivate"><UserX size={16} /></button>
                ) : (
                  <button onClick={() => handleReactivate(user.id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition" title="Reactivate"><UserCheck size={16} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
