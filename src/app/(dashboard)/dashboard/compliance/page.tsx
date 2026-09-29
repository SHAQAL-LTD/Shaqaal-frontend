"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ComplianceReview, ComplianceReviewDetail } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2, XCircle, Clock, MessageSquare, Eye, X, ArrowLeft } from "lucide-react";

export default function CompliancePage() {
  const { user } = useAuth();
  const isCO = user?.role === "compliance_officer" || user?.role === "admin";
  const [reviews, setReviews] = useState<ComplianceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ComplianceReviewDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => { loadReviews(); }, [statusFilter]);

  async function loadReviews() {
    setLoading(true); setError("");
    try {
      const data = await api.compliance.queue(statusFilter);
      setReviews(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally { setLoading(false); }
  }

  async function openDetail(id: string) {
    setLoadingDetail(true);
    try {
      const detail = await api.compliance.get(id);
      setSelected(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load review");
    } finally { setLoadingDetail(false); }
  }

  async function handleDecision(reviewId: string) {
    if (!decision) { setError("Select a decision"); return; }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      await api.compliance.decide(reviewId, decision, note || undefined);
      setSuccess(`Review ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "updated"} successfully`);
      setSelected(null); setDecision(""); setNote("");
      loadReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Decision failed");
    } finally { setSubmitting(false); }
  }

  if (!isCO) {
    return (
      <div className="p-8 text-center">
        <ShieldCheck size={48} className="text-muted-foreground/60 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Compliance Officer Access</h2>
        <p className="text-muted-foreground">This page is restricted to Compliance Officers and Administrators.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up">
      {selected ? (
        /* ── Detail View ────────────────────────────── */          <div className="space-y-6">
            <button onClick={() => { setSelected(null); setDecision(""); setNote(""); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
              <ArrowLeft size={16} /> Back to queue
            </button>

            <div className="glass rounded-2xl p-5 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selected.submitterFullName}</h2>
                <p className="text-muted-foreground text-sm">{selected.submitterEmail} · {selected.submitterPhone || "No phone"}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary border border-border capitalize">{selected.submitterRole?.toLowerCase()}</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary border border-border uppercase">{selected.submitterCountry}</span>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${selected.submission.status === "PENDING" ? "bg-gold/10 text-gold-bright border border-gold/40" : selected.submission.status === "APPROVED" ? "bg-success/10 text-success border border-success/40" : "bg-secondary text-muted-foreground border border-border"}`}>
                {selected.submission.status}
              </span>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Submitted Documents ({selected.submission.documents.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selected.submission.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-4 bg-secondary/40 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Eye size={16} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.docType} · {(doc.byteSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.submission.reviewerNote && (
              <div className="bg-gold/5 border border-gold/10 rounded-xl p-4 mb-6">
                <p className="text-xs text-gold font-semibold mb-1">Previous reviewer note</p>
                <p className="text-sm">{selected.submission.reviewerNote}</p>
              </div>
            )}

            {/* Decision Form */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Issue Decision</h3>

              {error && <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3 mb-4"><AlertCircle size={16} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>}
              {success && <div className="flex items-center gap-2 bg-success/10 border border-success/40 rounded-xl p-3 mb-4"><CheckCircle2 size={16} className="text-success shrink-0" /><p className="text-success text-sm">{success}</p></div>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { value: "approve", label: "Approve", icon: CheckCircle2, color: "text-success bg-success/10 border-success/40 hover:bg-success/20" },
                  { value: "reject", label: "Reject", icon: XCircle, color: "text-danger bg-danger/10 border-danger/40 hover:bg-danger/20" },
                  { value: "request_info", label: "Request Info", icon: MessageSquare, color: "text-gold-bright bg-gold/10 border-gold/40 hover:bg-gold/20" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setDecision(opt.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${decision === opt.value ? opt.color : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60"}`}>
                    <opt.icon size={16} /> {opt.label}
                  </button>
                ))}
              </div>

              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)" rows={3} className="w-full bg-background/60 border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:ring-2 focus:ring-gold/20 focus:outline-none transition resize-none mb-4" />

              <button onClick={() => handleDecision(selected.submission.id)} disabled={submitting || !decision}
                className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Queue List ─────────────────────────────── */
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-sm text-muted-foreground max-w-xl">Review and decide on KYC submissions. Every decision is written to the immutable audit ledger.</p>
            </div>
            <div className="flex gap-2">
              {["pending", "approved", "rejected"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition ${statusFilter === s ? "bg-gold/10 text-gold-bright border-gold/40" : "border-border text-muted-foreground hover:bg-secondary/60"}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="flex items-center gap-3 bg-danger/10 border border-danger/40 rounded-xl p-4"><AlertCircle size={18} className="text-danger shrink-0" /><p className="text-danger text-sm">{error}</p></div>}

          {loading && <div className="flex items-center justify-center py-16"><Loader2 size={28} className="text-gold animate-spin" /></div>}

          {!loading && reviews.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <ShieldCheck size={40} className="text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Queue empty</h3>
              <p className="text-gray-muted text-sm">No {statusFilter} submissions to review right now.</p>
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="space-y-3">
              {reviews.map(r => (
                <button key={r.id} onClick={() => openDetail(r.id)}
                  className="w-full glass rounded-2xl p-5 border border-border transition-colors hover:border-gold/40 text-left flex items-center gap-4 group">
                  <div className="h-11 w-11 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                    {r.userFullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-gold transition">{r.userFullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.userEmail} · {r.documentCount} document{r.documentCount !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{new Date(r.submittedAt).toLocaleDateString()}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.status === "PENDING" ? "bg-gold/10 text-gold-bright border border-gold/40" : r.status === "APPROVED" ? "bg-success/10 text-success border border-success/40" : "bg-secondary text-muted-foreground border border-border"}`}>
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
