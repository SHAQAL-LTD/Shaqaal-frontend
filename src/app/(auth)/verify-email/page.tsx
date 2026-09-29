"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/app-shell";

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
      <div className="w-full max-w-md glass rounded-2xl p-8 text-center space-y-6 shadow-2xl shadow-black/40">
        <div className="flex justify-center">
          <Brand />
        </div>

        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-gold animate-spin mx-auto" />
            <p className="text-[14px] text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/40 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-lg font-bold">Email Verified!</h2>
            <p className="text-[13px] text-muted-foreground">{message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-b from-gold-bright to-gold text-primary-foreground font-semibold text-[13px] transition hover:-translate-y-0.5">Go to Login</Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/40 flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold">Verification Failed</h2>
            <p className="text-[13px] text-muted-foreground">{message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-secondary/60 text-foreground font-semibold text-[13px] transition hover:border-gold/50 hover:text-gold-bright">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="text-gold animate-spin" size={32} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
