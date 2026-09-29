"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui-kit";
import {
  CreditCard,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet,
  Banknote,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gold/10 text-gold-bright border-gold/40",
  PROCESSING: "bg-chart-2/10 text-chart-2 border-chart-2/40",
  COMPLETED: "bg-success/10 text-success border-success/40",
  FAILED: "bg-danger/10 text-danger border-danger/40",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  PROCESSING: Loader2,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.payments
      .listMine(page, 20)
      .then((data: any) => {
        setPayments(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/[0.04] text-gray-muted hover:text-white transition">
          <ArrowLeft size={18} />
        </Link>
        <p className="text-[13px] text-muted-foreground">Track your payment history and transactions</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-success" />
              </div>
              <p className="text-[12px] text-gray-muted font-medium uppercase tracking-wider">Completed</p>
            </div>
            <p className="text-2xl font-bold">{payments.filter((p: any) => p.status === "COMPLETED").length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Loader2 size={18} className="text-chart-2" />
              </div>
              <p className="text-[12px] text-gray-muted font-medium uppercase tracking-wider">Processing</p>
            </div>
            <p className="text-2xl font-bold">{payments.filter((p: any) => p.status === "PROCESSING").length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center">
                <CreditCard size={18} className="text-gold-500" />
              </div>
              <p className="text-[12px] text-gray-muted font-medium uppercase tracking-wider">Total</p>
            </div>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-dark-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-1/3" />
                  <div className="h-3 bg-dark-700 rounded w-1/5" />
                </div>
                <div className="h-6 w-20 bg-dark-700 rounded-full" />
                <div className="h-5 w-16 bg-dark-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && payments.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="No payments"
          description="Payments will appear here once you initiate a transaction for a deal."
          actionLabel="View deals"
          actionHref="/dashboard/deals"
          actionIcon={<Banknote size={16} />}
        />
      )}

      {!loading && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment: any) => {
            const StatusIcon = STATUS_ICONS[payment.status] || Clock;
            const isAnimating = payment.status === "PROCESSING";
            const statusClass = STATUS_COLORS[payment.status] || "";
            return (
              <div key={payment.id} className="glass-panel rounded-2xl p-5 hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-gray-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold truncate">{payment.paymentType || "Payment"}</p>
                      <span className="text-[10px] text-gray-muted font-mono">{payment.paymentMethod}</span>
                    </div>
                    <p className="text-[11px] text-gray-muted mt-0.5">{payment.description || "Deal payment"}</p>
                    <p className="text-[10px] text-dark-500 mt-1">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                    </p>
                  </div>
                  <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border " + statusClass}>
                    <StatusIcon size={12} className={isAnimating ? "animate-spin" : ""} />
                    {payment.status}
                  </span>
                  <p className="text-[15px] font-bold whitespace-nowrap">
                    ${Number(payment.amountUsd || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/5 text-gray-muted hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition">Previous</button>
          <span className="text-[12px] text-gray-muted">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/5 text-gray-muted hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition">Next</button>
        </div>
      )}
    </div>
  );
}
