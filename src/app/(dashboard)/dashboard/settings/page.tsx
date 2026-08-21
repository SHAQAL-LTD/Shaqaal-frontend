"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { User, Shield, Bell, LogOut, ChevronRight, ExternalLink } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier", buyer: "Buyer", broker: "Broker",
  financier: "Financier", compliance_officer: "Compliance Officer",
  facilitator: "Facilitator", admin: "Administrator",
};

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const sections = [
    {
      title: "Profile",
      items: [
        { label: "Edit name & phone", href: "/dashboard/profile", icon: User },
        { label: "View full profile", href: "/dashboard/profile", icon: ExternalLink },
      ],
    },
    {
      title: "Security",
      items: [
        { label: "Change password", href: "/dashboard/profile", icon: Shield },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-muted mt-1">Manage your account preferences.</p>
      </div>

      {/* Account Summary */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-xl shrink-0 shadow-lg shadow-gold-500/20">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.fullName}</h3>
            <p className="text-sm text-gray-muted">{user?.email}</p>
            <p className="text-xs text-gold-500 mt-0.5">{ROLE_LABELS[user?.role || ""] || user?.role}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-gray-muted uppercase tracking-wider mb-3">{section.title}</h3>
          <div className="glass-panel rounded-xl divide-y divide-dark-800/50 overflow-hidden">
            {section.items.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 px-5 py-4 hover:bg-dark-800/50 transition group">
                <item.icon size={18} className="text-gray-muted group-hover:text-gold-500 transition" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-500 transition" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div>
        <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-3">Danger Zone</h3>
        <div className="border border-red-500/20 rounded-xl overflow-hidden">
          <button onClick={logout} className="flex items-center gap-3 px-5 py-4 hover:bg-red-500/5 transition w-full text-left group">
            <LogOut size={18} className="text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Sign out</p>
              <p className="text-xs text-gray-muted">End your current session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
