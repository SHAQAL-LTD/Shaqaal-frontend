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

// ─── Centralized error handling ───────────────────────
// Every non-2xx response is parsed into the backend's RFC 7807 ProblemDetail
// shape ({ detail, errorCode, requestId, fieldErrors }) and turned into a
// SPECIFIC user-facing message by buildMessage(). Call sites should surface
// `err.message` (or, preferably, apiErrorMessage(err, fallback)) — never a
// hand-rolled generic string.

/** The backend's catch-all 500 detail — a non-message, never show it verbatim. */
const GENERIC_INTERNAL = "An unexpected error occurred.";

function withReference(message: string, requestId?: string): string {
  return requestId ? `${message} (Reference: ${requestId})` : message;
}

/**
 * Map a parsed backend error body to the most specific, human-readable message
 * we can build. Known errorCodes get tailored text; codes that carry a real
 * `detail` (business rules, KYC, compliance…) are surfaced verbatim; anything
 * else falls back to an honest 5xx/general message with the requestId quoted
 * so the user can hand it to support.
 */
function buildMessage(e: ApiErrorType): string {
  const code = e.errorCode || "UNKNOWN";
  const status = e.status || 0;
  const detail = (e.detail || "").trim();
  const generic = !detail || detail === GENERIC_INTERNAL;

  switch (code) {
    case "AUTH_TOKEN_EXPIRED":
    case "AUTH_TOKEN_INVALID":
    case "AUTH_UNAUTHORIZED":
      return "Your session expired — please sign in again.";
    case "AUTH_INVALID_CREDENTIALS":
      return generic ? "Incorrect email or password." : detail;
    case "AUTH_FORBIDDEN":
      return generic ? "You don't have permission to perform this action." : detail;
    case "EMAIL_NOT_VERIFIED":
      return generic ? "Verify your email address before continuing." : detail;
    case "RATE_LIMITED":
      return generic ? "Too many attempts — wait a minute, then try again." : detail;
    case "NETWORK_ERROR":
      return "Can't reach the server — check your connection and try again.";
    case "VALIDATION_FAILED": {
      const fields = e.fieldErrors ?? [];
      if (fields.length > 0) {
        const listed = fields
          .map((f) => (f.field && f.message ? `${f.field}: ${f.message}` : f.field || f.message))
          .join(" · ");
        return `Check these details — ${listed}`;
      }
      return generic ? "Some of the details you entered aren't valid." : detail;
    }
    default:
      break;
  }

  // 5xx / the backend's own catch-all — be honest, quote the support reference.
  if (status >= 500 || code === "INTERNAL_ERROR") {
    return withReference("Something went wrong on our end — please try again.", e.requestId);
  }

  // Any other code that carries a real backend message (BUSINESS_RULE_VIOLATION,
  // KYC_*, COMPLIANCE_*, RESOURCE_NOT_FOUND, IDEMPOTENCY_KEY_REPLAY…) is already
  // specific — surface it verbatim.
  if (!generic) return detail;

  return withReference(
    status ? `The request failed (HTTP ${status}).` : "The request failed — please try again.",
    e.requestId,
  );
}

export class ApiClientError extends Error {
  status: number;
  errorCode: string;
  detail: string;
  requestId?: string;
  fieldErrors?: NonNullable<ApiErrorType["fieldErrors"]>;
  constructor(error: ApiErrorType) {
    super(buildMessage(error)); // message is ALWAYS the specific, user-facing text
    this.name = "ApiClientError";
    this.status = error.status;
    this.errorCode = error.errorCode || "UNKNOWN";
    this.detail = error.detail || "";
    this.requestId = error.requestId;
    this.fieldErrors = error.fieldErrors;
  }
}

/**
 * THE error-to-string entry point for every catch site: `apiErrorMessage(err,
 * "Failed to do the thing")`. Handles ApiClientError (specific text), network
 * TypeErrors, other Error subclasses, and non-Error throws (→ fallback).
 */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong — please try again."): string {
  if (err instanceof ApiClientError) return err.message;
  if (err instanceof TypeError) return "Can't reach the server — check your connection and try again.";
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}

/**
 * Advance-specific wording: stage gates come back as BUSINESS_RULE_VIOLATION
 * with a "Cannot advance: …" detail (the backend has no dedicated stage-gate
 * error code), so reframe them as the proactive, specific note the user sees.
 */
export function advanceErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError && err.errorCode === "BUSINESS_RULE_VIOLATION" && err.detail) {
    const requirement = err.detail.replace(/^cannot advance:\s*/i, "");
    return `This deal can't advance yet — ${requirement}`;
  }
  return apiErrorMessage(err, "Couldn't advance this stage — please try again.");
}

/** Parse ANY non-2xx response into the backend's ProblemDetail shape. */
async function toApiError(res: Response): Promise<ApiErrorType> {
  let text = "";
  try {
    text = await res.text();
  } catch {
    /* body unreadable — fall through to status-based message */
  }

  let body: Record<string, unknown> | null = null;
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
    } catch {
      /* non-JSON body (proxy error page / plain text) — handled below */
    }
  }

  const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
  const rawFields = Array.isArray(body?.fieldErrors) ? (body.fieldErrors as unknown[]) : [];
  const fieldErrors = rawFields
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f) => ({
      field: String(f.field ?? ""),
      message: String(f.message ?? ""),
      ...(typeof f.rejectedValue === "string" ? { rejectedValue: f.rejectedValue } : {}),
    }))
    .filter((f) => f.field || f.message);

  // Prefer the ProblemDetail `detail`, then a bare JSON `message`, then a
  // plain-text body — but never an HTML error page or a bare statusText.
  const detail =
    str(body?.detail) ??
    str(body?.message) ??
    (body === null && text && !/^\s*</.test(text) ? text.trim().slice(0, 300) : "");

  return {
    type: str(body?.type) ?? "",
    title: str(body?.title) ?? res.statusText ?? "Error",
    status: typeof body?.status === "number" ? body.status : res.status,
    errorCode: str(body?.errorCode) ?? (res.status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN"),
    detail,
    requestId: str(body?.requestId),
    fieldErrors: fieldErrors.length > 0 ? fieldErrors : undefined,
  };
}

/** fetch that converts unreachable-network TypeErrors into a typed, mappable error. */
async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiClientError({
      type: "",
      title: "Network error",
      status: 0,
      errorCode: "NETWORK_ERROR",
      detail: "",
    });
  }
}

async function refreshAccessToken(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiClientError({
      type: "",
      title: "Authentication required",
      status: 401,
      errorCode: "AUTH_TOKEN_INVALID",
      detail: "",
    });
  }
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await safeFetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new ApiClientError(await toApiError(res));
      const data: AuthResponse = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
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

  let res = await safeFetch(url.toString(), {
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
        res = await safeFetch(url.toString(), {
          method,
          headers,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        });
      }
    } catch {
      clearTokens();
      // Session expiry returns you to the sign-in you came from — the platform
      // login, or the operations console for admin sessions on /users.
      if (typeof window !== "undefined") {
        window.location.href = window.location.pathname.startsWith("/users") ? "/users" : "/login";
      }
      throw new ApiClientError({
        type: "",
        title: "Authentication required",
        status: 401,
        errorCode: "AUTH_TOKEN_EXPIRED",
        detail: "",
      });
    }
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) throw new ApiClientError(await toApiError(res));
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
    /** Operations-console sign-in — the only way an admin account can obtain tokens. */
    operationsLogin: (data: { email: string; password: string }) =>
      request<T.AuthResponse>("/auth/operations/login", { method: "POST", body: data }),
    refresh: () => refreshAccessToken(),
    logout: () => { clearTokens(); },
    forgotPassword: (email: string) =>
      request<void>("/auth/forgot-password", { method: "POST", body: { email } }),
    verifyEmail: (token: string) =>
      request<any>("/auth/verify-email?token=" + token),
    resendVerification: () =>
      request<any>("/auth/resend-verification", { method: "POST" }),
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
    /** Dry-run every stage gate — what's missing before this deal can advance. */
    blockers: (id: string) => request<T.DealBlockers>(`/deals/${id}/blockers`),
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
    list: (dealId: string) =>
      request<T.Document[]>(`/deals/${dealId}/documents`),
    upload: (dealId: string, stage: string, type: string, file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return request<T.Document>(`/deals/${dealId}/documents`, { method: "POST", body: fd, params: { stage, type } });
    },
    download: async (dealId: string, documentId: string) => {
      const token = getAccessToken();
      const url = `${API_URL}/deals/${dealId}/documents/${documentId}/content`;
      const res = await safeFetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new ApiClientError(await toApiError(res));
      return res.blob();
    },
  },
  kyc: {
    submit: (docTypes: string[], files: File[], organizationId?: string) => {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      docTypes.forEach(dt => fd.append("docTypes", dt));
      const params: Record<string, string> = {};
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
  dealParties: {
    list: (dealId: string) => request<T.DealParty[]>(`/deals/${dealId}/parties`),
    add: (dealId: string, data: { organizationId: string; partyRole: string }) =>
      request<T.DealParty>(`/deals/${dealId}/parties`, { method: "POST", body: data, headers: { "Idempotency-Key": crypto.randomUUID() } }),
    remove: (dealId: string, organizationId: string) =>
      request<void>(`/deals/${dealId}/parties/${organizationId}`, { method: "DELETE" }),
  },
  commissionTree: {
    get: (dealId: string) => request<T.CommissionTree>(`/deals/${dealId}/commission-tree`),
    create: (dealId: string) =>
      request<T.CommissionTree>(`/deals/${dealId}/commission-tree`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } }),
    lock: (treeId: string) =>
      request<T.CommissionTree>(`/commission/trees/${treeId}/lock`, { method: "POST" }),
  },
  commissionNodes: {
    list: (treeId: string) => request<T.CommissionNode[]>(`/commission/trees/${treeId}/nodes`),
    add: (treeId: string, data: {
      organizationId: string;
      parentNodeId?: string;
      allocationType: string;
      allocationValue: number;
      walletLabel?: string;
      buyingSide: boolean;
    }) => request<T.CommissionNode>(`/commission/trees/${treeId}/nodes`, { method: "POST", body: data, headers: { "Idempotency-Key": crypto.randomUUID() } }),
    remove: (treeId: string, nodeId: string) =>
      request<void>(`/commission/trees/${treeId}/nodes/${nodeId}`, { method: "DELETE" }),
  },
  contracts: {
    render: (dealId: string, templateId: string) =>
      request<{ id: string; stage: string; documentType: string; fileName: string }>(
        `/deals/${dealId}/contracts/${templateId}/render`,
        { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } }
      ),
  },

  payments: {
    initializePaystack: (data: { dealId: string; amountUsd: number; paymentType: string; description?: string }) =>
      request<{ paymentId: string; paystackReference: string; authorizationUrl: string; accessCode: string; usdtAddress: string | null }>(
        "/payments/paystack/initialize", { method: "POST", body: data }
      ),
    initializeUsdt: (data: { dealId: string; amountUsd: number; paymentType: string; description?: string }, network = "TRC20") =>
      request<{ paymentId: string; paystackReference: string | null; authorizationUrl: string | null; accessCode: string | null; usdtAddress: string }>(
        "/payments/usdt/initialize?network=" + network, { method: "POST", body: data }
      ),
    listByDeal: (dealId: string) => request<any[]>("/payments/deal/" + dealId),
    listMine: (page = 0, size = 20) => request<any>("/payments/my?page=" + page + "&size=" + size),
    get: (id: string) => request<any>("/payments/" + id),
  },

  dashboard: {
    /** Shell summary for the sidebar Compliance status box (any authenticated role). */
    summary: () => request<T.DashboardSummary>("/dashboard/summary"),
  },

  /** In-app notifications — used by the shell + console bells. */
  notifications: {
    list: (page = 0, size = 20) =>
      request<T.PageResponse<T.NotificationItem>>("/notifications", { params: { page, size } }),
    unreadCount: () => request<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) => request<void>("/notifications/" + id + "/read", { method: "POST" }),
    markAllRead: () => request<void>("/notifications/read-all", { method: "POST" }),
  },

  admin: {
    listUsers: (search?: string, role?: string, page = 0, size = 20) => {
      const params: Record<string, string | number> = { page, size };
      if (search) params.search = search;
      if (role) params.role = role;
      return request<T.PageResponse<T.AdminUser>>("/admin/users", { params });
    },
    deactivateUser: (userId: string, reason?: string) =>
      request<void>("/admin/users/" + userId + "/deactivate", { method: "POST", body: { reason: reason || "Admin action" } }),
    reactivateUser: (userId: string) =>
      request<void>("/admin/users/" + userId + "/reactivate", { method: "POST" }),
    updateVerification: (userId: string, status: string, reason?: string) =>
      request<void>("/admin/users/" + userId + "/verification", { method: "PATCH", body: { status, reason: reason || "" } }),
    changeRole: (userId: string, role: string, reason: string) =>
      request<void>("/admin/users/" + userId + "/role", { method: "PATCH", body: { role, reason } }),
    revokeSessions: (userId: string, reason: string) =>
      request<{ revoked: number }>("/admin/users/" + userId + "/revoke-sessions", { method: "POST", body: { reason } }),
    userAudit: (userId: string, page = 0, size = 50) =>
      request<T.AuditEventRow[]>("/admin/users/" + userId + "/audit", { params: { page, size } }),
    impersonate: (userId: string) =>
      request<T.ImpersonationResult>("/admin/users/" + userId + "/impersonate", { method: "POST" }),
    stats: () => request<T.PlatformStats>("/admin/stats"),
    auditTrail: (page = 0, size = 50) => request<T.AuditEventRow[]>("/admin/audit?page=" + page + "&size=" + size),
    systemHealth: () => request<T.SystemHealth>("/admin/health"),
    getUserActivity: (userId: string) => request<T.UserActivity>("/admin/users/" + userId + "/activity"),

    // Deals
    deals: (params: Record<string, string | number | undefined>) =>
      request<T.AdminPage<T.AdminDealRow>>("/admin/deals", { params }),
    dealBlockers: (dealId: string) => request<T.DealBlockers>("/admin/deals/" + dealId + "/blockers"),
    forceAdvance: (dealId: string, reason: string) =>
      request<T.Deal>("/admin/deals/" + dealId + "/force-advance", { method: "POST", body: { reason } }),

    // Payments
    payments: (params: Record<string, string | number | undefined>) =>
      request<T.AdminPage<T.AdminPaymentRow>>("/admin/payments", { params }),
    webhookEvents: (params: Record<string, string | number | undefined>) =>
      request<T.AdminPage<T.WebhookEventRow>>("/admin/payments/webhook-events", { params }),
    reconcilePayment: (paymentId: string, status: string, reason: string) =>
      request<T.ReconcileResult>("/admin/payments/" + paymentId + "/reconcile", { method: "POST", body: { status, reason } }),

    // Compliance / KYC
    kycQueue: (params: Record<string, string | number | undefined>) =>
      request<T.AdminPage<T.KycQueueRow>>("/admin/kyc/queue", { params }),
    kycBulkDecide: (submissionIds: string[], decision: string, note: string) =>
      request<T.BulkDecideResult>("/admin/kyc/bulk-decisions", { method: "POST", body: { submissionIds, decision, note } }),

    // Commissions
    commissionTrees: (page = 0, size = 50) =>
      request<T.AdminPage<T.CommissionTreeRow>>("/admin/commission-trees", { params: { page, size } }),

    // Settings / config
    config: () => request<T.ConfigEntry[]>("/admin/config"),
    updateConfig: (key: string, value: string, description?: string) =>
      request<void>("/admin/config/" + encodeURIComponent(key), { method: "PUT", body: { value, description: description || "" } }),
    countryProfiles: () => request<T.CountryProfileRow[]>("/admin/config/countries"),
    upsertCountryProfile: (code: string, body: { displayName: string; fields?: unknown[]; requiredDocTypes?: string[] }) =>
      request<T.CountryProfileRow>("/admin/config/countries/" + encodeURIComponent(code), { method: "PUT", body }),
  },
};
