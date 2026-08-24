"use client";

import React from "react";
import Link from "next/link";
import { Diamond, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-950 p-4">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-muted hover:text-white mb-8 transition">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Diamond size={28} className="text-gold-500" strokeWidth={1.5} />
          <span className="text-2xl font-bold">Shaqal <span className="text-gold-500">TradeOS</span></span>
        </div>

        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-muted mb-8">Last updated: August 24, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Shaqal TradeOS ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>Shaqal TradeOS is a digital trade operating system for African mineral commodities. The Platform facilitates deal management, document handling, compliance verification, and trade settlement between buyers, suppliers, brokers, and financiers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
            <p>You must provide accurate, complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years of age to use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. KYC and Compliance</h2>
            <p>All users must complete Know Your Customer (KYC) verification before engaging in trade activities. The Platform reserves the right to suspend accounts that fail verification or violate compliance requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Payments and Settlements</h2>
            <p>All payments are processed through integrated payment gateways (Paystack for fiat, blockchain for USDT). The Platform charges a platform fee on completed transactions. Users agree to the payment terms displayed at the time of transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Prohibited Activities</h2>
            <p>Users may not: (a) use the Platform for illegal activities; (b) manipulate deal information; (c) circumvent KYC requirements; (d) attempt to access other users' accounts; (e) upload malicious content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>The Platform is provided "as is" without warranties. Shaqal TradeOS is not liable for any losses arising from trade transactions between users. The Platform facilitates connections but does not guarantee trade outcomes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Governing Law</h2>
            <p>These Terms are governed by the laws of Nigeria. Disputes shall be resolved through arbitration in Lagos, Nigeria.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
