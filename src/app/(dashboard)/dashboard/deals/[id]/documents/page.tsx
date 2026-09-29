"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Document, Deal } from "@/lib/types";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Upload,
  File,
  Download,
  Trash2,
} from "lucide-react";

const DOC_TYPES = [
  { value: "PROFORMA_INVOICE", label: "Proforma Invoice" },
  { value: "COMMERCIAL_INVOICE", label: "Commercial Invoice" },
  { value: "BILL_OF_LADING", label: "Bill of Lading" },
  { value: "CERTIFICATE_OF_ORIGIN", label: "Certificate of Origin" },
  { value: "INSPECTION_REPORT", label: "Inspection Report" },
  { value: "INSURANCE_CERTIFICATE", label: "Insurance Certificate" },
  { value: "PHYTOSANITARY_CERTIFICATE", label: "Phytosanitary Certificate" },
  { value: "CONFORMITY_CERTIFICATE", label: "Conformity Certificate" },
  { value: "OTHER", label: "Other" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function DealDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState("OTHER");

  useEffect(() => {
    loadData();
  }, [dealId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [docs, dealData] = await Promise.all([
        api.documents.list(dealId),
        api.deals.get(dealId),
      ]);
      setDocuments(docs);
      setDeal(dealData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of selectedFiles) {
        await api.documents.upload(dealId, deal?.currentStage || "", docType, file);
      }
      setSelectedFiles([]);
      setDocType("OTHER");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDownload(docId: string) {
    try {
      const blob = await api.documents.download(dealId, docId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = documents.find((d) => d.id === docId)?.fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/deals/" + dealId)}
          className="p-2 rounded-lg hover:bg-dark-800 transition"
        >
          <ArrowLeft size={20} className="text-gray-muted" />
        </button>
        <p className="text-sm text-muted-foreground">
          {deal?.utid || dealId}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/40 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Upload section */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-muted mb-1.5">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition"
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-dark-700 rounded-xl p-6 cursor-pointer hover:border-gold-500/50 hover:bg-gold-500/5 transition">
            <Upload size={20} className="text-gray-muted" />
            <span className="text-sm text-gray-muted">
              Click to select files (PDF, PNG, JPG up to 50MB)
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                  <File size={16} className="text-gold-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-gray-muted">{formatBytes(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 text-danger hover:text-danger transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="button-gold w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={16} strokeWidth={2.5} />
                    Upload {selectedFiles.length} file(s)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Documents list */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Uploaded Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <p className="text-gray-muted text-sm text-center py-8">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition"
              >
                <File size={18} className="text-gold-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-[11px] text-gray-muted">
                    {(DOC_TYPES.find((dt) => dt.value === doc.documentType)?.label || doc.documentType)} &middot; {" "}
                    {formatBytes(doc.sizeBytes)} &middot; {" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-700 text-gray-muted">
                  {doc.stage ? doc.stage.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : ""}
                </span>
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 text-gold-500 hover:bg-gold-500/10 rounded-lg transition"
                  title="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
