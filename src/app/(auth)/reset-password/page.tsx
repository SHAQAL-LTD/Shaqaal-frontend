"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Diamond, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!token) { setError("Invalid or missing reset token"); return; }
    setLoading(true);
    try { await api.auth.resetPassword(token, password); setSuccess(true); setTimeout(() => router.push("/login"), 3000); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Reset failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="glass-panel rounded-2xl p-8">
      {success ? (
        <div className="text-center space-y-4"><CheckCircle size={48} className="text-gold-500 mx-auto" /><h2 className="text-2xl font-bold">Password reset!</h2><p className="text-gray-muted text-sm">Redirecting you to sign in...</p></div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-1">Reset password</h2><p className="text-gray-muted text-sm mb-6">Enter your new password below.</p>
          {error && (<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"><AlertCircle size={16} className="text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">New password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={ic} /></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Confirm password</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={ic} /></div>
            <button type="submit" disabled={loading} className="button-gold w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50">{loading ? "Resetting..." : <>Reset password <ArrowRight size={16} strokeWidth={2.5} /></>}</button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors"><Diamond size={22} className="text-gold-500" strokeWidth={1.5} /></div>
          <span className="text-2xl font-bold tracking-tight">Shaqal <span className="text-gold-500">TradeOS</span></span>
        </Link>
        <Suspense fallback={<div className="glass-panel rounded-2xl p-8 text-center text-gray-muted">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
