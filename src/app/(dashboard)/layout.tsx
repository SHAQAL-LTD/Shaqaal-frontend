"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Diamond,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
  Settings,
  ClipboardList,
  Scale,
} from "lucide-react";

// ─── Role-Based Navigation ──────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"],
  },
  {
    href: "/dashboard/deals",
    label: "Deals",
    icon: FileText,
    roles: ["supplier", "buyer", "broker", "financier", "facilitator"],
  },
  {
    href: "/dashboard/organizations",
    label: "Organizations",
    icon: Building2,
    roles: ["supplier", "buyer", "broker", "financier", "facilitator", "admin"],
  },
  {
    href: "/dashboard/compliance",
    label: "Compliance",
    icon: ShieldCheck,
    roles: ["compliance_officer", "admin"],
  },
  {
    href: "/dashboard/audit",
    label: "Audit Trail",
    icon: ClipboardList,
    roles: ["compliance_officer", "admin", "broker"],
  },
  {
    href: "/dashboard/kyc",
    label: "KYC / Verification",
    icon: Scale,
    roles: ["supplier", "buyer", "broker", "financier", "facilitator"],
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier",
  buyer: "Buyer",
  broker: "Broker",
  financier: "Financier",
  compliance_officer: "Compliance Officer",
  facilitator: "Facilitator",
  admin: "Administrator",
};

// ─── Sidebar Content ────────────────────────────────────
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleNav = NAV_ITEMS.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <Link href="/" onClick={onNavClick}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md border border-gold-500/30 flex items-center justify-center">
              <Diamond size={20} className="text-gold-500" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gradient-gold">SHAQAL</h1>
              <p className="text-[10px] text-gray-muted uppercase tracking-[0.2em] font-semibold">TradeOS</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                  : "text-gray-muted hover:bg-dark-800 hover:text-white"
              }`}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-dark-800">
        <Link
          href="/dashboard/profile"
          onClick={onNavClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg glass-panel hover:bg-dark-800 transition group"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-xs shrink-0 shadow-md shadow-gold-500/20">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-gold-500 transition">{user?.fullName || "User"}</p>
            <p className="text-xs text-gray-muted truncate">{ROLE_LABELS[user?.role || ""] || user?.role || "Unknown"}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
            className="text-gray-muted hover:text-red-400 transition shrink-0 p-1.5 rounded-lg hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </Link>
      </div>
    </div>
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
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 transition border border-dark-700/50"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium leading-tight truncate max-w-[120px]">{user?.fullName}</p>
          <p className="text-[11px] text-gray-muted">{ROLE_LABELS[user?.role || ""] || user?.role}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl shadow-black/50 py-2 z-50">
          <div className="px-4 py-3 border-b border-dark-800">
            <p className="text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-muted truncate">{user?.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition"
          >
            <User size={16} /> My Profile
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition"
          >
            <Settings size={16} /> Settings
          </Link>
          <div className="border-t border-dark-800 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition w-full"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notification Bell (placeholder) ────────────────────
function NotificationBell() {
  return (
    <button className="relative p-2.5 rounded-lg border border-dark-700/50 hover:bg-dark-800 transition text-gray-muted hover:text-white">
      <Bell size={18} />
      {/* Unread indicator */}
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
    </button>
  );
}

// ─── Top Navbar ─────────────────────────────────────────
function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  // Breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 border border-dark-700 rounded-lg text-gold-500 hover:bg-dark-800 transition"
          >
            <Menu size={20} />
          </button>
          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.href}>
                {i > 0 && <span className="text-dark-600">/</span>}
                {b.isLast ? (
                  <span className="text-white font-medium">{b.label}</span>
                ) : (
                  <Link href={b.href} className="text-gray-muted hover:text-white transition">{b.label}</Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard Layout ───────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen glass-panel sticky top-0 border-r border-dark-800 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-dark-900 border-r border-dark-800 flex flex-col animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-end p-4">
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-muted hover:text-white transition">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
