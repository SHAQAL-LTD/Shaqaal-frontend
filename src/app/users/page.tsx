"use client";

import React, { useState } from "react";
import { api, setTokens, clearTokens } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "@/components/app-shell";
import NotificationBell from "@/components/NotificationBell";
import { GoldButton, inputClass } from "@/components/ui-kit";
import type { UserProfile } from "@/lib/types";
import {
  BarChart3, Users, FileText, CreditCard, ShieldCheck, GitBranch,
  ClipboardList, Server, Settings, Menu, X, Shield, LogOut,
  Eye, EyeOff, AlertCircle, Lock,
} from "lucide-react";

import OverviewSection from "./console/overview";
import UsersSection from "./console/users";
import DealsSection from "./console/deals";
import PaymentsSection from "./console/payments";
import KycSection from "./console/kyc";
import CommissionSection from "./console/commission";
import AuditSection from "./console/audit";
import HealthSection from "./console/health";
import ConfigSection from "./console/config";

type SectionKey =
  | "overview" | "users" | "deals" | "payments" | "kyc"
  | "commission" | "audit" | "health" | "config";

const SECTIONS: { key: SectionKey; label: string; subtitle: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", subtitle: "Platform pulse at a glance", icon: BarChart3 },
  { key: "users", label: "Users", subtitle: "Accounts, roles, sessions and view-as", icon: Users },
  { key: "deals", label: "Deals", subtitle: "Platform-wide inspection and force advance", icon: FileText },
  { key: "payments", label: "Payments", subtitle: "Transactions, webhooks and reconciliation", icon: CreditCard },
  { key: "kyc", label: "Compliance / KYC", subtitle: "Escalated review queue with bulk decisions", icon: ShieldCheck },
  { key: "commission", label: "Commission trees", subtitle: "Lock state and disbursement oversight", icon: GitBranch },
  { key: "audit", label: "Audit trail", subtitle: "Immutable record of every platform action", icon: ClipboardList },
  { key: "health", label: "System health", subtitle: "DB pool, Redis, webhooks and delivery", icon: Server },
  { key: "config", label: "Settings / Config", subtitle: "Feature flags and country profiles", icon: Settings },
];

function SessionSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-muted text-sm">{label}</p>
      </div>
    </div>
  );
}

/**
 * Operations sign-in — talks ONLY to POST /auth/operations/login. The platform
 * login endpoint rejects admin accounts server-side, so this form is the only
 * way Shaqal staff can obtain a session.
 */
function OperationsLogin() {
  const { refreshUser } = useAuth();
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
      // Start clean — no stale platform tokens may leak into an ops session.
      clearTokens();
      const tokens = await api.auth.operationsLogin({ email, password });
      setTokens(tokens.accessToken, tokens.refreshToken);
      await refreshUser(); // loads the admin profile into AuthContext
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Brand />
        </div>

        <div className="mt-8 glass-panel rounded-2xl p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10">
              <Lock className="h-5 w-5 text-gold" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                Restricted area
              </p>
              <h1 className="mt-1 font-display text-xl font-semibold tracking-tight">
                Operations console
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Shaqal staff only. Platform users sign in through the regular sign-in page.
          </p>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
              <AlertCircle size={16} className="shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Work email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shaqal.com"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <span className="relative block">
                <input
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
                  Enter console
                  <Shield className="h-4 w-4" />
                </>
              )}
            </GoldButton>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Every operation in this console is recorded against your staff identity in the
            immutable audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Signed in but not an admin — refuse access with a way out. */
function AccessDenied({ user }: { user: UserProfile }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md glass-panel rounded-2xl p-7 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-danger/40 bg-danger/10">
          <Shield className="h-6 w-6 text-danger" />
        </span>
        <h1 className="mt-4 font-display text-lg font-semibold">Operations access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This console is for Shaqal operations staff. You are signed in as{" "}
          <span className="text-foreground">{user.email}</span>.
        </p>
        <GoldButton onClick={logout} className="mt-6 w-full py-3">
          Sign out
          <LogOut className="h-4 w-4" />
        </GoldButton>
      </div>
    </div>
  );
}

/**
 * The operations console — a fixed-sidebar command center (mirrors the platform
 * shell's h-screen layout: the document never scrolls, only the main pane does)
 * with nine sections of real admin tooling.
 */
function OperationsConsole() {
  const { logout, user } = useAuth();
  const [section, setSection] = useState<SectionKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = SECTIONS.find((s) => s.key === section) || SECTIONS[0];

  const navigate = (key: string) => {
    setSection(key as SectionKey);
    setMobileOpen(false);
  };

  const sidebarNav = (
    <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
      {SECTIONS.map((item) => {
        const isActive = section === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors " +
              (isActive
                ? "border border-gold/30 bg-sidebar-accent text-gold-bright"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="shrink-0 border-t border-border pt-4">
      <div className="flex items-center gap-2.5 px-1">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/40 bg-gold/10">
          <Shield size={14} className="text-gold" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold">{user?.fullName || "Operations"}</p>
          <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-[13px] font-medium text-foreground transition hover:border-gold/50 hover:text-gold-bright"
      >
        <LogOut size={14} />
        Sign out
      </button>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <OverviewSection onNavigate={navigate} />;
      case "users":
        return <UsersSection />;
      case "deals":
        return <DealsSection />;
      case "payments":
        return <PaymentsSection />;
      case "kyc":
        return <KycSection />;
      case "commission":
        return <CommissionSection />;
      case "audit":
        return <AuditSection />;
      case "health":
        return <HealthSection />;
      case "config":
        return <ConfigSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Fixed left sidebar — same pattern as the platform shell. */}
      <aside className="hidden w-[264px] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/80 p-5 lg:flex">
        <Brand href={null} className="shrink-0" />
        <div className="mt-5 flex shrink-0 items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
          <Shield size={11} /> Operations console
        </div>
        {sidebarNav}
        {sidebarFooter}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background/70 px-4 py-3.5 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{active.label}</h1>
            <p className="truncate text-xs text-muted-foreground">{active.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-[13px] font-medium text-foreground transition hover:border-gold/50 hover:text-gold-bright"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* The main pane is the only scroll container. */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">{renderSection()}</div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-5">
            <div className="flex items-center justify-between">
              <Brand href={null} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg border border-border p-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarNav}
            {sidebarFooter}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * /users — the Shaqal operations console.
 *
 * SECURITY: this is the ONLY entry point for admin accounts. It authenticates
 * against POST /auth/operations/login; the platform login endpoint rejects
 * admin credentials server-side, and the platform dashboard redirects any
 * admin session back here (see ProtectedRoute).
 */
export default function OperationsPage() {
  const { user, loading } = useAuth();

  if (loading) return <SessionSpinner label="Verifying session..." />;
  if (!user) return <OperationsLogin />;
  if (user.role !== "admin") return <AccessDenied user={user} />;
  return <OperationsConsole />;
}
