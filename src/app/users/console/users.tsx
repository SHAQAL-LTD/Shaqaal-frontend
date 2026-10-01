"use client";

import React, { useEffect, useState } from "react";
import { api, getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/api";
import type { AdminUser, AuditEventRow, ImpersonationResult } from "@/lib/types";
import {
  Eye, History, LogOut, RefreshCw, Search, Settings,
  ShieldCheck, UserCheck, UserX, Users,
} from "lucide-react";
import {
  Badge, Card, ErrorNote, FlashNote, Modal, Pager, ReasonInput, Spinner,
  StatusBadge, KV, btnGhost, btnDanger, btnGold, fmtTs, selectCls, titleize,
  useAction,
} from "./ui";
import { AuditRow } from "./audit";

const PAGE_SIZE = 50;

const ROLE_BADGES: Record<string, string> = {
  ADMIN: "bg-danger/10 text-danger border-danger/40",
  BUYER: "bg-chart-2/10 text-chart-2 border-chart-2/40",
  SUPPLIER: "bg-success/10 text-success border-success/40",
  BROKER: "bg-chart-1/10 text-chart-1 border-chart-1/40",
  FACILITATOR: "bg-chart-4/10 text-chart-4 border-chart-4/40",
  FINANCIER: "bg-secondary/60 text-muted-foreground border-border",
  COMPLIANCE_OFFICER: "bg-gold/10 text-gold-bright border-gold/40",
};

/** Role slugs as accepted by POST/PATCH /admin/users/{id}/role (Role.fromSlug). */
const ROLE_OPTIONS = [
  { value: "supplier", label: "Supplier" },
  { value: "buyer", label: "Buyer" },
  { value: "broker", label: "Broker" },
  { value: "financier", label: "Financier" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "facilitator", label: "Facilitator" },
  { value: "admin", label: "Administrator" },
];

/** VerificationStatus enum names — UPPERCASE, exactly as the backend parses them. */
const VERIFICATION_OPTIONS = ["PENDING", "PENDING_REVIEW", "INFO_REQUESTED", "APPROVED", "REJECTED"];

type Mode = "menu" | "deactivate" | "reactivate" | "revoke" | "role" | "verify" | "impersonate";

/**
 * Swap the admin session for a 15-minute impersonation token. The admin tokens are
 * parked in sessionStorage (read by the shell's View-As banner for "Exit view-as");
 * no refresh token is stored, so the session can never outlive the access token.
 */
function startViewAs(res: ImpersonationResult, target: AdminUser) {
  try {
    sessionStorage.setItem(
      "shaqal_ops_backup",
      JSON.stringify({
        accessToken: getAccessToken() || "",
        refreshToken: getRefreshToken() || "",
        targetName: target?.fullName,
        targetEmail: target?.email,
        expiresAt: Date.now() + (res.expiresInMinutes || 15) * 60000,
      }),
    );
  } catch {
    /* storage full — worst case the exit banner cannot restore the session */
  }
  clearTokens();
  setTokens(res.accessToken, "");
  // replace() (not href=): full reload so the shell re-boots on the new token.
  window.location.replace("/dashboard");
}

/** All mutating user actions in one modal — every path requires a reason and is audited. */
function UserActionModal({
  user,
  onClose,
  onDone,
  onViewAudit,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: (msg: string) => void;
  onViewAudit: () => void;
}) {
  const { busy, error, setError, run } = useAction();
  const [mode, setMode] = useState<Mode>("menu");
  const [reason, setReason] = useState("");
  const [role, setRole] = useState<string>((user.role || "buyer").toLowerCase());
  const [status, setStatus] = useState<string>(user.verificationStatus || "PENDING");

  const reasonRequired = mode === "deactivate" || mode === "revoke" || mode === "role" || mode === "verify";

  const TITLES: Record<Mode, string> = {
    menu: "Manage user",
    deactivate: "Deactivate account",
    reactivate: "Reactivate account",
    revoke: "Force sign-out",
    role: "Reassign role",
    verify: "Adjust verification",
    impersonate: "View as this user",
  };

  const CONFIRM: Record<Mode, string | undefined> = {
    menu: undefined,
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    revoke: "Sign out sessions",
    role: "Save role",
    verify: "Save status",
    impersonate: "Start view-as",
  };

  async function confirm() {
    if (reasonRequired && !reason.trim()) {
      setError("A reason is required — it is written to the audit trail.");
      return;
    }
    if (mode === "role" && role === (user.role || "").toLowerCase()) {
      setError("That is already this user's role.");
      return;
    }
    let doneMsg: string | null = null;
    const ok = await run(async () => {
      switch (mode) {
        case "deactivate":
          await api.admin.deactivateUser(user.id, reason.trim());
          doneMsg = `Deactivated ${user.email} (sessions revoked)`;
          break;
        case "reactivate":
          await api.admin.reactivateUser(user.id);
          doneMsg = `Reactivated ${user.email}`;
          break;
        case "revoke": {
          const res = await api.admin.revokeSessions(user.id, reason.trim());
          doneMsg = `Signed out ${res?.revoked ?? 0} session(s) for ${user.email}`;
          break;
        }
        case "role":
          await api.admin.changeRole(user.id, role, reason.trim());
          doneMsg = `Role of ${user.email} changed to ${titleize(role)}`;
          break;
        case "verify":
          await api.admin.updateVerification(user.id, status, reason.trim());
          doneMsg = `Verification of ${user.email} set to ${titleize(status)}`;
          break;
        case "impersonate": {
          const res = await api.admin.impersonate(user.id);
          startViewAs(res, user);
          break;
        }
        default:
          break;
      }
    });
    if (!ok) return;
    if (mode === "impersonate") return; // full-page redirect in progress
    if (doneMsg) onDone(doneMsg);
    onClose();
  }


  return (
    <Modal
      title={TITLES[mode]}
      subtitle={mode === "menu" ? `${user.fullName} · ${user.email}` : undefined}
      onClose={onClose}
      onConfirm={confirm}
      confirmLabel={CONFIRM[mode]}
      danger={mode === "deactivate" || mode === "revoke"}
      busy={busy}
      error={error}
    >
      {mode === "menu" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold border " + (ROLE_BADGES[user.role] || "bg-dark-700 text-gray-muted")}>
              {titleize(user.role)}
            </span>
            <StatusBadge status={user.verificationStatus} />
            {!user.active && <Badge tone="danger">Inactive</Badge>}
            {user.emailVerified && <Badge tone="success">Email verified</Badge>}
          </div>

          <div className="rounded-xl border border-border/60 px-3 py-2">
            <KV k="Phone" v={user.phone || "—"} />
            <KV k="Country" v={titleize(user.country)} />
            <KV k="Joined" v={fmtTs(user.createdAt)} />
            <KV k="Last update" v={fmtTs(user.updatedAt)} />
            <KV k="Email verified at" v={fmtTs(user.emailVerifiedAt)} />
          </div>

          <div className="grid gap-2">
            <button onClick={() => setMode("revoke")} className={btnGhost + " flex items-center gap-2 !py-2.5 !text-[13px]"}>
              <LogOut size={14} /> Force sign-out (revoke all sessions)
            </button>
            <button onClick={() => setMode("role")} className={btnGhost + " flex items-center gap-2 !py-2.5 !text-[13px]"}>
              <Settings size={14} /> Reassign role
            </button>
            <button onClick={() => setMode("verify")} className={btnGhost + " flex items-center gap-2 !py-2.5 !text-[13px]"}>
              <ShieldCheck size={14} /> Adjust verification status
            </button>
            <button onClick={onViewAudit} className={btnGhost + " flex items-center gap-2 !py-2.5 !text-[13px]"}>
              <History size={14} /> View full audit history
            </button>
            <button onClick={() => setMode("impersonate")} className={btnGhost + " flex items-center gap-2 !py-2.5 !text-[13px]"}>
              <Eye size={14} /> View as this user (15 min, audited)
            </button>
            {user.active ? (
              <button onClick={() => setMode("deactivate")} className={btnDanger + " mt-1 flex items-center gap-2"}>
                <UserX size={14} /> Deactivate account
              </button>
            ) : (
              <button onClick={() => setMode("reactivate")} className={btnGold + " mt-1 flex items-center gap-2"}>
                <UserCheck size={14} /> Reactivate account
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "deactivate" && (
        <div className="space-y-4">
          <p className="text-[13px] text-muted-foreground">
            {user.email} will lose access immediately and every outstanding session is revoked.
          </p>
          <ReasonInput value={reason} onChange={setReason} placeholder="e.g. Compliance escalation — account suspended pending investigation" />
        </div>
      )}

      {mode === "reactivate" && (
        <p className="text-[13px] text-muted-foreground">
          Restore access for {user.email}. The reactivation is recorded in the audit trail.
        </p>
      )}

      {mode === "revoke" && (
        <div className="space-y-4">
          <p className="text-[13px] text-muted-foreground">
            Force {user.email} to sign out everywhere — every outstanding refresh token is
            revoked. The account itself stays active.
          </p>
          <ReasonInput value={reason} onChange={setReason} placeholder="e.g. Suspected credential sharing" />
        </div>
      )}

      {mode === "role" && (
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
              New role (currently {titleize(user.role)})
            </span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <ReasonInput value={reason} onChange={setReason} placeholder="e.g. Moved from broker to facilitator per reassignment" />
        </div>
      )}

      {mode === "verify" && (
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
              Verification status (currently {titleize(user.verificationStatus)})
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
              {VERIFICATION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {titleize(s)}
                </option>
              ))}
            </select>
          </div>
          <ReasonInput value={reason} onChange={setReason} placeholder="e.g. Paper KYC verified by compliance desk — reference PDF-4471" />
        </div>
      )}

      {mode === "impersonate" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-[12px] text-gold">
            You will be signed in as {user.email} for 15 minutes to reproduce what they see.
            The session is itself audited, carries no refresh token, and ends automatically.
          </div>
          <p className="text-[13px] text-muted-foreground">
            Use the <span className="text-foreground">Exit view-as</span> banner at the top of
            the platform to return to this console at any time.
          </p>
        </div>
      )}
    </Modal>
  );
}

/** Per-user audit history — actions performed BY them and ON them. */
function UserAuditModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [events, setEvents] = useState<AuditEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .userAudit(user.id, 0, 50)
      .then((rows) => {
        if (!alive) return;
        setEvents(Array.isArray(rows) ? rows : []);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load audit history");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user.id]);

  return (
    <Modal title="Audit history" subtitle={`${user.fullName} · ${user.email}`} onClose={onClose}>
      {loading ? (
        <Spinner label="Loading audit history…" />
      ) : error ? (
        <ErrorNote message={error} />
      ) : events.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-gray-muted">No audit events involve this user yet.</p>
      ) : (
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {events.map((e) => (
            <AuditRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </Modal>
  );
}

/** Users — search + role filter, and every user administration action. */
export default function UsersSection() {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [auditFor, setAuditFor] = useState<AdminUser | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .listUsers(query || undefined, role || undefined, page, PAGE_SIZE)
      .then((d) => {
        if (!alive) return;
        setUsers(d.content || []);
        setTotal(typeof d.totalElements === "number" ? d.totalElements : null);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load users");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query, role, page, reloadKey]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  const handleDone = (msg: string) => {
    setFlash(msg);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-[13px] text-gray-muted">
            Accounts platform-wide — sessions, roles, verification and view-as.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <FlashNote message={flash} />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-dark-700 bg-dark-800 px-3 py-2 focus-within:border-gold-500">
            <Search size={15} className="shrink-0 text-gray-muted" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(0);
                  setQuery(draft.trim());
                }
              }}
              placeholder="Search by name, email or phone…"
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-neutral-600 outline-none"
            />
            <button
              onClick={() => {
                setPage(0);
                setQuery(draft.trim());
              }}
              className="shrink-0 rounded-lg bg-gold-500 px-3 py-1 text-[12px] font-semibold text-dark-950 transition hover:bg-gold-400"
            >
              Search
            </button>
          </div>
          <select
            value={role}
            onChange={(e) => {
              setPage(0);
              setRole(e.target.value);
            }}
            className={selectCls + " w-auto"}
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value.toUpperCase()}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading users…" />
        ) : error ? (
          <ErrorNote message={error} />
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={26} className="mx-auto text-dark-500" />
            <p className="mt-2 text-[13px] text-gray-muted">No users match this filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-dark-800/40 p-3 transition hover:border-gold/30"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 text-[11px] font-bold text-dark-950">
                    {user.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[13px] font-semibold">{user.fullName}</p>
                      <span className={"px-2 py-0.5 rounded-full text-[10px] font-semibold border " + (ROLE_BADGES[user.role] || "bg-dark-700 text-gray-muted")}>
                        {titleize(user.role)}
                      </span>
                      <StatusBadge status={user.verificationStatus} />
                      {!user.active && <Badge tone="danger">Inactive</Badge>}
                    </div>
                    <p className="truncate text-[11px] text-gray-muted">
                      {user.email}
                      {user.phone ? ` · ${user.phone}` : ""}
                    </p>
                  </div>
                  <p className="hidden shrink-0 text-[11px] text-gray-muted md:block">{fmtTs(user.createdAt)}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => setAuditFor(user)}
                      title="Audit history"
                      className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                    >
                      <History size={14} />
                    </button>
                    <button
                      onClick={() => setTarget(user)}
                      className="flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-1.5 text-[12px] font-semibold text-gold transition hover:bg-gold/20"
                    >
                      <Settings size={13} /> Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pager page={page} size={PAGE_SIZE} total={total} onPage={(p) => setPage(Math.max(0, p))} />
          </>
        )}
      </Card>

      {target && (
        <UserActionModal
          user={target}
          onClose={() => setTarget(null)}
          onDone={handleDone}
          onViewAudit={() => {
            setAuditFor(target);
            setTarget(null);
          }}
        />
      )}
      {auditFor && <UserAuditModal user={auditFor} onClose={() => setAuditFor(null)} />}
    </div>
  );
}
