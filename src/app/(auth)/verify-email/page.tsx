"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, Diamond } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email for the correct link.");
      return;
    }
    api.auth
      .verifyEmail(token)
      .then(() => { setStatus("success"); setMessage("Your email has been verified successfully!"); })
      .catch((err: any) => { setStatus("error"); setMessage(err?.detail || "Verification failed. The link may have expired."); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20">
            <Diamond size={18} className="text-dark-950" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-gradient-gold">SHAQAL</span>
        </Link>

        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-gold-500 animate-spin mx-auto" />
            <p className="text-[14px] text-gray-muted">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold">Email Verified!</h2>
            <p className="text-[13px] text-gray-muted">{message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 text-dark-950 font-semibold text-[13px] hover:bg-gold-400 transition">Go to Login</Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold">Verification Failed</h2>
            <p className="text-[13px] text-gray-muted">{message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 text-dark-950 font-semibold text-[13px] hover:bg-gold-400 transition">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="text-gold-500 animate-spin" size={32} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
