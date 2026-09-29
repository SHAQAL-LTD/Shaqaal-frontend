"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/app-shell";
import { GoldButton, inputClass } from "@/components/ui-kit";
import { ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Welcome back"
      subtitle="Enter your credentials to access your deal rooms and approvals."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-gold-bright transition-colors hover:text-gold hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <div className="mt-6">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
            <AlertCircle size={16} className="shrink-0 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Work email
            </span>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
              <Link
                href="/forgot-password"
                className="normal-case tracking-normal text-gold transition-colors hover:text-gold-bright"
              >
                Forgot password?
              </Link>
            </span>
            <span className="relative block">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <GoldButton type="submit" disabled={loading} className="mt-2 w-full py-3 text-base">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" />
            ) : (
              <>
                Sign in securely
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </GoldButton>
        </form>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Protected by device attestation and session-bound audit logging. Every action is
          recorded against your operator identity.
        </p>
      </div>
    </AuthShell>
  );
}
