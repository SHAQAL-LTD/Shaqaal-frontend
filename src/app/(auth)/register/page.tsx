"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Diamond, ArrowRight, ArrowLeft, AlertCircle, Check } from "lucide-react";

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
  { code: "xx", name: "South Africa" }, { code: "xx", name: "Other" },
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
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors"><Diamond size={22} className="text-gold-500" strokeWidth={1.5} /></div>
          <span className="text-2xl font-bold tracking-tight">Shaqal <span className="text-gold-500">TradeOS</span></span>
        </Link>
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex gap-2 mb-6">{[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold-500" : "bg-dark-700"}`} />))}</div>
          {error && (<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"><AlertCircle size={16} className="text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}

          {step === 0 && (<div className="space-y-6">
            <div><h2 className="text-2xl font-bold mb-1">Create your account</h2><p className="text-gray-muted text-sm">Choose your role to get started.</p></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-3">I am a...</label>
              <div className="grid grid-cols-1 gap-2">{ROLES.map((r) => (<button key={r.value} type="button" onClick={() => setRole(r.value)} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${role === r.value ? "border-gold-500 bg-gold-500/10 text-white" : "border-dark-700 bg-dark-800 text-gray-muted hover:border-dark-600"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${role === r.value ? "border-gold-500 bg-gold-500" : "border-dark-600"}`}>{role === r.value && <Check size={12} className="text-dark-950" />}</div>
                <div><p className="font-medium text-sm">{r.label}</p><p className="text-xs opacity-70">{r.desc}</p></div>
              </button>))}</div></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Country</label><select value={country} onChange={(e) => setCountry(e.target.value)} className={ic}><option value="">Select country</option>{COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}</select></div>
            <button onClick={() => { if (!role) { setError("Please select a role"); return; } if (!country) { setError("Please select a country"); return; } setError(""); setStep(1); }} className="button-gold w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button>
          </div>)}

          {step === 1 && (<div className="space-y-5">
            <div><h2 className="text-2xl font-bold mb-1">Your details</h2><p className="text-gray-muted text-sm">Tell us about yourself.</p></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Full name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={ic} /></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={ic} /></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Phone number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={ic} /></div>
            <div className="flex gap-3"><button onClick={() => setStep(0)} className="flex-1 border border-dark-700 rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-dark-800 transition"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => { if (!fullName || !email) { setError("Name and email are required"); return; } setError(""); setStep(2); }} className="flex-1 button-gold rounded-lg py-3 flex items-center justify-center gap-2 text-[15px]">Continue <ArrowRight size={16} strokeWidth={2.5} /></button></div>
          </div>)}

          {step === 2 && (<div className="space-y-5">
            <div><h2 className="text-2xl font-bold mb-1">Set your password</h2><p className="text-gray-muted text-sm">Choose a strong password to secure your account.</p></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={ic} /></div>
            <div><label className="block text-sm font-medium text-gray-muted mb-1.5">Confirm password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={ic} /></div>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 border border-dark-700 rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] hover:bg-dark-800 transition"><ArrowLeft size={16} /> Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 button-gold rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50">{loading ? <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" /> : <>Create account <ArrowRight size={16} strokeWidth={2.5} /></>}</button></div>
          </div>)}
        </div>
        <p className="text-center text-sm text-gray-muted mt-6">Already have an account? <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition">Sign in</Link></p>
      </div>
    </div>
  );
}
