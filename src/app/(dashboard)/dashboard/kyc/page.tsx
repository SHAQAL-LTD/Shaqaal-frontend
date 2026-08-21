"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KycSubmission, CountryProfile } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileCheck, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, X, File, Trash2, Shield } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
  PENDING: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pending Review", icon: Clock },
  APPROVED: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Approved", icon: CheckCircle2 },
  REJECTED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rejected", icon: XCircle },
  REQUEST_INFO: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Info Requested", icon: AlertCircle },
};

export default function KycPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [profile, setProfile] = useState<CountryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [subs, countryProfile] = await Promise.all([
        api.kyc.listMine().catch(() => []),
        user?.country ? api.countries.profile(user.country).catch(() => null) : null,
      ]);
      setSubmissions(subs);
      setProfile(countryProfile);
    } catch {} finally { setLoading(false); }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setDocTypes(prev => [...prev, ...newFiles.map(() => "")]);
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setDocTypes(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      if (selectedFiles.length === 0) { setError("Select at least one file"); setSubmitting(false); return; }
      if (docTypes.some(d => !d)) { setError("Select a document type for each file"); setSubmitting(false); return; }
      await api.kyc.submit(docTypes, selectedFiles);
      setSuccess("KYC submission created successfully!");
      setShowSubmit(false); setSelectedFiles([]); setDocTypes([]);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">KYC / Verification</h1>
          <p className="text-gray-muted mt-2 text-[15px]">Submit identity documents and track verification status.</p>
        </div>
        <button onClick={() => setShowSubmit(!showSubmit)} className="button-gold px-6 py-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold">
          <Upload size={16} /> Submit Documents
        </button>
      </div>

      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4"><AlertCircle size={18} className="text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}
      {success && <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /><p className="text-emerald-400 text-sm">{success}</p></div>}

      {showSubmit && (
        <div className="glass-panel-elevated rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">New KYC Submission</h3>
            <button onClick={() => setShowSubmit(false)} className="text-gray-muted hover:text-white transition p-1"><X size={18} /></button>
          </div>

          {profile && (
            <div className="bg-gold-500/[0.03] border border-gold-500/10 rounded-xl p-4">
              <p className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Required documents for {profile.displayName}</p>
              <div className="flex flex-wrap gap-2">
                {profile.requiredDocTypes.map(d => (
                  <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-dark-800 border border-dark-700 text-gray-300">{d}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-muted mb-2">Upload files</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-700 rounded-xl cursor-pointer hover:border-gold-500/30 hover:bg-gold-500/[0.02] transition">
              <Upload size={24} className="text-dark-600 mb-2" />
              <p className="text-sm text-gray-muted">Click to select files</p>
              <p className="text-[11px] text-dark-600 mt-1">PDF, PNG, JPG up to 50MB each</p>
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                  <File size={16} className="text-gold-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-gray-muted">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <select value={docTypes[i] || ""} onChange={(e) => { const nd = [...docTypes]; nd[i] = e.target.value; setDocTypes(nd); }} className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-gold-500 outline-none">
                    <option value="">Select type</option>
                    <option value="CAC_CERTIFICATE">CAC Certificate</option>
                    <option value="TAX_ID">Tax ID / TIN</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="UTILITY_BILL">Utility Bill</option>
                    <option value="BANK_STATEMENT">Bank Statement</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <button onClick={() => removeFile(i)} className="text-gray-muted hover:text-red-400 transition p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting || selectedFiles.length === 0} className="button-gold w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Submit {selectedFiles.length > 0 ? `(${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""})` : ""}
          </button>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-16"><Loader2 size={28} className="text-gold-500 animate-spin" /></div>}

      {!loading && submissions.length === 0 && (
        <div className="glass-panel-elevated rounded-2xl p-12 text-center">
          <Shield size={40} className="text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
          <p className="text-gray-muted text-sm">Submit your KYC documents to get verified on the platform.</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.PENDING;
            const Icon = config.icon;
            return (
              <div key={sub.id} className="glass-panel-elevated rounded-2xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Submission {sub.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-muted">{new Date(sub.submittedAt || sub.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.color} border ${config.border}`}>{config.label}</span>
                </div>
                {sub.reviewerNote && (
                  <div className="bg-dark-800/50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-muted font-semibold mb-1">Reviewer note</p>
                    <p className="text-sm">{sub.reviewerNote}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {sub.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-lg">
                      <FileCheck size={14} className="text-gold-500" />
                      <span className="text-xs font-medium">{doc.fileName}</span>
                      <span className="text-[10px] text-gray-muted">{doc.docType}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
