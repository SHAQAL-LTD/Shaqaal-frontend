"use client";

import React from "react";
import Link from "next/link";
import { Diamond } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.04] bg-dark-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Diamond size={15} className="text-dark-950" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-gradient-gold">SHAQAL</span>
          </Link>
          <Link href="/login" className="text-[12px] text-gray-muted hover:text-white transition">Back to Login</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
          <p className="text-[13px] text-gray-muted">Last updated: August 2026</p>
        </div>
        <div className="space-y-6 text-[14px] leading-relaxed text-gray-300">
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using the Shaqal TradeOS platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">2. Platform Description</h2>
            <p>Shaqal TradeOS is a digital trade facilitation platform for mineral commodity trading across Africa. It provides deal pipeline management, document management, payment processing (fiat and crypto), and compliance verification services.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">3. User Eligibility</h2>
            <p>You must be at least 18 years old and have the legal authority to enter into binding agreements. You must complete KYC verification before engaging in transactions.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">4. Account Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. Shaqal implements rate limiting, JWT authentication, and session management to protect your account.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">5. Payment Terms</h2>
            <p>All payments are processed through integrated payment gateways (Paystack for fiat, USDT for crypto). Platform fees apply as configured. Escrow mechanisms protect both buyers and suppliers during deal settlement.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">6. Dispute Resolution</h2>
            <p>Any disputes shall be resolved through the Platform compliance review process before escalation to external arbitration under applicable trade laws.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">7. Limitation of Liability</h2>
            <p>Shaqal Ltd. provides the Platform on an as-is basis. We are not liable for losses arising from trade transactions between parties, except as explicitly covered by our escrow and payment protection mechanisms.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
