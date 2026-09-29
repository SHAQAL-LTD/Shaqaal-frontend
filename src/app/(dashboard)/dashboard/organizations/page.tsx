"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Organization, PageResponse } from "@/lib/types";
import { Building2, Plus, AlertCircle, Loader2, ArrowRight, BadgeCheck, X } from "lucide-react";

const COUNTRIES: Record<string, string> = {
  ng: "Nigeria", gh: "Ghana", tz: "Tanzania", cd: "DR Congo",
  ke: "Kenya", ug: "Uganda", za: "South Africa", xx: "Other",
};

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("");

  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  useEffect(() => { loadOrgs(); }, []);

  async function loadOrgs() {
    setLoading(true); setError("");
    try {
      const res: PageResponse<Organization> = await api.organizations.list(0, 50);
      setOrgs(res.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load organizations");
    } finally { setLoading(false); }
  }

  async function handleCreate() {
    setCreateError(""); setCreating(true);
    try {
      const org = await api.organizations.create({ name, legalName: legalName || undefined, country });
      setOrgs([org, ...orgs]);
      setShowCreate(false); setName(""); setLegalName(""); setCountry("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create organization");
    } finally { setCreating(false); }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">Manage your KYB-registered entities and counterparties.</p>
        <button onClick={() => setShowCreate(true)} className="button-gold shrink-0 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> New Organization
        </button>
      </div>

      {error && <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-lg p-3"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>}

      {loading && <div className="flex items-center justify-center py-16"><Loader2 size={32} className="text-gold-500 animate-spin" /></div>}

      {!loading && orgs.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Building2 size={48} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No organizations</h3>
          <p className="text-gray-muted text-sm mb-6">Create an organization to start trading on the platform.</p>
          <button onClick={() => setShowCreate(true)} className="button-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm font-medium"><Plus size={16} /> Create Organization</button>
        </div>
      )}

      {!loading && orgs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <Link key={org.id} href={`/dashboard/organizations/${org.id}`} className="glass-panel rounded-xl p-6 hover:bg-dark-800/50 hover:border-gold-500/20 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-sm shrink-0">{org.name.slice(0, 2).toUpperCase()}</div>
                {org.verified && <BadgeCheck size={16} className="text-success shrink-0" />}
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-gold-500 transition">{org.name}</h3>
              {org.legalName && <p className="text-xs text-gray-muted truncate mb-2">{org.legalName}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-muted">{COUNTRIES[org.country] || org.country}</span>
                <ArrowRight size={14} className="text-dark-600 group-hover:text-gold-500 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">New Organization</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-muted hover:text-white transition"><X size={20} /></button>
            </div>
            {createError && <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-lg p-3 mb-4"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{createError}</p></div>}
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Trading name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ashanti Madalali Coop" className={ic} /></div>
              <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Legal name</label><input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Optional registered name" className={ic} /></div>
              <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Country *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={ic}>
                  <option value="">Select country</option>
                  {Object.entries(COUNTRIES).map(([code, label]) => (<option key={code} value={code}>{label}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 border border-dark-700 rounded-lg py-3 text-sm hover:bg-dark-800 transition">Cancel</button>
                <button onClick={handleCreate} disabled={creating || !name || !country} className="flex-1 button-gold rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : null} Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
