"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Bell, Check, CheckCheck, X } from "lucide-react";

interface Notification {
  id: string;
  notificationType: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadUnreadCount() {
    try {
      const res = await api.notifications.unreadCount();
      setUnreadCount(res.count);
    } catch {}
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await api.notifications.list(0, 20);
      setNotifications(res.content || []);
    } catch {}
    setLoading(false);
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      loadNotifications();
    }
  }

  async function markRead(id: string) {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg hover:bg-dark-800 transition"
      >
        <Bell size={20} className="text-gray-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl shadow-2xl border border-dark-700 z-50">
          <div className="flex items-center justify-between p-3 border-b border-dark-700">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1">
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-muted text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-muted text-sm">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-dark-700/50 hover:bg-dark-800/50 transition cursor-pointer ${!n.isRead ? "bg-gold-500/5" : ""}`}
                  onClick={() => {
                    markRead(n.id);
                    if (n.linkUrl) window.location.href = n.linkUrl;
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-muted truncate">{n.body}</p>
                      <p className="text-[10px] text-dark-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
