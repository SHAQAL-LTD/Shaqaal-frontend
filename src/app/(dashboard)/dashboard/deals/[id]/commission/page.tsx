"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CommissionTree, CommissionNode, Organization, PageResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Scale,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Unlock,
  X,
  DollarSign,
  Percent,
  TreePine,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function CommissionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;

  const [tree, setTree] = useState<CommissionTree | null>(null);
  const [nodes, setNodes] = useState<CommissionNode[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [locking, setLocking] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Add node form state
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [allocationType, setAllocationType] = useState("PERCENTAGE");
  const [allocationValue, setAllocationValue] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [buyingSide, setBuyingSide] = useState(false);
  const [parentNodeId, setParentNodeId] = useState("");

  const canManage = user?.role === "broker" || user?.role === "compliance_officer";

  useEffect(() => {
    loadData();
  }, [dealId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // Try to load existing tree
      let treeData: CommissionTree | null = null;
      let nodesData: CommissionNode[] = [];
      try {
        treeData = await api.commissionTree.get(dealId);
        if (treeData) {
          nodesData = await api.commissionNodes.list(treeData.id);
        }
      } catch {
        // No tree exists yet — that's fine
      }

      const orgsData = await api.organizations.list(0, 100).then((r: PageResponse<Organization>) => r.content);

      setTree(treeData);
      setNodes(nodesData);
      setOrgs(orgsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTree() {
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      const newTree = await api.commissionTree.create(dealId);
      setTree(newTree);
      setSuccess("Commission tree created");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create tree");
    } finally {
      setCreating(false);
    }
  }

  async function handleLockTree() {
    if (!tree) return;
    setLocking(true);
    setError("");
    setSuccess("");
    try {
      const locked = await api.commissionTree.lock(tree.id);
      setTree(locked);
      setSuccess("Commission tree locked — allocations are now immutable");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to lock tree");
    } finally {
      setLocking(false);
    }
  }

  async function handleAddNode() {
    if (!tree || !selectedOrgId || !allocationValue) {
      setError("Select an organization and enter an allocation value");
      return;
    }
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      await api.commissionNodes.add(tree.id, {
        organizationId: selectedOrgId,
        parentNodeId: parentNodeId || undefined,
        allocationType,
        allocationValue: parseFloat(allocationValue),
        walletLabel: walletLabel || undefined,
        buyingSide,
      });
      setSuccess("Node added to commission tree");
      setShowAdd(false);
      setSelectedOrgId("");
      setAllocationValue("");
      setWalletLabel("");
      setParentNodeId("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add node");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveNode(nodeId: string) {
    if (!tree || removing) return;
    setRemoving(nodeId);
    setError("");
    setSuccess("");
    try {
      await api.commissionNodes.remove(tree.id, nodeId);
      setSuccess("Node removed");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove node");
    } finally {
      setRemoving(null);
    }
  }

  // Calculate totals
  const totalPercentage = nodes
    .filter((n) => n.allocationType === "PERCENTAGE")
    .reduce((sum, n) => sum + Number(n.allocationValue), 0);
  const totalFlat = nodes
    .filter((n) => n.allocationType === "FLAT")
    .reduce((sum, n) => sum + Number(n.allocationValue), 0);

  // Available orgs (not yet in tree)
  const availableOrgs = orgs.filter(
    (org) => !nodes.some((n) => n.organizationId === org.id)
  );

  // Build tree structure for display
  const rootNodes = nodes.filter((n) => !n.parentNodeId);
  const childNodes = (parentId: string) => nodes.filter((n) => n.parentNodeId === parentId);

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm"
      >
        <ArrowLeft size={16} /> Back to deal
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm text-muted-foreground">IMFPA allocation management for this deal — splits must total exactly 100%.</p>
        <div className="flex gap-2">
          {!tree && canManage && (
            <button
              onClick={handleCreateTree}
              disabled={creating}
              className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create Tree
            </button>
          )}
          {tree && !tree.locked && canManage && (
            <>
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} /> Add Node
              </button>
              <button
                onClick={handleLockTree}
                disabled={locking || totalPercentage > 100}
                className="border border-gold/40 bg-gold/10 text-gold-bright px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-gold/20 transition disabled:opacity-50"
              >
                {locking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Lock Tree
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-lg p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/40 rounded-lg p-3">
          <CheckCircle size={16} className="text-success shrink-0" />
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* No Tree Yet */}
      {!loading && !tree && (
        <div className="glass-panel-elevated rounded-2xl p-12 text-center">
          <Scale size={48} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No commission tree</h3>
          <p className="text-gray-muted text-sm mb-6">
            Create a commission tree to define how fees are allocated between parties.
          </p>
          {canManage && (
            <button
              onClick={handleCreateTree}
              disabled={creating}
              className="button-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
              Create Commission Tree
            </button>
          )}
        </div>
      )}

      {/* Add Node Form */}
      {showAdd && tree && (
        <div className="glass-panel-elevated rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Add Allocation Node</h3>
            <button
              onClick={() => {
                setShowAdd(false);
                setSelectedOrgId("");
                setAllocationValue("");
                setWalletLabel("");
                setParentNodeId("");
              }}
              className="text-gray-muted hover:text-white transition p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">
                Parent Node (optional)
              </label>
              <select
                value={parentNodeId}
                onChange={(e) => setParentNodeId(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
              >
                <option value="">Root level (no parent)</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.organizationName} ({n.allocationType === "PERCENTAGE" ? `${n.allocationValue}%` : `$${n.allocationValue}`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">
                Allocation Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAllocationType("PERCENTAGE")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition ${
                    allocationType === "PERCENTAGE"
                      ? "bg-gold-500/10 text-gold-500 border-gold-500/20"
                      : "border-dark-700 bg-dark-800 text-gray-muted hover:bg-dark-700"
                  }`}
                >
                  <Percent size={14} /> Percentage
                </button>
                <button
                  onClick={() => setAllocationType("FLAT")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition ${
                    allocationType === "FLAT"
                      ? "bg-gold-500/10 text-gold-500 border-gold-500/20"
                      : "border-dark-700 bg-dark-800 text-gray-muted hover:bg-dark-700"
                  }`}
                >
                  <DollarSign size={14} /> Flat USD
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">
                {allocationType === "PERCENTAGE" ? "Percentage (%)" : "Amount (USD)"}
              </label>
              <input
                type="number"
                value={allocationValue}
                onChange={(e) => setAllocationValue(e.target.value)}
                placeholder={allocationType === "PERCENTAGE" ? "e.g. 15" : "e.g. 5000"}
                step="0.01"
                min="0"
                max={allocationType === "PERCENTAGE" ? "100" : undefined}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">
                Wallet Label (optional)
              </label>
              <input
                type="text"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
                placeholder="e.g. Broker Fee"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-dark-700 bg-dark-800/50 cursor-pointer hover:border-dark-600 transition">
            <input
              type="checkbox"
              checked={buyingSide}
              onChange={(e) => setBuyingSide(e.target.checked)}
              className="w-4 h-4 rounded border-dark-600 text-gold-500 focus:ring-gold-500/50 bg-dark-700"
            />
            <div>
              <p className="text-sm font-medium">Buying Side</p>
              <p className="text-xs text-gray-muted">Mark if this allocation is on the buying side</p>
            </div>
          </label>

          <button
            onClick={handleAddNode}
            disabled={adding || !selectedOrgId || !allocationValue}
            className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Node
          </button>
        </div>
      )}

      {/* Tree Stats */}
      {!loading && tree && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Status</p>
            <div className="flex items-center gap-2">
              {tree.locked ? (
                <span className="flex items-center gap-1 text-gold-bright text-sm font-semibold">
                  <Lock size={14} /> Locked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-success text-sm font-semibold">
                  <Unlock size={14} /> Open
                </span>
              )}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Total %</p>
            <p className={`text-lg font-bold ${totalPercentage > 100 ? "text-danger" : totalPercentage === 100 ? "text-success" : "text-white"}`}>
              {totalPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Total Flat</p>
            <p className="text-lg font-bold text-gold-500">${totalFlat.toLocaleString()}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Nodes</p>
            <p className="text-lg font-bold">{nodes.length}</p>
          </div>
        </div>
      )}

      {/* Warning if over 100% */}
      {!loading && tree && !tree.locked && totalPercentage > 100 && (
        <div className="flex items-center gap-2 bg-gold/10 border border-gold/40 rounded-lg p-3">
          <AlertCircle size={16} className="text-gold-bright shrink-0" />
          <p className="text-gold-bright text-sm">
            Percentage allocations exceed 100%. Reduce before locking.
          </p>
        </div>
      )}

      {/* Nodes Tree */}
      {!loading && tree && nodes.length > 0 && (
        <div className="glass-panel-elevated rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <TreePine size={18} className="text-gold-500" />
            <h3 className="font-semibold">Allocation Tree</h3>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {rootNodes.map((node) => (
              <React.Fragment key={node.id}>
                {/* Root node */}
                <div className="px-6 py-4 hover:bg-white/[0.02] transition flex items-center gap-4">
                  <div className="w-6" /> {/* spacer for tree indent */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{node.organizationName}</p>
                      {node.walletLabel && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-dark-800 border border-dark-700 text-gray-muted">
                          {node.walletLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        node.allocationType === "PERCENTAGE"
                          ? "bg-chart-2/10 text-chart-2 border border-chart-2/40"
                          : "bg-success/10 text-success border border-success/40"
                      }`}>
                        {node.allocationType === "PERCENTAGE" ? (
                          <><Percent size={10} /> {node.allocationValue}%</>
                        ) : (
                          <><DollarSign size={10} /> {node.allocationValue}</>
                        )}
                      </span>
                      {node.buyingSide && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-chart-1/10 text-chart-1 border border-chart-1/40">
                          Buying Side
                        </span>
                      )}
                    </div>
                  </div>
                  {!tree.locked && canManage && (
                    <button
                      onClick={() => handleRemoveNode(node.id)}
                      disabled={removing === node.id}
                      className="text-gray-muted hover:text-danger transition p-2 rounded-lg hover:bg-danger/10 disabled:opacity-50"
                    >
                      {removing === node.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>

                {/* Children */}
                {childNodes(node.id).map((child) => (
                  <div key={child.id} className="px-6 py-3 hover:bg-white/[0.02] transition flex items-center gap-4 bg-dark-800/20">
                    <div className="w-6 flex justify-center">
                      <div className="w-px h-4 bg-dark-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-300">{child.organizationName}</p>
                        {child.walletLabel && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-dark-800 border border-dark-700 text-gray-muted">
                            {child.walletLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          child.allocationType === "PERCENTAGE"
                            ? "bg-chart-2/10 text-chart-2 border border-chart-2/40"
                            : "bg-success/10 text-success border border-success/40"
                        }`}>
                          {child.allocationType === "PERCENTAGE" ? (
                            <><Percent size={10} /> {child.allocationValue}%</>
                          ) : (
                            <><DollarSign size={10} /> {child.allocationValue}</>
                          )}
                        </span>
                        {child.buyingSide && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-chart-1/10 text-chart-1 border border-chart-1/40">
                            Buying Side
                          </span>
                        )}
                      </div>
                    </div>
                    {!tree.locked && canManage && (
                      <button
                        onClick={() => handleRemoveNode(child.id)}
                        disabled={removing === child.id}
                        className="text-gray-muted hover:text-danger transition p-2 rounded-lg hover:bg-danger/10 disabled:opacity-50"
                      >
                        {removing === child.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
