"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Diamond, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.auth.forgotPassword(email); setSent(true); }
    catch { setSent(true); } finally { setLoading(false); }
  }

  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors"><Diamond size={22} className="text-gold-500" strokeWidth={1.5} /></div>
          <span className="text-2xl font-bold tracking-tight">Shaqal <span className="text-gold-500">TradeOS</span></span>
        </Link>
        <div className="glass-panel rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-gold-500 mx-auto" />
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="text-gray-muted text-sm">If an account exists with <span className="text-white font-medium">{email}</span>, you will receive a reset link.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-medium transition mt-4"><ArrowLeft size={14} /> Back to sign in</Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-1">Forgot password?</h2>
              <p className="text-gray-muted text-sm mb-6">Enter your email and we will send you a reset link.</p>
              {error && (<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"><AlertCircle size={16} className="text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Email address</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={ic} /></div>
                <button type="submit" disabled={loading} className="button-gold w-full rounded-lg py-3 text-[15px] disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
              </form>
              <Link href="/login" className="flex items-center justify-center gap-2 text-gray-muted hover:text-white text-sm mt-6 transition"><ArrowLeft size={14} /> Back to sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
