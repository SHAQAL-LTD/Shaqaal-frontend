"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Diamond,
  Lock,
  Eye,
  Zap,
  Globe,
  BarChart3,
  Users,
  FileCheck,
  Handshake,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "AES-256 encryption for all documents at rest and TLS 1.3 in transit. Your data never touches unprotected storage.",
  },
  {
    icon: Eye,
    title: "Full Audit Trail",
    desc: "Every action is logged with actor, timestamp, and before/after snapshots. Exportable for regulatory compliance.",
  },
  {
    icon: Zap,
    title: "Stage-Gated Pipeline",
    desc: "10-stage compliance pipeline — each gate requires verified documents before the deal can advance.",
  },
  {
    icon: FileCheck,
    title: "Smart Document Vault",
    desc: "Upload, verify, and retrieve deal documents with SHA-256 integrity hashing and role-based access control.",
  },
  {
    icon: Users,
    title: "Multi-Party Collaboration",
    desc: "Suppliers, buyers, brokers, and compliance officers — all working in one audited deal room.",
  },
  {
    icon: Globe,
    title: "AfCFTA Compliant",
    desc: "Built for the African Continental Free Trade Area with per-country compliance profiles and KYB onboarding.",
  },
];

const STAGES = [
  { num: "01", label: "Registration", color: "#3b82f6" },
  { num: "02", label: "Supplier Verification", color: "#6366f1" },
  { num: "03", label: "Buyer Onboarding", color: "#8b5cf6" },
  { num: "04", label: "SPA Signature", color: "#D4AF37" },
  { num: "05", label: "Proof of Funds", color: "#f59e0b" },
  { num: "06", label: "Advance Payment", color: "#f97316" },
  { num: "07", label: "Origin Logistics", color: "#06b6d4" },
  { num: "08", label: "Shipping", color: "#14b8a6" },
  { num: "09", label: "Destination Clearance", color: "#10b981" },
  { num: "10", label: "Settlement", color: "#22c55e" },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "ISO 27001" },
  { icon: Lock, label: "FATF Aligned" },
  { icon: CheckCircle2, label: "SOC 2 Type II" },
  { icon: Globe, label: "GDPR Compliant" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-gold-500 selection:text-dark-950 font-sans relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold-500/[0.07] blur-[150px] rounded-full pointer-events-none" />

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="relative z-50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:shadow-gold-500/30 transition-shadow">
              <Diamond size={18} className="text-dark-950" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Shaqal <span className="text-gradient-gold">TradeOS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-muted">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
            <a href="#trust" className="hover:text-white transition-colors">Trust</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-gray-muted hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="button-gold px-5 py-2.5 rounded-xl text-[14px] font-semibold flex items-center gap-2">
              Get Started <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-500/25 bg-gold-500/[0.04] text-gold-500 text-[11px] font-semibold tracking-widest uppercase">
              <ShieldCheck size={14} strokeWidth={2.5} /> ISO 27001 · FATF AlIGNED
            </div>

            <h1 className="text-5xl md:text-[72px] font-bold tracking-tight leading-[1.05]">
              Move gold, minerals
              <br />
              and trust through
              <br />
              one <span className="text-gradient-gold">audited</span>
              <br />
              <span className="text-gradient-gold">pipeline.</span>
            </h1>

            <p className="text-[16px] text-gray-muted max-w-[520px] leading-relaxed">
              Shaqal TradeOS replaces scattered WhatsApp threads and PDF chains with a single compliance-gated deal room — built for brokers, buyers, and compliance officers working high-value commodity transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/register" className="button-gold px-7 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 text-[15px] shadow-lg shadow-gold-500/20">
                Request platform access <ArrowRight size={17} strokeWidth={2.5} />
              </Link>
              <a href="#features" className="px-7 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 text-[15px] border border-white/10 hover:bg-white/[0.03] transition-colors">
                Explore features
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-dark-900 aspect-[4/3] w-full shadow-2xl shadow-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1588611910243-d8c9735d4653?q=80&w=1200&auto=format&fit=crop"
                alt="Gold Bars Validation"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-dark-900/95 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-2xl w-[360px]">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-gray-muted font-semibold uppercase tracking-widest">Live deal · Stage 8</p>
              </div>
              <p className="font-semibold text-[15px] leading-snug mb-2">Assay verified · Escrow funded · Awaiting compliance release</p>
              <p className="text-gold-500 text-[12px] font-mono tracking-tight">UTID 0x8f31...c47a</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="relative z-10 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-[11px] font-semibold tracking-widest uppercase mb-3">Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Built for trust</h2>
            <p className="text-gray-muted text-[15px] max-w-xl mx-auto">Enterprise-grade security and compliance features designed for high-value commodity transactions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-panel rounded-2xl p-6 card-hover border-glow group">
                <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/15 transition-colors">
                  <f.icon size={20} className="text-gold-500" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ─────────────────────────────────── */}
      <section id="pipeline" className="relative z-10 py-20 md:py-28 bg-dark-900/30">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-[11px] font-semibold tracking-widest uppercase mb-3">Pipeline</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">10 stages. Zero shortcuts.</h2>
            <p className="text-gray-muted text-[15px] max-w-xl mx-auto">Every deal passes through a compliance-gated pipeline. No stage can be skipped — documents must be verified before advancing.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STAGES.map((s) => (
              <div key={s.num} className="glass-panel rounded-xl p-4 text-center card-hover border-glow group">
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
                  style={{ background: `${s.color}20`, color: s.color }}
                >
                  {s.num}
                </div>
                <p className="text-[12px] font-medium leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────── */}
      <section id="trust" className="relative z-10 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="glass-panel-elevated rounded-3xl p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
              {TRUST_ITEMS.map((t) => (
                <div key={t.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                  <t.icon size={16} className="text-gold-500" />
                  <span className="text-[13px] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Enterprise-grade security</h2>
            <p className="text-gray-muted text-[15px] max-w-xl mx-auto mb-8">
              Built with defense-in-depth: encrypted storage, role-based access, idempotent APIs, rate limiting, and full audit logging.
            </p>
            <Link href="/register" className="button-gold px-7 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2.5 text-[15px] shadow-lg shadow-gold-500/20">
              Start building trust <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-sm shadow-gold-500/20">
                <Diamond size={16} className="text-dark-950" strokeWidth={2} />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                Shaqal <span className="text-gradient-gold">TradeOS</span>
              </span>
            </div>
            <p className="text-[13px] text-gray-muted">
              &copy; {new Date().getFullYear()} Shaqal Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[13px] text-gray-muted">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
