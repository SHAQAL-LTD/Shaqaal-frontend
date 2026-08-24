"use client";

import React from "react";
import Link from "next/link";
import { Diamond, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-muted mb-8">Last updated: August 24, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly: name, email, phone, organization details, KYC documents (government IDs, bank statements, proof of funds), and trade-related data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: (a) provide and improve the Platform; (b) verify your identity (KYC); (c) process payments and settlements; (d) send trade-related notifications; (e) comply with legal requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Document Storage</h2>
            <p>KYC documents and trade documents are encrypted at rest (AES-256-GCM) and stored in secure cloud storage. Documents are accessible only to authorized parties involved in the specific deal.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share information only: (a) with deal parties as necessary for trade execution; (b) with payment processors for transaction processing; (c) as required by law or regulatory authorities.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, access controls, audit logging, and regular security assessments. However, no system is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion of your account; (d) export your data. Contact privacy@shaqal.com for requests.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. Trade records are retained for 7 years to comply with financial regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@shaqal.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
