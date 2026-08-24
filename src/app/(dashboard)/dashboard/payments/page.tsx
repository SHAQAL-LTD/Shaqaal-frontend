"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CreditCard, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  REFUNDED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const METHOD_LABELS: Record<string, string> = {
  PAYSTACK: "Card / Bank",
  USDT_TRC20: "USDT (TRC-20)",
  USDT_ERC20: "USDT (ERC-20)",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { loadPayments(); }, [page]);

  async function loadPayments() {
    setLoading(true);
    setError("");
    try {
      const res = await api.payments.listMine(page, 20);
      setPayments(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-sm text-gray-muted">View all your transactions</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="text-dark-600 mx-auto mb-4" />
            <p className="text-gray-muted">No payments yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.paymentType === "ADVANCE" ? "bg-gold-500/10" : "bg-emerald-500/10"}`}>
                  {p.paymentType === "ADVANCE"
                    ? <ArrowUpRight size={18} className="text-gold-500" />
                    : <ArrowDownRight size={18} className="text-emerald-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.description || p.paymentType}</p>
                  <p className="text-[11px] text-gray-muted">
                    {METHOD_LABELS[p.paymentMethod] || p.paymentMethod} &middot; {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${p.amountUsd}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || "bg-dark-700 text-gray-muted"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1 rounded-lg bg-dark-800 text-sm disabled:opacity-50 hover:bg-dark-700 transition">Prev</button>
            <span className="text-sm text-gray-muted">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded-lg bg-dark-800 text-sm disabled:opacity-50 hover:bg-dark-700 transition">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
