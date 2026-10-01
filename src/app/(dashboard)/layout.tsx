"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, setTokens, clearTokens } from "@/lib/api";
import { titleCase } from "@/lib/utils";
import { Brand } from "@/components/app-shell";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Settings,
  ClipboardList,
  Scale,
  CreditCard,
} from "lucide-react";

// ─── Role-Based Navigation ──────────────────────────────
// NOTE: the admin role never appears here — Shaqal staff use the operations
// console at /users only (ProtectedRoute bounces any admin session out of
// this shell, and the platform login API rejects admin credentials).
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Deal Dashboard", icon: LayoutDashboard, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator"] },
  { href: "/dashboard/deals", label: "Deals", icon: FileText, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/organizations", label: "Organizations", icon: Building2, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, roles: ["compliance_officer"] },
  { href: "/dashboard/audit", label: "Audit Trail", icon: ClipboardList, roles: ["compliance_officer", "broker"] },
  { href: "/dashboard/kyc", label: "KYC Onboarding", icon: Scale, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator"] },
];

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier", buyer: "Buyer", broker: "Broker",
  financier: "Financier", compliance_officer: "Compliance Officer",
  facilitator: "Facilitator", admin: "Administrator",
};

// ─── Header titles (DESIGN AppShell title/subtitle) ────
const ROUTE_TITLES: Array<{ match: string; title: string; subtitle?: string }> = [
  { match: "/dashboard/deals/new", title: "Create deal room", subtitle: "Stage 1 opens on submission." },
  { match: "/dashboard/deals", title: "Deal Book", subtitle: "All mandates across your desk, stage by stage." },
  { match: "/dashboard/organizations", title: "Organizations", subtitle: "KYB-registered entities and counterparties." },
  { match: "/dashboard/compliance", title: "Compliance Desk", subtitle: "Broker registration & KYC approval queue" },
  { match: "/dashboard/audit", title: "Audit Trail", subtitle: "Immutable, append-only activity history." },
  { match: "/dashboard/kyc", title: "KYC Onboarding", subtitle: "Verification required before deal room access" },
  { match: "/dashboard/payments", title: "Payments", subtitle: "Escrow funding, payouts and settlement." },
  { match: "/dashboard/settings", title: "Settings", subtitle: "Platform preferences and security." },
  { match: "/dashboard/admin", title: "Admin Console", subtitle: "Platform administration." },
  { match: "/dashboard/profile", title: "Operator Profile", subtitle: "Your identity, permissions and audit trail." },
  { match: "/users", title: "Operations", subtitle: "User administration and roles." },
  { match: "/dashboard", title: "Deal Dashboard", subtitle: "All active mandates across your desk" },
];

function prettify(segment: string) {
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

function headerTitle(pathname: string): { title: string; subtitle?: string } {
  // Deal detail: /dashboard/deals/<id>[/sub]
  const dealMatch = pathname.match(/^\/dashboard\/deals\/([^/]+)(?:\/([^/]+))?$/);
  if (dealMatch) {
    const id = decodeURIComponent(dealMatch[1]);
    if (id !== "new") {
      return {
        title: `Deal ${id}`,
        subtitle: dealMatch[2] ? prettify(dealMatch[2]) : "10-stage pipeline · audit-locked room",
      };
    }
  }
  const route = ROUTE_TITLES.find(
    (r) => pathname === r.match || pathname.startsWith(r.match + "/"),
  );
  if (route) return { title: route.title, subtitle: route.subtitle };
  const last = pathname.split("/").filter(Boolean).pop();
  return { title: last ? prettify(last) : "Shaqal TradeOS" };
}

// ─── Sidebar ────────────────────────────────────────────
/** Formats an ISO/epoch timestamp as e.g. "29 Sept, 03:11". */
function fmtAuditTs(raw: unknown): string | null {
  if (raw == null) return null;
  const d = new Date(typeof raw === "number" ? raw : String(raw));
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Data-driven compliance status fed by GET /dashboard/summary: exact active-room count
 * (row-level scoped to the caller) plus the global last-audit timestamp, readable by every
 * authenticated role.
 */
function ComplianceStatusBox() {
  const [activeRooms, setActiveRooms] = useState<number | null>(null);
  const [lastAuditAt, setLastAuditAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.dashboard
      .summary()
      .then((s) => {
        if (!alive) return;
        setActiveRooms(s.activeRooms);
        setLastAuditAt(fmtAuditTs(s.lastAuditAt));
      })
      .catch(() => {
        /* keep — */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mt-10 shrink-0 rounded-2xl border border-gold/20 bg-gold/5 p-4">
      <p className="text-xs uppercase tracking-wider text-gold">Compliance status</p>
      <dl className="mt-2.5 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Active rooms</dt>
          <dd className="tnum font-medium text-foreground">
            {activeRooms === null ? "…" : activeRooms}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Last audit</dt>
          <dd className="tnum text-xs font-medium text-foreground">{lastAuditAt ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

function SidebarContent({ onNavClick, hideBrand }: { onNavClick?: () => void; hideBrand?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleNav = NAV_ITEMS.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      {/* Inert mark — the logo never navigates away from the shell; signing
          out happens only via the account menu. */}
      {hideBrand ? null : <Brand href={null} className="shrink-0" />}
      <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "border border-gold/30 bg-sidebar-accent text-gold-bright"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ComplianceStatusBox />
    </>
  );
}

// ─── User Dropdown ──────────────────────────────────────
function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 py-1 pl-1 pr-3 transition-colors hover:border-gold/60 hover:bg-gold/20"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-xs font-bold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden text-xs text-foreground sm:block">{ROLE_LABELS[user?.role || ""] || "User"}</span>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/60 py-2 z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[13px] font-semibold truncate">{titleCase(user?.fullName)}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition rounded-xl">
              <User size={15} /> My Profile
            </Link>
            <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition rounded-xl">
              <Settings size={15} /> Settings
            </Link>
          </div>
          <div className="p-1.5 border-t border-border">
            <button onClick={() => { setOpen(false); logout(); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-danger/10 transition rounded-xl w-full">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── View-As (impersonation) session banner ─────────────
interface OpsBackup {
  accessToken: string;
  refreshToken: string;
  targetName?: string;
  targetEmail?: string;
  expiresAt: number;
}

/** Key under which the operations console stashes the admin session while impersonating. */
const OPS_BACKUP_KEY = "shaqal_ops_backup";

/**
 * Rendered only while an admin is viewing the platform as another user ("View-As").
 * The operations console swaps in a 15-minute impersonation token and parks the admin
 * session here; exiting restores it and returns to /users. Cleared automatically by the
 * nuclear logout on any normal sign-in.
 */
function ImpersonationBanner() {
  const [info, setInfo] = useState<OpsBackup | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Deferred read: setState must not run synchronously inside the effect body.
    let alive = true;
    const t = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(OPS_BACKUP_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as OpsBackup;
          setInfo(parsed);
          setExpired(Date.now() > parsed.expiresAt);
        }
      } catch {
        /* ignore malformed backup */
      }
    }, 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  if (!info) return null;

  function exitViewAs() {
    try {
      const raw = sessionStorage.getItem(OPS_BACKUP_KEY);
      const backup = raw ? (JSON.parse(raw) as OpsBackup) : null;
      clearTokens();
      if (backup?.accessToken) {
        setTokens(backup.accessToken, backup.refreshToken || "");
      }
      sessionStorage.removeItem(OPS_BACKUP_KEY);
    } catch {
      /* fall through — redirect still gets the admin back */
    }
    window.location.replace("/users");
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/40 bg-gold/10 px-4 py-2 sm:px-8">
      <p className="min-w-0 truncate text-[12px] text-gold">
        <span className="font-semibold">View-as session</span> — {info.targetName || info.targetEmail || "user"}
        {expired ? " (expired)" : ` · ends ${new Date(info.expiresAt).toLocaleTimeString()}`}
      </p>
      <button
        onClick={exitViewAs}
        className="shrink-0 rounded-lg border border-gold/40 px-3 py-1 text-[12px] font-semibold text-gold transition hover:bg-gold/20"
      >
        Exit view-as
      </button>
    </div>
  );
}


// ─── Top Navbar (DESIGN AppShell header) ────────────────
function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { title, subtitle } = headerTitle(pathname);

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-background/70 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          {title ? <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1> : null}
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  );
}

// ─── Layout (DESIGN AppShell grid) ──────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const pathname = usePathname();

  // The shell owns scrolling: <main> is the ONLY scroll container (the sidebar
  // and top navbar are pinned), so window scroll never moves. Client-side
  // navigations therefore have to reset the main pane explicitly.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ProtectedRoute>
      {/* h-screen + overflow-hidden: the document itself never scrolls. The
          sidebar lives in its own fixed-width column (its nav scrolls
          internally when long, the compliance box stays pinned at its foot),
          the top navbar sits at the top of the content column, and only the
          main pane below it scrolls. */}
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden w-[264px] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/80 p-5 lg:flex">
          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ImpersonationBanner />
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main ref={mainRef} className="min-w-0 flex-1 min-h-0 overflow-y-auto">{children}</main>
        </div>

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
              <SidebarContent onNavClick={() => setMobileOpen(false)} hideBrand />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
