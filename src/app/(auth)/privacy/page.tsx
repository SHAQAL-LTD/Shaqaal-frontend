"use client";

import React from "react";
import Link from "next/link";
import { Diamond } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-[13px] text-gray-muted">Last updated: August 2026</p>
        </div>
        <div className="space-y-6 text-[14px] leading-relaxed text-gray-300">
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">1. Information We Collect</h2>
            <p>We collect account information (name, email, phone, country), KYC documents, deal and transaction data, and usage analytics to provide and improve our services.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">2. How We Use Your Information</h2>
            <p>Your data is used for account management, transaction processing, compliance verification (KYC/AML), platform security, and communication about your deals and account.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">3. Data Sharing</h2>
            <p>We do not sell your personal data. Data may be shared with payment processors (Paystack), compliance partners, and as required by law. All sharing is governed by strict data processing agreements.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">4. Data Security</h2>
            <p>We employ industry-standard security measures including encrypted data at rest and in transit, JWT authentication, rate limiting, and regular security audits.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">5. Data Retention</h2>
            <p>Account data is retained while your account is active. Transaction records are retained for 7 years as required by financial regulations. You may request data deletion by contacting support.</p>
          </section>
          <section className="glass-panel rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">6. Your Rights</h2>
            <p>You have the right to access, correct, export, and delete your personal data. Contact our compliance team at compliance@shaqal.com to exercise these rights.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
