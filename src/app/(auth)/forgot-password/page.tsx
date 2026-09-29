"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AuthShell } from "@/components/app-shell";
import { inputClass } from "@/components/ui-kit";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

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

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot password?"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-gold-bright transition-colors hover:text-gold hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <div className="mt-6">
        {sent ? (
          <div className="glass rounded-2xl p-8 text-center" style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
            <CheckCircle size={48} className="text-gold" />
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground text-sm">If an account exists with <span className="text-foreground font-medium">{email}</span>, you will receive a reset link.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-gold hover:text-gold-bright text-sm font-medium transition"><ArrowLeft size={14} /> Back to sign in</Link>
          </div>
        ) : (
          <>
            {error && (<div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3 mb-6"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>)}
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Work email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
              </label>
              <button type="submit" disabled={loading} className="button-gold w-full rounded-xl py-3 text-[15px] disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
            </form>
            <Link href="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm mt-6 transition"><ArrowLeft size={14} /> Back to sign in</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
