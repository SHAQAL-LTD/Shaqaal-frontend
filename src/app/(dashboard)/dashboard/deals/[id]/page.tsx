"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, advanceErrorMessage, apiErrorMessage } from "@/lib/api";
import type { Deal, DealBlockers } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Badge, Card, GoldButton, SectionTitle } from "@/components/ui-kit";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  ClipboardList,
  Scale,
  ChevronRight,
  CheckCircle,
  FileSignature,
  Check,
  Circle,
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
  const [blockers, setBlockers] = useState<DealBlockers | null>(null);
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
      // Gate analysis is advisory — a failure there must never block the page.
      const [d, blk] = await Promise.all([
        api.deals.get(dealId),
        api.deals.blockers(dealId).catch(() => null),
      ]);
      setDeal(d);
      setBlockers(blk);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Failed to load deal"));
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
      setError(advanceErrorMessage(err));
    } finally {
      setAdvancing(false);
      // Re-run the gate analysis so the inline note reflects the real outcome.
      api.deals.blockers(deal.id).then(setBlockers).catch(() => {});
    }
  }

  const currentIdx = deal ? stageIndex(deal.currentStage) : 0;
  const current = currentIdx + 1;
  // Proactively list what's missing before the user clicks Advance and hits a gate.
  const missing = blockers?.blocked ? blockers.blockers.filter((b) => !b.ok) : [];

  const quickLinks = [
    { href: `/dashboard/deals/${dealId}/parties`, label: "Parties", icon: Users, desc: "Manage deal organizations" },
    { href: `/dashboard/deals/${dealId}/documents`, label: "Documents", icon: FileText, desc: "Deal vault & uploads" },
    { href: `/dashboard/deals/${dealId}/contracts`, label: "Contracts", icon: FileSignature, desc: "Generate NCNDA, IMFPA, SPA" },
    { href: `/dashboard/deals/${dealId}/audit`, label: "Audit Trail", icon: ClipboardList, desc: "Stage transition history" },
    { href: `/dashboard/deals/${dealId}/commission`, label: "Commission", icon: Scale, desc: "Allocation tree" },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up max-w-5xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
        <ArrowLeft size={16} /> Back to deals
      </button>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-gold animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Deal Info */}
      {deal && (
        <>
          {/* Header + Pipeline */}
          <Card>
            <SectionTitle
              title={deal.mineralType.charAt(0).toUpperCase() + deal.mineralType.slice(1)}
              subtitle={deal.utid || "UTID pending"}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  {deal.completed && (
                    <Badge tone="green">
                      <CheckCircle size={12} /> Completed
                    </Badge>
                  )}
                  {canAdvance && !deal.completed && (
                    <GoldButton onClick={handleAdvance} disabled={advancing}>
                      {advancing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                      Advance Stage
                    </GoldButton>
                  )}
                </div>
              }
            />

            {/* Stage Progress — DESIGN 10-stage pipeline */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pipeline</p>
                <p className="tnum text-xs text-gold font-medium">Stage {current} of {STAGES.length} — {STAGES[currentIdx]?.label}</p>
              </div>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-10">
                {STAGES.map((s, i) => {
                  const n = i + 1;
                  const done = n < current;
                  const active = n === current;
                  return (
                    <li key={s.key} className="flex items-start gap-3 lg:flex-col lg:gap-2">
                      <span
                        className={
                          "tnum grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold " +
                          (done
                            ? "border-success/50 bg-success/15 text-success"
                            : active
                              ? "border-gold bg-gold/20 text-gold-bright shadow-[0_0_24px_-4px_var(--gold)]"
                              : "border-border bg-secondary text-muted-foreground")
                        }
                      >
                        {done ? <Check className="h-4 w-4" /> : active ? <Circle className="h-2.5 w-2.5 fill-current" /> : n}
                      </span>
                      <span
                        className={
                          "text-xs leading-snug " +
                          (active ? "text-gold-bright" : done ? "text-foreground" : "text-muted-foreground")
                        }
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Proactive stage-gate note — why the next advance can't happen yet. */}
            {missing.length > 0 && (
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                  Can&apos;t advance yet — missing requirements
                </p>
                <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  {missing.map((b) => (
                    <li key={b.gate} className="flex gap-1.5">
                      <AlertCircle size={13} className="mt-0.5 shrink-0 text-gold" />
                      <span>{b.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deal Details Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Quantity</p>
                <p className="tnum text-lg font-bold">{deal.quantityKg.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Purity</p>
                <p className="tnum text-lg font-bold">{deal.purityPercent}%</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Origin</p>
                <p className="text-lg font-bold uppercase">{deal.originCountry}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Destination</p>
                <p className="text-lg font-bold uppercase">{deal.destinationCountry}</p>
              </div>
            </div>

            {deal.manualPriceUsd && (
              <div className="mt-4 bg-secondary/40 rounded-xl p-4 inline-block">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Manual Price</p>
                <p className="tnum text-lg font-bold text-gold">${deal.manualPriceUsd.toLocaleString()}</p>
              </div>
            )}
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="glass rounded-2xl p-5 border border-border hover:border-gold/40 transition group"
              >
                <link.icon size={20} className="text-gold mb-3" strokeWidth={1.5} />
                <p className="font-semibold text-sm mb-1 group-hover:text-gold transition">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Stage Detail */}
          <Card>
            <SectionTitle title="Current stage details" />
            <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-gold/5 border border-gold/10">
              <div className="tnum w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                {STAGES[currentIdx]?.short}
              </div>
              <div>
                <p className="font-semibold">{STAGES[currentIdx]?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {currentIdx === STAGES.length - 1
                    ? "This is the final stage — deal will be marked as completed"
                    : `Next stage: ${STAGES[currentIdx + 1]?.label}`}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
