// ─── Auth ──────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenJti: string;
  refreshTokenJti: string;
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

// ─── Pagination ────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── API Error ─────────────────────────────────────────
export interface ApiError {
  type: string;
  title: string;
  status: number;
  errorCode: string;
  detail: string;
}
