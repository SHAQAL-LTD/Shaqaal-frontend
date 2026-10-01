"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  notificationType: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * The platform notification bell — used by the dashboard shell AND the operations
 * console. Talks to GET /notifications* through the api client so the request carries
 * the Bearer token and the configured API base URL (the old inline fetch used a
 * double-/api path with no auth header and 404'd silently).
 */
export default function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Poll the unread badge every 30s (fires once on mount as well).
  useEffect(() => {
    let alive = true;
    const poll = () => {
      api.notifications
        .unreadCount()
        .then((r) => {
          if (alive) setUnreadCount(r?.count ?? 0);
        })
        .catch(() => {
          /* transient — keep the last known count */
        });
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) loadNotifications();
  }

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.notifications.list(0, 20);
      setNotifications(res?.content ?? []);
    } catch (e) {
      setError(apiErrorMessage(e, "Could not load notifications"));
    } finally {
      setLoading(false);
    }
  }

  async function markRead(n: NotificationItem) {
    if (n.isRead) {
      if (n.linkUrl) router.push(n.linkUrl);
      return;
    }
    try {
      await api.notifications.markRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (n.linkUrl) router.push(n.linkUrl);
    } catch {
      /* navigation is best-effort even if the read-mark fails */
    }
  }

  async function markAllRead() {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className={cn(
          "relative rounded-lg border border-border p-2 transition-all",
          open ? "bg-secondary/60 text-foreground" : "text-muted-foreground hover:text-gold",
        )}
      >
        <Bell size={16} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-gold px-1 text-[9px] font-bold text-primary-foreground flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-slide-down">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-[13px] font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-gold transition hover:text-gold-bright"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-5 py-8 text-[12px] text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : error ? (
              <div className="px-5 py-8 text-center text-[12px] text-danger">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={cn(
                    "px-5 py-3.5 hover:bg-secondary/40 transition cursor-pointer border-b border-border/60 last:border-0",
                    !n.isRead && "bg-gold/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium leading-snug">{n.title}</p>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
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
