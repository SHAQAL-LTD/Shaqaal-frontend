// ─── Auth ──────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  userId: string;
  email: string;
  role: string;
  country: string;
  authorities: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  country: string;
  verificationStatus: string;
  active: boolean;
  createdAt: string;
}

// ─── Enums ─────────────────────────────────────────────
export type DealStage =
  | "STAGE_01_REGISTRATION"
  | "STAGE_02_NDA"
  | "STAGE_03_KYC"
  | "STAGE_04_SPA_SIGNATURE"
  | "STAGE_05_PROOF_OF_FUNDS"
  | "STAGE_06_LC_ISSUANCE"
  | "STAGE_07_ORIGIN_LOGISTICS"
  | "STAGE_08_SHIPPING"
  | "STAGE_09_DESTINATION_CLEARANCE"
  | "STAGE_10_SETTLEMENT";

export type UserRole =
  | "SUPPLIER"
  | "BUYER"
  | "BROKER"
  | "FINANCIER"
  | "COMPLIANCE_OFFICER"
  | "FACILITATOR"
  | "ADMIN";

// ─── Deals ─────────────────────────────────────────────
export interface Deal {
  id: string;
  utid: string | null;
  mineralType: string;
  quantityKg: number;
  purityPercent: number;
  originCountry: string;
  destinationCountry: string;
  afcftaEligible: boolean;
  manualPriceUsd: number | null;
  currentStage: DealStage;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  mineralType: string;
  quantityKg: number;
  purityPercent: number;
  originCountry: string;
  destinationCountry: string;
  afcftaEligible: boolean;
  manualPriceUsd?: number;
}

// ─── Deal Parties ──────────────────────────────────────
export interface DealParty {
  dealId: string;
  organizationId: string;
  organizationName: string;
  partyRole: string;
  addedAt: string;
}

// ─── Documents ─────────────────────────────────────────
export interface Document {
  id: string;
  dealId: string;
  stage: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  hashSha256: string;
  createdAt: string;
}

// ─── Organizations ─────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  legalName: string | null;
  country: string;
  registrationNumber: string | null;
  taxId: string | null;
  verified: boolean;
  createdAt: string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  fullName: string;
  roleInOrg: string;
  createdAt: string;
}

// ─── Commission ────────────────────────────────────────
export interface CommissionTree {
  id: string;
  dealId: string;
  locked: boolean;
  lockedAt: string | null;
  createdAt: string;
}

export interface CommissionNode {
  id: string;
  treeId: string;
  organizationId: string;
  organizationName: string;
  parentNodeId: string | null;
  allocationType: "PERCENTAGE" | "FLAT";
  allocationValue: number;
  walletLabel: string | null;
  buyingSide: boolean;
  createdAt: string;
}

// ─── Audit ─────────────────────────────────────────────
export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorUserId: string | null;
  actorRole: string | null;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
}


// ─── KYC Submissions ─────────────────────────────────
export interface KycDocument {
  id: string;
  docType: string;
  fileName: string;
  contentType: string;
  byteSize: number;
  contentSha256: string;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  organizationId: string | null;
  status: string;
  reviewerId: string | null;
  reviewerNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  createdAt: string;
  documents: KycDocument[];
}

// ─── Compliance Reviews ──────────────────────────────
export interface ComplianceReview {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  organizationId: string | null;
  status: string;
  submittedAt: string;
  documentCount: number;
}

export interface ComplianceReviewDetail {
  submission: KycSubmission;
  submitterFullName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterCountry: string;
  submitterRole: string;
}

// ─── Country Compliance ──────────────────────────────
export interface CountryField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  pattern: string | null;
  maxLength: number | null;
}

export interface CountryProfile {
  countryCode: string;
  displayName: string;
  schemaVersion: number;
  fields: CountryField[];
  requiredDocTypes: string[];
  baselineDocTypes: string[];
}

// ─── Pagination ────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── API Error ─────────────────────────────────────────
/** One invalid field from a 400/422 bean-validation failure. */
export interface ApiFieldError {
  field: string;
  message: string;
  rejectedValue?: string;
}

/**
 * RFC 7807 Problem Detail as emitted by the backend's GlobalExceptionHandler.
 * `errorCode`, `requestId` and `fieldErrors` are extension properties — see
 * shaqal-app .../common/GlobalExceptionHandler.java.
 */
export interface ApiError {
  type: string;
  title: string;
  status: number;
  errorCode: string;
  detail: string;
  /** UUID the user can quote to support — always logged server-side. */
  requestId?: string;
  /** Present only on validation failures. */
  fieldErrors?: ApiFieldError[];
}

// ─── Dashboard shell summary (GET /dashboard/summary) ──
export interface DashboardSummary {
  /** Exact count of non-completed deals visible to the caller. */
  activeRooms: number;
  /** Global latest audit-event timestamp (ISO-8601), null when the log is empty. */
  lastAuditAt: string | null;
}

// ─── Operations console (/admin/*, /notifications) ─────

/** Flat page shape returned by the operations list endpoints. */
export interface AdminPage<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  country: string | null;
  verificationStatus: string | null;
  active: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ImpersonationResult {
  accessToken: string;
  user: AdminUser;
  expiresInMinutes: number;
}

export interface UserActivity {
  user: AdminUser;
  dealCount: number;
  paymentCount: number;
  auditCount: number;
}

/** One `audit_event` row (raw JDBC columns — snake_case). */
export interface AuditEventRow {
  id: string;
  occurred_at: string;
  actor_user_id: string | null;
  actor_role: string | null;
  module: string;
  entity_type: string;
  entity_id: string;
  action: string;
  /** JSONB payload — arrives as an object or a JSON string depending on the driver path. */
  before_json: unknown;
  after_json: unknown;
  ip_address: string | null;
  correlation_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalDeals: number;
  totalKyc: number;
  recentUsers: number;
  recentDeals: number;
  usersByRole: { role: string; count: number }[];
  dealsByStage: { stage: string; count: number }[];
  paymentSummary: { status: string; count: number; total: number | string }[];
}

export interface SystemHealth {
  status: string;
  degradedReasons: string[];
  database: {
    status: string;
    type: string;
    sizeBytes: number;
    tables: number;
    pool: { active?: number; idle?: number; total?: number; awaiting?: number };
  };
  redis: { status: string; rateLimiting: string };
  webhooks: {
    last24h: { provider: string; status: string; count: number }[];
    failures24h: number;
  };
  notifications: {
    last24h: { channel: string; status: string; count: number }[];
    failures24h: number;
    unreadInApp: number;
  };
}

export interface AdminDealRow {
  id: string;
  utid: string | null;
  stage: string;
  completed: boolean;
  mineral: string | null;
  origin: string | null;
  destination: string | null;
  price: number | string | null;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
  document_count: number;
  completed_payments: number;
}

export interface DealBlockers {
  dealId: string;
  stage: string;
  completed: boolean;
  blocked: boolean;
  blockers: { gate: string; ok: boolean; message: string }[];
  documents: { type: string; created_at: string }[];
  partyRoles: string[];
  payments: { completedCount: number; failedCount: number; pendingCount: number };
}

export interface AdminPaymentRow {
  id: string;
  status: string;
  method: string;
  type: string;
  amount: number | string;
  currency: string;
  reference: string | null;
  txHash: string | null;
  network: string | null;
  description: string | null;
  created_at: string;
  paid_at: string | null;
  dealId: string;
  dealUtid: string | null;
  payerId: string;
  payerName: string;
  payerEmail: string;
  payeeName: string | null;
}

export interface WebhookEventRow {
  id: string;
  provider: string;
  externalReference: string | null;
  paymentId: string | null;
  status: string;
  errorMessage: string | null;
  payload: string | null;
  receivedAt: string;
}

export interface ReconcileResult {
  id: string;
  status: string;
  previousStatus: string;
  paidAt: string | null;
}

export interface KycQueueRow {
  id: string;
  user_id: string;
  status: string;
  reviewer_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user_name: string;
  user_email: string;
  country: string;
  role: string;
  user_verification: string;
  age_hours: number;
  document_count: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
}

export interface BulkDecideResult {
  processed: number;
  errors: { submissionId: string; error: string }[];
}

export interface CommissionTreeRow {
  id: string;
  locked: boolean;
  locked_at: string | null;
  created_at: string;
  deal_id: string;
  utid: string | null;
  completed: boolean;
  current_stage: string;
  manual_price_usd: number | string | null;
  total_percent: number | string;
  node_count: number;
  payout_count: number;
  payouts_paid: number;
  payouts_pending: number;
  payouts_failed: number;
  payout_total: number | string;
  issues: string[];
}

export interface ConfigEntry {
  key: string;
  value: unknown;
  description: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CountryProfileRow {
  country: string;
  schemaVersion: number;
  displayName: string | null;
  fields: unknown[];
  requiredDocTypes: string[];
  updatedAt: string | null;
}

export interface NotificationItem {
  id: string;
  notificationType: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
