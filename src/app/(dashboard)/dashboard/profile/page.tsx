"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Shield,
  Globe,
  Calendar,
  BadgeCheck,
  Pencil,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const COUNTRY_NAMES: Record<string, string> = {
  ng: "Nigeria", gh: "Ghana", tz: "Tanzania", cd: "DR Congo",
  ke: "Kenya", ug: "Uganda", za: "South Africa", xx: "Other",
};

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier", buyer: "Buyer", broker: "Broker",
  financier: "Financier", compliance_officer: "Compliance Officer",
  facilitator: "Facilitator", admin: "Administrator",
};

const VERIFICATION_COLORS: Record<string, string> = {
  VERIFIED: "text-success bg-success/10 border-success/40",
  PENDING: "text-gold-bright bg-gold/10 border-gold/40",
  UNVERIFIED: "text-muted-foreground bg-secondary border-border",
  REJECTED: "text-danger bg-danger/10 border-danger/40",
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  async function handleSave() {
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.me.patch({ fullName: fullName.trim(), phone: phone.trim() });
      await refreshUser();
      setEditing(false);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setEditing(false); setError("");
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-muted">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const initials = user.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";
  const verStatus = user.verificationStatus || "UNVERIFIED";

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up max-w-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">View and manage your operator identity, verification tier and account information.</p>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="button-gold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Pencil size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="border border-border px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-secondary/60 transition">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="button-gold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-primary-foreground/70 border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/40 rounded-xl p-3">
          <CheckCircle size={16} className="text-success shrink-0" />
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Avatar + Name Card */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-b from-gold-bright to-gold flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0 shadow-lg shadow-gold/20">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-semibold truncate">{user.fullName}</h3>
            <p className="text-muted-foreground text-sm truncate">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${VERIFICATION_COLORS[verStatus] || VERIFICATION_COLORS.UNVERIFIED}`}>
                <BadgeCheck size={12} />
                {verStatus}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-bright border border-gold/40">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-1">
          {/* Full Name */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Full Name</p>
              {editing ? (
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${ic} !bg-dark-900 !border-dark-600 py-2`} />
              ) : (
                <p className="text-white font-medium truncate">{user.fullName}</p>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Email</p>
              <p className="text-white font-medium truncate">{user.email}</p>
            </div>
            <span className="text-[10px] text-gray-muted bg-dark-800 px-2 py-1 rounded-full border border-dark-700">Read only</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Phone</p>
              {editing ? (
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={`${ic} !bg-dark-900 !border-dark-600 py-2`} />
              ) : (
                <p className="text-white font-medium truncate">{user.phone || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Role (read-only) */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <Shield size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Role</p>
              <p className="text-white font-medium">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
            <span className="text-[10px] text-gray-muted bg-dark-800 px-2 py-1 rounded-full border border-dark-700">Assigned at signup</span>
          </div>

          {/* Country (read-only) */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <Globe size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Country</p>
              <p className="text-white font-medium">{COUNTRY_NAMES[user.country] || user.country}</p>
            </div>
          </div>

          {/* Member Since (read-only) */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">Member Since</p>
              <p className="text-white font-medium">{joinedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account ID */}
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-2">Account ID</p>
        <p className="text-sm text-gray-400 font-mono break-all">{user.id}</p>
      </div>
    </div>
  );
}
