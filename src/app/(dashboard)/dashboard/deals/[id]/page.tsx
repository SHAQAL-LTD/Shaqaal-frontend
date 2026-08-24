"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Deal } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  Shield,
  ClipboardList,
  Scale,
  ChevronRight,
  Package,
  Globe,
  CheckCircle,
  Lock,
  FileSignature,
} from "lucide-react";

const STAGES = [
  { key: "STAGE_01_REGISTRATION", label: "Registration", short: "01" },
  { key: "STAGE_02_SUPPLIER_VERIFICATION", label: "Supplier Verification", short: "02" },
  { key: "STAGE_03_BUYER_ONBOARDING", label: "Buyer Onboarding", short: "03" },
  { key: "STAGE_04_SPA_SIGNATURE", label: "SPA Signature", short: "04" },
  { key: "STAGE_05_PROOF_OF_FUNDS", label: "Proof of Funds", short: "05" },
  { key: "STAGE_06_ADVANCE_PAYMENT", label: "Advance Payment", short: "06" },
  { key: "STAGE_07_ORIGIN_LOGISTICS", label: "Origin Logistics", short: "07" },
  { key: "STAGE_08_SHIPPING", label: "Shipping", short: "08" },
  { key: "STAGE_09_DESTINATION_CLEARANCE", label: "Destination Clearance", short: "09" },
  { key: "STAGE_10_SETTLEMENT", label: "Settlement", short: "10" },
];

function stageIndex(stage: string): number {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return idx >= 0 ? idx : 0;
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);

  const canAdvance = user?.role === "broker" || user?.role === "compliance_officer";

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  async function loadDeal() {
    setLoading(true);
    setError("");
    try {
      const d = await api.deals.get(dealId);
      setDeal(d);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load deal");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvance() {
    if (!deal || advancing) return;
    setAdvancing(true);
    try {
      const updated = await api.deals.advance(deal.id, "Stage advanced via dashboard");
      setDeal(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to advance deal");
    } finally {
      setAdvancing(false);
    }
  }

  const currentIdx = deal ? stageIndex(deal.currentStage) : 0;
  const progress = (currentIdx / (STAGES.length - 1)) * 100;

  const quickLinks = [
    { href: `/dashboard/deals/${dealId}/parties`, label: "Parties", icon: Users, desc: "Manage deal organizations" },
    { href: `/dashboard/deals/${dealId}/documents`, label: "Documents", icon: FileText, desc: "Deal vault & uploads" },
    { href: `/dashboard/deals/${dealId}/contracts`, label: "Contracts", icon: FileSignature, desc: "Generate NCNDA, IMFPA, SPA" },
    { href: `/dashboard/deals/${dealId}/audit`, label: "Audit Trail", icon: ClipboardList, desc: "Stage transition history" },
    { href: `/dashboard/deals/${dealId}/commission`, label: "Commission", icon: Scale, desc: "Allocation tree" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 max-w-5xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm">
        <ArrowLeft size={16} /> Back to deals
      </button>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Deal Info */}
      {deal && (
        <>
          {/* Header Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold tracking-tight capitalize">{deal.mineralType}</h2>
                  {deal.completed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={12} /> Completed
                    </span>
                  )}
                </div>
                <p className="text-gold-500 font-mono text-sm">{deal.utid || "UTID pending"}</p>
              </div>
              {canAdvance && !deal.completed && (
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {advancing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  Advance Stage
                </button>
              )}
            </div>

            {/* Stage Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-muted font-semibold uppercase tracking-wider">Pipeline Progress</p>
                <p className="text-xs text-gold-500 font-medium">Stage {currentIdx + 1} of {STAGES.length}</p>
              </div>
              <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="hidden md:flex gap-1">
                {STAGES.map((s, i) => (
                  <div
                    key={s.key}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      i < currentIdx ? "bg-gold-500" : i === currentIdx ? "bg-gold-400 animate-pulse" : "bg-dark-700"
                    }`}
                    title={s.label}
                  />
                ))}
              </div>
              <div className="hidden md:flex justify-between mt-1">
                {STAGES.map((s, i) => (
                  <span key={s.key} className={`text-[9px] ${i === currentIdx ? "text-gold-500 font-semibold" : "text-dark-600"}`}>{s.short}</span>
                ))}
              </div>
            </div>

            {/* Deal Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Quantity</p>
                <p className="text-lg font-bold">{deal.quantityKg.toLocaleString()} <span className="text-sm font-normal text-gray-muted">kg</span></p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Purity</p>
                <p className="text-lg font-bold">{deal.purityPercent}%</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Origin</p>
                <p className="text-lg font-bold uppercase">{deal.originCountry}</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Destination</p>
                <p className="text-lg font-bold uppercase">{deal.destinationCountry}</p>
              </div>
            </div>

            {deal.manualPriceUsd && (
              <div className="mt-4 bg-dark-800/50 rounded-xl p-4 inline-block">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider font-semibold mb-1">Manual Price</p>
                <p className="text-lg font-bold text-gold-500">${deal.manualPriceUsd.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="glass-panel rounded-xl p-5 hover:bg-dark-800/50 hover:border-gold-500/20 transition group"
              >
                <link.icon size={20} className="text-gold-500 mb-3" strokeWidth={1.5} />
                <p className="font-semibold text-sm mb-1 group-hover:text-gold-500 transition">{link.label}</p>
                <p className="text-xs text-gray-muted">{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Stage Detail */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Current Stage Details</h3>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-sm">
                {STAGES[currentIdx]?.short}
              </div>
              <div>
                <p className="font-semibold">{STAGES[currentIdx]?.label}</p>
                <p className="text-xs text-gray-muted">
                  {currentIdx === STAGES.length - 1
                    ? "This is the final stage — deal will be marked as completed"
                    : `Next stage: ${STAGES[currentIdx + 1]?.label}`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
