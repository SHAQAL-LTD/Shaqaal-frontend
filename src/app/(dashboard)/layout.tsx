"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Diamond, LayoutDashboard, FileText, ShieldCheck, ChevronLeft, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/deals", label: "Active Deals", icon: FileText },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
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

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg glass-panel">
          <div className="h-8 w-8 rounded-full bg-gold-500 flex items-center justify-center text-dark-950 font-bold text-xs shrink-0">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.fullName || "User"}</p>
            <p className="text-xs text-gray-muted truncate capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
          </div>
          <button onClick={logout} className="text-gray-muted hover:text-red-400 transition shrink-0" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen glass-panel sticky top-0 border-r border-dark-800 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-50 border-b border-dark-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Diamond size={20} className="text-gold-500" strokeWidth={1.5} />
            <span className="text-lg font-bold text-gradient-gold">SHAQAL</span>
          </Link>
          <button onClick={() => setMobileOpen(true)} className="p-2 border border-dark-700 rounded-lg text-gold-500 hover:bg-dark-800 transition">
            <Menu size={20} />
          </button>
        </header>

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

        <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
