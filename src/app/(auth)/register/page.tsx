"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/app-shell";
import { GoldButton, inputClass } from "@/components/ui-kit";
import { ArrowRight, ArrowLeft, AlertCircle, Check, Eye, EyeOff } from "lucide-react";

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
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Registration failed"); setStep(0); }
    finally { setLoading(false); }
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
        <div className="flex gap-2 mb-6">{[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-secondary"}`} />))}</div>
        {error && (<div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3 mb-6"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>)}

        {step === 0 && (<div className="grid gap-6">
          <div><p className="text-sm font-medium text-muted-foreground mb-3">I am a...</p>
            <div className="grid grid-cols-1 gap-2">{ROLES.map((r) => (<button key={r.value} type="button" onClick={() => setRole(r.value)} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${role === r.value ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${role === r.value ? "border-gold bg-gold" : "border-border"}`}>{role === r.value && <Check size={12} className="text-primary-foreground" />}</div>
              <div><p className="font-medium text-sm">{r.label}</p><p className="text-xs opacity-70">{r.desc}</p></div>
            </button>))}</div></div>
          <div><label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Country</label><select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}><option value="">Select country</option>{COUNTRIES.map((c) => (<option key={`${c.code}-${c.name}`} value={c.code}>{c.name}</option>))}</select></div>
          <button onClick={() => { if (!role) { setError("Please select a role"); return; } if (!country) { setError("Please select a country"); return; } setError(""); setStep(1); }} className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button>
        </div>)}

        {step === 1 && (<div className="grid gap-5">
          <div><h2 className="text-2xl font-bold mb-1">Your details</h2><p className="text-muted-foreground text-sm">Tell us about yourself.</p></div>
          <div><label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Full name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClass} /></div>
          <div><label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} /></div>
          <div><label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Phone number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={inputClass} /></div>
          <div className="flex gap-3"><button onClick={() => setStep(0)} className="flex-1 border border-border rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-secondary/60 transition"><ArrowLeft size={16} /> Back</button>
            <button onClick={() => { if (!fullName || !email) { setError("Name and email are required"); return; } setError(""); setStep(2); }} className="flex-1 button-gold rounded-xl py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button></div>
        </div>)}

        {step === 2 && (<div className="grid gap-5">
          <div><h2 className="text-2xl font-bold mb-1">Set your password</h2><p className="text-muted-foreground text-sm">Choose a strong password to secure your account.</p></div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Confirm password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" tabIndex={-1}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 border border-border rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-secondary/60 transition"><ArrowLeft size={16} /> Back</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 button-gold rounded-xl py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50">{loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" /> : <>Create account <ArrowRight size={16} strokeWidth={2.5} /></>}</button></div>
        </div>)}
      </div>
    </AuthShell>
  );
}
