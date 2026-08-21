"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Organization, OrganizationMember } from "@/lib/types";
import { ArrowLeft, Loader2, AlertCircle, BadgeCheck, Users, Globe, Hash, Calendar } from "lucide-react";

const COUNTRIES: Record<string, string> = {
  ng: "Nigeria", gh: "Ghana", tz: "Tanzania", cd: "DR Congo",
  ke: "Kenya", ug: "Uganda", za: "South Africa", xx: "Other",
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true); setError("");
    try {
      const [orgData, membersData] = await Promise.all([
        api.organizations.get(orgId),
        api.organizations.members(orgId),
      ]);
      setOrg(orgData);
      setMembers(membersData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load organization");
    } finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm">
        <ArrowLeft size={16} /> Back to organizations
      </button>

      {loading && <div className="flex items-center justify-center py-16"><Loader2 size={32} className="text-gold-500 animate-spin" /></div>}
      {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3"><AlertCircle size={16} className="text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}

      {org && (
        <>
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-xl shrink-0 shadow-lg shadow-gold-500/20">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{org.name}</h2>
                  {org.verified && <BadgeCheck size={20} className="text-emerald-400" />}
                </div>
                {org.legalName && <p className="text-gray-muted text-sm">{org.legalName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Country</p><p className="font-medium">{COUNTRIES[org.country] || org.country}</p></div>
              <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Registration #</p><p className="font-medium">{org.registrationNumber || "—"}</p></div>
              <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Tax ID</p><p className="font-medium">{org.taxId || "—"}</p></div>
              <div className="bg-dark-800/50 rounded-xl p-4"><p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Created</p><p className="font-medium">{new Date(org.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-dark-800 flex items-center gap-2">
              <Users size={18} className="text-gold-500" />
              <h3 className="font-semibold">Members ({members.length})</h3>
            </div>
            {members.length === 0 ? (
              <div className="p-8 text-center text-gray-muted text-sm">No members yet</div>
            ) : (
              <div className="divide-y divide-dark-800/50">
                {members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-800/30 transition">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-xs shrink-0">
                      {m.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.fullName}</p>
                      <p className="text-xs text-gray-muted truncate">{m.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-800 border border-dark-700 capitalize">{m.roleInOrg?.toLowerCase()}</span>
                    <span className="text-xs text-gray-muted hidden sm:block">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
