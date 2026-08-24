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
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
  Settings,
  ClipboardList,
  Scale,
  ArrowRight,
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"] },
  { href: "/dashboard/deals", label: "Deals", icon: FileText, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/organizations", label: "Organizations", icon: Building2, roles: ["supplier", "buyer", "broker", "financier", "facilitator", "admin"] },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, roles: ["compliance_officer", "admin"] },
  { href: "/dashboard/audit", label: "Audit Trail", icon: ClipboardList, roles: ["compliance_officer", "admin", "broker"] },
  { href: "/dashboard/kyc", label: "KYC / Verification", icon: Scale, roles: ["supplier", "buyer", "broker", "financier", "facilitator"] },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["supplier", "buyer", "broker", "financier", "facilitator", "admin"] },
  { href: "/dashboard/admin", label: "Admin Panel", icon: Users, roles: ["admin"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["supplier", "buyer", "broker", "financier", "compliance_officer", "facilitator", "admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier", buyer: "Buyer", broker: "Broker",
  financier: "Financier", compliance_officer: "Compliance Officer",
  facilitator: "Facilitator", admin: "Administrator",
};

// ─── Sidebar ────────────────────────────────────────────
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const visibleNav = NAV_ITEMS.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/[0.04]">
        <Link href="/" onClick={onNavClick} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20">
            <Diamond size={18} className="text-dark-950" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gradient-gold">SHAQAL</h1>
            <p className="text-[9px] text-gray-muted uppercase tracking-[0.25em] font-semibold">TradeOS</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gold-500/10 text-gold-500 border border-gold-500/15 shadow-sm shadow-gold-500/5"
                  : "text-gray-muted hover:bg-white/[0.03] hover:text-white border border-transparent"
              }`}
            >
              <item.icon size={17} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.04]">
        <Link
          href="/dashboard/profile"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-panel hover:bg-white/[0.04] transition group"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-[11px] shrink-0 shadow-sm shadow-gold-500/20">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate group-hover:text-gold-500 transition">{user?.fullName || "User"}</p>
            <p className="text-[11px] text-gray-muted truncate">{ROLE_LABELS[user?.role || ""] || user?.role}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
            className="text-gray-muted hover:text-red-400 transition shrink-0 p-1.5 rounded-lg hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut size={14} />
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
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all border border-white/5"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-[11px] shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-semibold leading-tight truncate max-w-[110px]">{user?.fullName}</p>
          <p className="text-[10px] text-gray-muted">{ROLE_LABELS[user?.role || ""]}</p>
        </div>
        <ChevronDown size={13} className={`text-gray-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-dark-900/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl shadow-black/60 py-2 z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-[13px] font-semibold truncate">{user?.fullName}</p>
            <p className="text-[11px] text-gray-muted truncate">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/[0.04] hover:text-white transition rounded-xl">
              <User size={15} /> My Profile
            </Link>
            <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/[0.04] hover:text-white transition rounded-xl">
              <Settings size={15} /> Settings
            </Link>
          </div>
          <div className="p-1.5 border-t border-white/5">
            <button onClick={() => { setOpen(false); logout(); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/5 transition rounded-xl w-full">
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
        className={`relative p-2.5 rounded-xl border border-white/5 transition-all ${open ? "bg-white/[0.06] text-white" : "hover:bg-white/[0.04] text-gray-muted hover:text-white"}`}
      >
        <Bell size={17} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 rounded-full text-[9px] font-bold text-dark-950 flex items-center justify-center shadow-sm shadow-gold-500/30">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-dark-900/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-slide-down">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-[13px] font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-5 py-8 text-center text-[12px] text-gray-muted">No notifications yet</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition cursor-pointer border-b border-white/[0.02] last:border-0 group">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 shrink-0">🔔</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium leading-snug">{n.title}</p>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-gray-muted mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-dark-500 mt-1.5 font-medium">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/5 text-center">
            <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-gold-500 hover:text-gold-400 transition">Mark all as read</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Top Navbar ─────────────────────────────────────────
function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-40 bg-dark-950/70 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-14 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 border border-white/5 rounded-xl text-gold-500 hover:bg-white/[0.04] transition">
            <Menu size={18} />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-[13px]">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.href}>
                {i > 0 && <span className="text-dark-600 mx-0.5">/</span>}
                {b.isLast ? (
                  <span className="text-white font-medium">{b.label}</span>
                ) : (
                  <Link href={b.href} className="text-gray-muted hover:text-white transition">{b.label}</Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

// ─── Layout ─────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen">
        <aside className="hidden md:flex flex-col w-60 h-screen glass-panel sticky top-0 border-r border-white/[0.04] shrink-0">
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-dark-900 border-r border-white/[0.04] flex flex-col animate-slide-down">
              <div className="flex items-center justify-end p-4">
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-muted hover:text-white transition rounded-xl hover:bg-white/[0.04]">
                  <X size={18} />
                </button>
              </div>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
