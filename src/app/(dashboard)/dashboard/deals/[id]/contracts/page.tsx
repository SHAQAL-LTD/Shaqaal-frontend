"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Deal } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Scale,
  FileSignature,
  Shield,
  Download,
} from "lucide-react";

const CONTRACT_TEMPLATES = [
  {
    id: "NCNDA",
    label: "NCNDA",
    description: "Non-Circumvention, Non-Disclosure, and Confidentiality Agreement",
    icon: Shield,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    roles: ["BROKER", "COMPLIANCE_OFFICER", "SUPPLIER", "BUYER"],
  },
  {
    id: "IMFPA",
    label: "IMFPA",
    description: "Irrevocable Master Fee Protection Agreement",
    icon: Scale,
    color: "text-gold-500 bg-gold-500/10 border-gold-500/20",
    roles: ["BROKER", "COMPLIANCE_OFFICER", "SUPPLIER", "BUYER"],
  },
  {
    id: "SPA",
    label: "SPA",
    description: "Sale and Purchase Agreement",
    icon: FileSignature,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    roles: ["BROKER", "COMPLIANCE_OFFICER", "SUPPLIER", "BUYER"],
  },
];

export default function ContractsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rendering, setRendering] = useState<string | null>(null);

  const canRender = user?.role === "broker" || user?.role === "compliance_officer" || user?.role === "supplier" || user?.role === "buyer";

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  async function loadDeal() {
    setLoading(true);
    setError("");
    try {
      const dealData = await api.deals.get(dealId);
      setDeal(dealData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load deal");
    } finally {
      setLoading(false);
    }
  }

  async function handleRender(templateId: string) {
    setRendering(templateId);
    setError("");
    setSuccess("");
    try {
      const result = await api.contracts.render(dealId, templateId);
      setSuccess(`${templateId} contract rendered and saved to vault: ${result.fileName}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to render ${templateId}`);
    } finally {
      setRendering(null);
    }
  }

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
        <p className="text-gray-muted mt-1">Generate and manage deal contracts from templates.</p>
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold-500 animate-spin" />
        </div>
      )}

      {/* Deal Info */}
      {!loading && deal && (
        <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-gold-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium capitalize">
              {deal.mineralType} · {deal.quantityKg.toLocaleString()} kg
            </p>
            <p className="text-xs text-gray-muted">
              {deal.originCountry.toUpperCase()} → {deal.destinationCountry.toUpperCase()}
              {deal.utid && <span className="ml-2 font-mono text-gold-500">{deal.utid}</span>}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-dark-800 border border-dark-700">
            Stage {deal.currentStage?.match(/STAGE_(\d+)/)?.[1] || "?"}
          </span>
        </div>
      )}

      {/* Contract Templates */}
      {!loading && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-muted uppercase tracking-wider">
            Available Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONTRACT_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isAllowed = canRender && template.roles.includes(user?.role?.toUpperCase() || "");
              const isRendering = rendering === template.id;

              return (
                <div
                  key={template.id}
                  className="glass-panel-elevated rounded-2xl p-6 card-hover flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${template.color.split(" ").slice(1).join(" ")}`}>
                    <Icon size={22} className={template.color.split(" ")[0]} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{template.label}</h4>
                  <p className="text-xs text-gray-muted mb-4 flex-1 leading-relaxed">
                    {template.description}
                  </p>
                  {isAllowed ? (
                    <button
                      onClick={() => handleRender(template.id)}
                      disabled={isRendering}
                      className="button-gold w-full rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {isRendering ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <FileSignature size={16} />
                      )}
                      {isRendering ? "Rendering..." : "Render PDF"}
                    </button>
                  ) : (
                    <div className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-muted bg-dark-800 border border-dark-700">
                      Restricted
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Note */}
      {!loading && (
        <div className="glass-panel rounded-xl p-4">
          <p className="text-xs text-gray-muted leading-relaxed">
            <span className="font-semibold text-gray-300">Note:</span> Contracts are rendered as
            watermarked PDFs and saved to the deal vault. Each rendered contract includes the deal
            UTID, party information, and a timestamp watermark. DocuSign integration will be
            available in Phase 2.
          </p>
        </div>
      )}
    </div>
  );
}
