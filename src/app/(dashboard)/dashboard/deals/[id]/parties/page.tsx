"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DealParty, Organization, PageResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  X,
  UserPlus,
  Shield,
} from "lucide-react";

const PARTY_ROLES = [
  { value: "SELLER", label: "Seller", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "BUYER", label: "Buyer", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "BROKER", label: "Broker", color: "text-gold-500 bg-gold-500/10 border-gold-500/20" },
  { value: "LOGISTICS", label: "Logistics", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

export default function DealPartiesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;

  const [parties, setParties] = useState<DealParty[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const canManage = user?.role === "broker" || user?.role === "supplier" || user?.role === "buyer" || user?.role === "financier" || user?.role === "facilitator";

  useEffect(() => {
    loadData();
  }, [dealId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [partiesData, orgsData] = await Promise.all([
        api.dealParties.list(dealId),
        api.organizations.list(0, 100).then((r: PageResponse<Organization>) => r.content),
      ]);
      setParties(partiesData);
      setOrgs(orgsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!selectedOrgId || !selectedRole) {
      setError("Select an organization and role");
      return;
    }
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      await api.dealParties.add(dealId, {
        organizationId: selectedOrgId,
        partyRole: selectedRole,
      });
      setSuccess("Party added successfully");
      setShowAdd(false);
      setSelectedOrgId("");
      setSelectedRole("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add party");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(organizationId: string) {
    if (removing) return;
    setRemoving(organizationId);
    setError("");
    setSuccess("");
    try {
      await api.dealParties.remove(dealId, organizationId);
      setSuccess("Party removed");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove party");
    } finally {
      setRemoving(null);
    }
  }

  function getRoleConfig(role: string) {
    return PARTY_ROLES.find((r) => r.value === role) || PARTY_ROLES[0];
  }

  // Filter out orgs already added as parties
  const availableOrgs = orgs.filter(
    (org) => !parties.some((p) => p.organizationId === org.id)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm"
      >
        <ArrowLeft size={16} /> Back to deal
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deal Parties</h2>
          <p className="text-gray-muted mt-1">Manage organizations linked to this deal.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <UserPlus size={16} /> Add Party
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-400 text-sm">{success}</p>
        </div>
      )}

      {/* Add Party Form */}
      {showAdd && (
        <div className="glass-panel-elevated rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Add Party to Deal</h3>
            <button
              onClick={() => {
                setShowAdd(false);
                setSelectedOrgId("");
                setSelectedRole("");
              }}
              className="text-gray-muted hover:text-white transition p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-muted mb-1.5">
              Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
            >
              <option value="">Select organization</option>
              {availableOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.country.toUpperCase()})
                </option>
              ))}
            </select>
            {availableOrgs.length === 0 && (
              <p className="text-xs text-gray-muted mt-1.5">
                No available organizations. Create one first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-muted mb-1.5">
              Party Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARTY_ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                    selectedRole === role.value
                      ? role.color
                      : "border-dark-700 bg-dark-800 text-gray-muted hover:bg-dark-700"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || !selectedOrgId || !selectedRole}
            className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Add Party
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && parties.length === 0 && (
        <div className="glass-panel-elevated rounded-2xl p-12 text-center">
          <Users size={48} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No parties yet</h3>
          <p className="text-gray-muted text-sm mb-6">
            Add organizations as parties to this deal (seller, buyer, broker, logistics).
          </p>
          {canManage && (
            <button
              onClick={() => setShowAdd(true)}
              className="button-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm font-medium"
            >
              <UserPlus size={16} /> Add First Party
            </button>
          )}
        </div>
      )}

      {/* Parties List */}
      {!loading && parties.length > 0 && (
        <div className="space-y-3">
          {parties.map((party) => {
            const roleConfig = getRoleConfig(party.partyRole);
            return (
              <div
                key={party.organizationId}
                className="glass-panel-elevated rounded-2xl p-5 card-hover flex items-center gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-sm shrink-0">
                  {party.organizationName?.slice(0, 2).toUpperCase() || "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {party.organizationName}
                  </p>
                  <p className="text-xs text-gray-muted">
                    Added {new Date(party.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleConfig.color}`}
                >
                  {roleConfig.label}
                </span>
                {canManage && (
                  <button
                    onClick={() => handleRemove(party.organizationId)}
                    disabled={removing === party.organizationId}
                    className="text-gray-muted hover:text-red-400 transition p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                    title="Remove party"
                  >
                    {removing === party.organizationId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
