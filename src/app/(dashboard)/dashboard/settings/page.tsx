"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/utils";
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  Mail,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier", buyer: "Buyer", broker: "Broker",
  financier: "Financier", compliance_officer: "Compliance Officer",
  facilitator: "Facilitator", admin: "Administrator",
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChangePassword() {
    if (!user?.email) return;
    setLoading(true); setError("");
    try {
      await api.auth.forgotPassword(user.email);
      setPasswordSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up max-w-3xl">
      {/* Header */}
      <p className="max-w-2xl text-sm text-muted-foreground">Manage your account preferences and security.</p>

      {/* Account Card */}
      <div className="glass-panel-elevated rounded-2xl p-6 card-hover">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-2xl shrink-0 shadow-lg shadow-gold-500/25">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{titleCase(user?.fullName)}</h2>
            <p className="text-sm text-gray-muted">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gold-500/10 text-gold-500 border border-gold-500/20">
                {ROLE_LABELS[user?.role || ""] || user?.role}
              </span>
              {user?.country && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-dark-800 text-gray-muted border border-dark-700 uppercase">
                  {user.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-muted uppercase tracking-wider mb-3">Profile</h3>
        <div className="glass-panel rounded-2xl divide-y divide-white/[0.03] overflow-hidden">
          <Link href="/dashboard/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition group">
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center shrink-0">
              <User size={18} className="text-chart-2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-gold-500 transition">Edit profile</p>
              <p className="text-xs text-gray-muted">Update your name, phone, and photo</p>
            </div>
            <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-500 transition shrink-0" />
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition group">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-gold-500 transition">Email address</p>
              <p className="text-xs text-gray-muted">{user?.email}</p>
            </div>
            <span className="text-[10px] text-gray-muted bg-dark-800 px-2 py-1 rounded-full border border-dark-700">Verified</span>
          </Link>
        </div>
      </div>

      {/* Security Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-muted uppercase tracking-wider mb-3">Security</h3>
        <div className="glass-panel rounded-2xl overflow-hidden">
          {!showChangePassword ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition group w-full text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-gold-500 transition">Change password</p>
                <p className="text-xs text-gray-muted">We&apos;ll send a secure reset link to your email</p>
              </div>
              <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-500 transition shrink-0" />
            </button>
          ) : (
            <div className="p-6 space-y-4">
              {passwordSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-success" />
                  </div>
                  <h4 className="text-lg font-bold mb-1">Check your email</h4>
                  <p className="text-sm text-gray-muted mb-4">
                    Password reset link sent to <span className="text-white font-medium">{user?.email}</span>.
                    Click the link in the email to set a new password.
                  </p>
                  <button
                    onClick={() => { setShowChangePassword(false); setPasswordSent(false); }}
                    className="text-sm text-gold-500 hover:text-gold-400 font-medium transition"
                  >
                    Back to settings
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Send password reset email</h4>
                      <p className="text-xs text-gray-muted mt-0.5">
                        A secure link will be sent to <span className="text-white">{user?.email}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="text-xs text-gray-muted hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3">
                      <p className="text-danger text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={16} /> Send reset link
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-xs font-semibold text-danger/50 uppercase tracking-wider mb-3">Danger Zone</h3>
        <div className="border border-danger/40 rounded-2xl overflow-hidden bg-danger/[0.02]">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-6 py-4 hover:bg-danger/[0.04] transition w-full text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-danger" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-danger">Sign out</p>
              <p className="text-xs text-gray-muted">End your current session on this device</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
