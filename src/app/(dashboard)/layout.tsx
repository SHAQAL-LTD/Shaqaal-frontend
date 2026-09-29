"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Brand } from "@/components/app-shell";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
  Settings,
  ClipboardList,
  Scale,
  CreditCard,
  Users,
} from "lucide-react";

// ─── Role-Based Navigation ──────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Deal Dashboard", icon: LayoutDashboard, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"] },
  { href: "/dashboard/deals", label: "Deals", icon: FileText, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/organizations", label: "Organizations", icon: Building2, roles: ["supplier", "buyer", "broker", "financier", "facilitator", "admin"] },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, roles: ["compliance_officer", "admin"] },
  { href: "/dashboard/audit", label: "Audit Trail", icon: ClipboardList, roles: ["compliance_officer", "admin", "broker"] },
  { href: "/dashboard/kyc", label: "KYC Onboarding", icon: Scale, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["supplier", "buyer", "broker", "financier", "facilitator", "admin"] },
  { href: "/users", label: "Operations", icon: Users, roles: ["admin"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"] },
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
function SidebarContent({ onNavClick, hideBrand }: { onNavClick?: () => void; hideBrand?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleNav = NAV_ITEMS.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      {hideBrand ? null : <Brand href="/" />}
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

      <div className="mt-10 shrink-0 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <p className="text-xs uppercase tracking-wider text-gold">Compliance status</p>
        <p className="mt-2 text-sm text-muted-foreground">
          All active rooms are audit-locked and hash-chained.
        </p>
      </div>
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
            <p className="text-[13px] font-semibold truncate">{user?.fullName}</p>
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


// Notification Bell (live)
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/notifications/unread-count").then(r => r.ok ? r.json() : { count: 0 }).then(d => setUnreadCount(d.count)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      fetch("/api/notifications?page=0&size=20").then(r => r.ok ? r.json() : { content: [] }).then(d => setNotifications(d.content || [])).catch(() => {});
    }
  }, [open]);

  const handleMarkAllRead = () => {
    fetch("/api/notifications/read-all", { method: "POST" }).then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }).catch(() => {});
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className={`relative rounded-lg border border-border p-2 transition-all ${open ? "bg-secondary/60 text-foreground" : "text-muted-foreground hover:text-gold"}`}
      >
        <Bell size={16} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-gold px-1 text-[9px] font-bold text-primary-foreground flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-slide-down">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-[13px] font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">No notifications yet</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-3.5 hover:bg-secondary/40 transition cursor-pointer border-b border-border/60 last:border-0 group">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 shrink-0">🔔</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium leading-snug">{n.title}</p>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border text-center">
            <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-gold hover:text-gold-bright transition">Mark all as read</button>
          </div>
        </div>
      )}
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
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar/80 p-5 lg:block">
          <SidebarContent />
        </aside>

        <div className="min-w-0">
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="min-w-0">{children}</main>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-5">
              <div className="flex items-center justify-between">
                <Brand href="/" />
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
