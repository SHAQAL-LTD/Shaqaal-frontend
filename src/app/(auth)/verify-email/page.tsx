"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Diamond, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email for the correct link.");
      return;
    }

    api.auth.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
        setTimeout(() => router.push("/dashboard"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed. The link may have expired.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
            <Diamond size={22} className="text-gold-500" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Shaqal <span className="text-gold-500">TradeOS</span></span>
        </Link>

        <div className="glass-panel rounded-2xl p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 size={48} className="animate-spin text-gold-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verifying your email...</h2>
              <p className="text-gray-muted text-sm">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
              <p className="text-gray-muted text-sm mb-6">{message}</p>
              <p className="text-gray-muted text-xs">Redirecting to dashboard in 3 seconds...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
              <p className="text-gray-muted text-sm mb-6">{message}</p>
              <Link href="/dashboard" className="button-gold inline-block rounded-lg px-6 py-3 text-sm font-medium">
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
