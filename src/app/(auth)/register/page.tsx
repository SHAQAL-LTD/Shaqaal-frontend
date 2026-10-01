"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/app-shell";
import { Field, GoldButton, inputClass, selectClass } from "@/components/ui-kit";
import { apiErrorMessage } from "@/lib/api";
import { ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";

const ROLES = [
  { value: "supplier", label: "Supplier", desc: "I supply commodities" },
  { value: "buyer", label: "Buyer", desc: "I purchase commodities" },
  { value: "broker", label: "Broker", desc: "I facilitate deals" },
  { value: "financier", label: "Financier", desc: "I provide funding" },
  { value: "facilitator", label: "Facilitator", desc: "I coordinate logistics" },
];
const COUNTRIES = [
  { code: "ng", name: "Nigeria" }, { code: "gh", name: "Ghana" },
  { code: "tz", name: "Tanzania" }, { code: "cd", name: "DR Congo" },
  { code: "ke", name: "Kenya" }, { code: "ug", name: "Uganda" },
  { code: "za", name: "South Africa" }, { code: "xx", name: "Other" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");

  async function handleSubmit() {
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try { await register({ fullName, email, phone, password, role, country }); router.push("/dashboard"); }
    catch (err: unknown) { setError(apiErrorMessage(err, "Registration failed")); setStep(0); }
    finally { setLoading(false); }
  }

  function goStep1() {
    if (!fullName.trim() || !email.trim()) { setError("Name and email are required"); return; }
    if (!role) { setError("Please select your role"); return; }
    if (!country) { setError("Please select a country"); return; }
    setError("");
    setStep(1);
  }

  return (
    <AuthShell
      eyebrow="Apply for access"
      title="Create your trade account"
      subtitle="Registration is reviewed by a compliance officer before activation."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-gold-bright transition-colors hover:text-gold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="mt-6">
        {/* 2-step progress */}
        <div className="flex gap-2 mb-6">
          {[0, 1].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-secondary"}`} />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3 mb-6">
            <AlertCircle size={16} className="text-danger shrink-0" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Step 1 — Your details (incl. role & country) */}
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ammar B. Haruna"
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Work email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Phone number">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="I am a" hint={ROLES.find((r) => r.value === role)?.desc}>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={`${c.code}-${c.name}`} value={c.code}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2 mt-2">
              <GoldButton type="button" onClick={goStep1} className="w-full py-3 text-base">
                Continue <ArrowRight className="h-4 w-4" />
              </GoldButton>
            </div>
          </div>
        )}

        {/* Step 2 — Password */}
        {step === 1 && (
          <div className="grid gap-4">
            <Field label="Password" hint="Min. 8 characters">
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </Field>
            <Field label="Confirm password">
              <span className="relative block">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </Field>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setStep(0); setError(""); }}
                className="flex-1 border border-border rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-secondary/60 transition"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <GoldButton
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 text-[15px]"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" />
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </GoldButton>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
