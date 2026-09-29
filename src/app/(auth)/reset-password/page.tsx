"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AuthShell } from "@/components/app-shell";
import { inputClass } from "@/components/ui-kit";
import { ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (success) {
    return (
      <div className="mt-6 glass rounded-2xl p-8 text-center" style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
        <CheckCircle size={48} className="text-gold" />
        <h2 className="text-2xl font-bold">Password reset!</h2>
        <p className="text-muted-foreground text-sm">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {error && (<div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3 mb-6"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>)}
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">New password</span>
          <span className="relative block">
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" tabIndex={-1}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirm password</span>
          <span className="relative block">
            <input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" tabIndex={-1}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button type="submit" disabled={loading} className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50">{loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" /> : <>Reset password <ArrowRight size={16} strokeWidth={2.5} /></>}</button>
      </form>
      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Protected by session-bound audit logging.{" "}
        <Link href="/login" className="text-gold hover:text-gold-bright transition">Back to sign in</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset password"
      subtitle="Choose a new password for your TradeOS account."
    >
      <Suspense fallback={<div className="mt-6 glass rounded-2xl p-8 text-center text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
