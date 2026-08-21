import type { AuthResponse, ApiError as ApiErrorType } from "./types";
import type * as T from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const TOKEN_KEY = "shaqal_access_token";
const REFRESH_KEY = "shaqal_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<AuthResponse> | null = null;

async function refreshAccessToken(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data: AuthResponse = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export class ApiClientError extends Error {
  status: number;
  errorCode: string;
  detail: string;
  constructor(error: ApiErrorType) {
    super(error.detail);
    this.name = "ApiClientError";
    this.status = error.status;
    this.errorCode = error.errorCode;
    this.detail = error.detail;
  }
}

async function request<T>(path: string, options: {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
} = {}): Promise<T> {
  const { body, params, headers: customHeaders, method = "GET" } = options;
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const token = getAccessToken();
  const headers: Record<string, string> = { ...customHeaders };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";

  let res = await fetch(url.toString(), {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      await refreshAccessToken();
      const newToken = getAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url.toString(), {
          method,
          headers,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        });
      }
    } catch {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let err: ApiErrorType;
    try { err = await res.json(); } catch {
      err = { type: "", title: "Error", status: res.status, errorCode: "UNKNOWN", detail: res.statusText };
    }
    throw new ApiClientError(err);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}


export const api = {
  auth: {
    register: (data: { fullName: string; email: string; phone: string; password: string; role: string; country: string }) =>
      request<T.AuthResponse>("/auth/register", { method: "POST", body: data, headers: { "Idempotency-Key": crypto.randomUUID() } }),
    login: (data: { email: string; password: string }) =>
      request<T.AuthResponse>("/auth/login", { method: "POST", body: data }),
    refresh: () => refreshAccessToken(),
    logout: () => { clearTokens(); },
    forgotPassword: (email: string) =>
      request<void>("/auth/forgot-password", { method: "POST", body: { email } }),
    resetPassword: (token: string, newPassword: string) =>
      request<void>("/auth/reset-password", { method: "POST", body: { token, newPassword } }),
  },
  me: {
    get: () => request<T.UserProfile>("/me"),
    patch: (data: { fullName?: string; phone?: string }) =>
      request<T.UserProfile>("/me", { method: "PATCH", body: data }),
  },
  deals: {
    list: (page = 0, size = 20) =>
      request<T.PageResponse<T.Deal>>("/deals", { params: { page, size } }),
    get: (id: string) => request<T.Deal>(`/deals/${id}`),
    create: (data: T.CreateDealRequest) =>
      request<T.Deal>("/deals", { method: "POST", body: data, headers: { "Idempotency-Key": crypto.randomUUID() } }),
    advance: (id: string, notes?: string) =>
      request<T.Deal>(`/deals/${id}/advance`, { method: "POST", params: { notes } }),
  },
  organizations: {
    list: (page = 0, size = 20) =>
      request<T.PageResponse<T.Organization>>("/organizations", { params: { page, size } }),
    get: (id: string) => request<T.Organization>(`/organizations/${id}`),
    create: (data: { name: string; legalName?: string; country: string }) =>
      request<T.Organization>("/organizations", { method: "POST", body: data }),
    members: (id: string) => request<T.OrganizationMember[]>(`/organizations/${id}/members`),
  },
  documents: {
    upload: (dealId: string, stage: string, type: string, file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return request<T.Document>(`/deals/${dealId}/documents`, { method: "POST", body: fd, params: { stage, type } });
    },
    download: async (dealId: string, documentId: string) => {
      const token = getAccessToken();
      const url = `${API_URL}/deals/${dealId}/documents/${documentId}/content`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("Download failed");
      return res.blob();
    },
  },
  kyc: {
    submit: (docTypes: string[], files: File[], organizationId?: string) => {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const params: Record<string, string> = { docTypes: docTypes.join(",") };
      if (organizationId) params.organizationId = organizationId;
      return request<T.KycSubmission>("/kyc/submissions", { method: "POST", body: fd, params });
    },
    get: (id: string) => request<T.KycSubmission>(`/kyc/submissions/${id}`),
    listMine: () => request<T.KycSubmission[]>("/kyc/submissions/me"),
    cancelOpen: () => request<void>("/kyc/submissions/open", { method: "DELETE" }),
  },
  compliance: {
    queue: (status = "pending") => request<T.ComplianceReview[]>("/compliance/reviews", { params: { status } }),
    get: (id: string) => request<T.ComplianceReviewDetail>(`/compliance/reviews/${id}`),
    decide: (id: string, decision: string, note?: string) =>
      request<T.ComplianceReviewDetail>(`/compliance/reviews/${id}/decision`, { method: "POST", body: { decision, note } }),
  },
  audit: {
    getDealAudit: (dealId: string) => request<T.AuditEvent[]>(`/deals/${dealId}/audit`),
    exportDeal: (dealId: string) => request<{ dealConfiguration: T.Deal; timeline: T.AuditEvent[] }>(`/deals/${dealId}/audit/export`),
  },
  countries: {
    profile: (code: string) => request<T.CountryProfile>(`/countries/${code}/compliance-fields`),
  },
};
