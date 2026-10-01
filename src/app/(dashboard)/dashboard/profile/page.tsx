"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/utils";
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
  Copy,
  Check,
  Fingerprint,
  KeyRound,
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

// Keys are UPPER-CASED API values (`MeResponse` serialises enums lower-case).
const VERIFICATION_COLORS: Record<string, string> = {
  APPROVED: "text-success bg-success/10 border-success/40",
  VERIFIED: "text-success bg-success/10 border-success/40",
  PENDING: "text-gold-bright bg-gold/10 border-gold/40",
  PENDING_REVIEW: "text-gold-bright bg-gold/10 border-gold/40",
  INFO_REQUESTED: "text-chart-1 bg-chart-1/10 border-chart-1/40",
  UNVERIFIED: "text-muted-foreground bg-secondary border-border",
  REJECTED: "text-danger bg-danger/10 border-danger/40",
};

/** One field row inside a profile section. */
function FieldRow({
  icon: Icon,
  label,
  children,
  trailing,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-800/50 transition">
      <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gray-muted shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-muted uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        {children}
      </div>
      {trailing}
    </div>
  );
}

/** A grouped card with a section header (e.g. "Identity", "Account & Access"). */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-6 sm:p-8">
      <div className="mb-2 flex items-center gap-2 border-b border-dark-700/70 pb-3">
        <Icon size={14} className="text-gold shrink-0" />
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gold">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

const readOnlyChip = (
  <span className="text-[10px] text-gray-muted bg-dark-800 px-2 py-1 rounded-full border border-dark-700">
    Read only
  </span>
);

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  // `null` = untouched → derived from the profile (name normalised to title
  // case). Only user input replaces the derived value, so the fields stay in
  // sync with the auth context without any setState-in-effect.
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const nameValue = fullName ?? titleCase(user?.fullName);
  const phoneValue = phone ?? user?.phone ?? "";

  const ic = "w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition";

  async function handleSave() {
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.me.patch({ fullName: nameValue.trim(), phone: phoneValue.trim() });
      // Reset to derived values so the refreshed profile drives the fields.
      setFullName(null); setPhone(null);
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
    setFullName(null);
    setPhone(null);
    setEditing(false); setError("");
  }

  async function copyAccountId() {
    if (!user?.id) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(user.id);
      ok = true;
    } catch {
      // Fallback for contexts where the async Clipboard API is unavailable
      // (older browsers / non-secure origins).
      try {
        const ta = document.createElement("textarea");
        ta.value = user.id;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
  const verStatus = user.verificationStatus || "unverified";
  const statusKey = verStatus.toUpperCase();
  const statusLabel = titleCase(verStatus); // "pending" → "Pending", "pending_review" → "Pending Review"

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up max-w-3xl">
      {/* Page intro + edit controls */}
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

      {/* Compact header — avatar + status badges only (the name lives once, in the form below) */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-b from-gold-bright to-gold flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0 shadow-lg shadow-gold/20">
            {initials}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${VERIFICATION_COLORS[statusKey] || VERIFICATION_COLORS.UNVERIFIED}`}>
              <BadgeCheck size={12} />
              {statusLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-bright border border-gold/40">
              {ROLE_LABELS[user.role] || titleCase(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Identity ─────────────────────────────────────────── */}
      <Section icon={User} title="Identity">
        {/* Full Name — the one place the name is shown and edited */}
        <FieldRow icon={User} label="Full Name">
          {editing ? (
            <input type="text" value={nameValue} onChange={(e) => setFullName(e.target.value)} className={`${ic} !bg-dark-900 !border-dark-600 py-2`} />
          ) : (
            <p className="text-white font-medium truncate">{nameValue}</p>
          )}
        </FieldRow>

        {/* Email (read-only) */}
        <FieldRow icon={Mail} label="Email" trailing={readOnlyChip}>
          <p className="text-white font-medium truncate">{user.email}</p>
        </FieldRow>

        {/* Phone */}
        <FieldRow icon={Phone} label="Phone">
          {editing ? (
            <input type="tel" value={phoneValue} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={`${ic} !bg-dark-900 !border-dark-600 py-2`} />
          ) : (
            <p className="text-white font-medium truncate">{user.phone || "Not provided"}</p>
          )}
        </FieldRow>
      </Section>

      {/* ── Account & Access ─────────────────────────────────── */}
      <Section icon={KeyRound} title="Account & Access">
        {/* Role (read-only) */}
        <FieldRow
          icon={Shield}
          label="Role"
          trailing={<span className="text-[10px] text-gray-muted bg-dark-800 px-2 py-1 rounded-full border border-dark-700">Assigned at signup</span>}
        >
          <p className="text-white font-medium">{ROLE_LABELS[user.role] || titleCase(user.role)}</p>
        </FieldRow>

        {/* Country (read-only) */}
        <FieldRow icon={Globe} label="Country">
          <p className="text-white font-medium">{COUNTRY_NAMES[user.country] || user.country}</p>
        </FieldRow>

        {/* Member Since (read-only) */}
        <FieldRow icon={Calendar} label="Member Since">
          <p className="text-white font-medium">{joinedDate}</p>
        </FieldRow>

        {/* Account ID + copy-to-clipboard */}
        <FieldRow
          icon={Fingerprint}
          label="Account ID"
          trailing={
            <button
              type="button"
              onClick={copyAccountId}
              title="Copy account ID"
              aria-label="Copy account ID"
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-dark-700 bg-dark-800 px-2.5 py-2 text-[11px] font-medium text-gray-muted hover:border-gold-500/50 hover:text-gold-bright transition"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-success" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          }
        >
          <p className="text-sm text-gray-400 font-mono break-all">{user.id}</p>
        </FieldRow>
      </Section>
    </div>
  );
}
