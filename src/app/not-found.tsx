"use client";

import React from "react";
import Link from "next/link";
import { Diamond, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center relative z-10 animate-fade-in-up">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:shadow-gold-500/30 transition-shadow">
            <Diamond size={20} className="text-dark-950" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Shaqal <span className="text-gradient-gold">TradeOS</span>
          </span>
        </Link>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter text-gradient-gold opacity-20 select-none">
            404
          </h1>
          <div className="-mt-16 md:-mt-24">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Page not found</h2>
            <p className="text-gray-muted text-[15px] max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="button-gold px-6 py-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-lg shadow-gold-500/20"
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl flex items-center gap-2.5 text-sm font-medium border border-white/10 hover:bg-white/[0.03] transition-colors"
          >
            Go to Dashboard <ArrowRight size={15} />
          </Link>
        </div>

        {/* Decorative line */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="w-12 h-px bg-dark-700" />
          <Diamond size={12} className="text-dark-600" />
          <div className="w-12 h-px bg-dark-700" />
        </div>
      </div>
    </div>
  );
}
