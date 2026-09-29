"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, AlertCircle, Check, Loader2 } from "lucide-react";

const MINERALS = [
  { value: "gold", label: "Gold" },
  { value: "diamond", label: "Diamond" },
  { value: "coltan", label: "Coltan (Tantalum)" },
  { value: "copper", label: "Copper" },
  { value: "cobalt", label: "Cobalt" },
  { value: "lithium", label: "Lithium" },
  { value: "bauxite", label: "Bauxite" },
  { value: "iron_ore", label: "Iron Ore" },
  { value: "manganese", label: "Manganese" },
  { value: "tin", label: "Tin" },
];

const COUNTRIES = [
  { code: "ng", name: "Nigeria" }, { code: "gh", name: "Ghana" },
  { code: "tz", name: "Tanzania" }, { code: "cd", name: "DR Congo" },
  { code: "ke", name: "Kenya" }, { code: "ug", name: "Uganda" },
  { code: "za", name: "South Africa" }, { code: "xx", name: "Other" },
];

export default function NewDealPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mineralType, setMineralType] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [purityPercent, setPurityPercent] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [afcftaEligible, setAfcftaEligible] = useState(false);
  const [manualPriceUsd, setManualPriceUsd] = useState("");

  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  async function handleSubmit() {
    setError("");
    if (!mineralType) { setError("Select a mineral type"); return; }
    if (!quantityKg || parseFloat(quantityKg) <= 0) { setError("Enter a valid quantity"); return; }
    if (!purityPercent || parseFloat(purityPercent) <= 0 || parseFloat(purityPercent) > 100) { setError("Purity must be between 0 and 100"); return; }
    if (!originCountry) { setError("Select an origin country"); return; }
    if (!destinationCountry) { setError("Select a destination country"); return; }

    setLoading(true);
    try {
      const deal = await api.deals.create({
        mineralType,
        quantityKg: parseFloat(quantityKg),
        purityPercent: parseFloat(purityPercent),
        originCountry,
        destinationCountry,
        afcftaEligible,
        manualPriceUsd: manualPriceUsd ? parseFloat(manualPriceUsd) : undefined,
      });
      router.push(`/dashboard/deals/${deal.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
      setStep(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 animate-fade-in-up max-w-2xl">
      <Link href="/dashboard/deals" className="flex items-center gap-2 text-gray-muted hover:text-white transition text-sm">
        <ArrowLeft size={16} /> Back to deals
      </Link>

      <p className="max-w-2xl text-sm text-muted-foreground">Create a new commodity transaction — Stage 1 opens on submission.</p>

      {/* Progress */}
      <div className="flex gap-2">{[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold-500" : "bg-dark-700"}`} />))}</div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-lg p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-8">
        {/* Step 0: Mineral & Quantity */}
        {step === 0 && (
          <div className="space-y-5">
            <div><h3 className="text-xl font-bold mb-1">Commodity details</h3><p className="text-gray-muted text-sm">What are you trading?</p></div>
            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">Mineral type</label>
              <select value={mineralType} onChange={(e) => setMineralType(e.target.value)} className={ic}>
                <option value="">Select mineral</option>
                {MINERALS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-muted mb-1.5">Quantity (kg)</label>
                <input type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} placeholder="e.g. 500" className={ic} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-muted mb-1.5">Purity (%)</label>
                <input type="number" value={purityPercent} onChange={(e) => setPurityPercent(e.target.value)} placeholder="e.g. 99.5" step="0.1" className={ic} />
              </div>
            </div>
            <button onClick={() => { if (!mineralType || !quantityKg || !purityPercent) { setError("Fill all fields"); return; } setError(""); setStep(1); }} className="button-gold w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button>
          </div>
        )}

        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-5">
            <div><h3 className="text-xl font-bold mb-1">Trade route</h3><p className="text-gray-muted text-sm">Where is it coming from and going to?</p></div>
            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">Origin country</label>
              <select value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className={ic}>
                <option value="">Select origin</option>
                {COUNTRIES.map((c) => (<option key={`o-${c.code}`} value={c.code}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">Destination country</label>
              <select value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} className={ic}>
                <option value="">Select destination</option>
                {COUNTRIES.map((c) => (<option key={`d-${c.code}`} value={c.code}>{c.name}</option>))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-dark-700 rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-dark-800 transition"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => { if (!originCountry || !destinationCountry) { setError("Select both countries"); return; } setError(""); setStep(2); }} className="flex-1 button-gold rounded-lg py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Pricing */}
        {step === 2 && (
          <div className="space-y-5">
            <div><h3 className="text-xl font-bold mb-1">Review & pricing</h3><p className="text-gray-muted text-sm">Optional pricing and eligibility details.</p></div>
            <div>
              <label className="block text-sm font-medium text-gray-muted mb-1.5">Manual price (USD) — optional</label>
              <input type="number" value={manualPriceUsd} onChange={(e) => setManualPriceUsd(e.target.value)} placeholder="Leave blank to skip" className={ic} />
            </div>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-dark-700 bg-dark-800/50 cursor-pointer hover:border-dark-600 transition">
              <input type="checkbox" checked={afcftaEligible} onChange={(e) => setAfcftaEligible(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-gold-500 focus:ring-gold-500/50 bg-dark-700" />
              <div>
                <p className="text-sm font-medium">AfCFTA Eligible</p>
                <p className="text-xs text-gray-muted">Mark if this trade qualifies under the African Continental Free Trade Area</p>
              </div>
            </label>

            {/* Summary */}
            <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold">Summary</p>
              <div className="flex justify-between text-sm"><span className="text-gray-muted">Mineral</span><span className="font-medium capitalize">{mineralType}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-muted">Quantity</span><span className="font-medium">{parseFloat(quantityKg).toLocaleString()} kg</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-muted">Purity</span><span className="font-medium">{purityPercent}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-muted">Route</span><span className="font-medium uppercase">{originCountry} → {destinationCountry}</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-dark-700 rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-dark-800 transition"><ArrowLeft size={16} /> Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 button-gold rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                Create Deal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
