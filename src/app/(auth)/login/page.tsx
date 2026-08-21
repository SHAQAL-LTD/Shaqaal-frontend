"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Diamond, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
            <Diamond size={22} className="text-gold-500" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Shaqal <span className="text-gold-500">TradeOS</span>
          </span>
        </Link>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-muted text-sm mb-8">Sign in to access the TradeOS pipeline.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-muted mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-muted hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm text-gold-500 hover:text-gold-400 transition">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button-gold w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold-500 hover:text-gold-400 font-medium transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
