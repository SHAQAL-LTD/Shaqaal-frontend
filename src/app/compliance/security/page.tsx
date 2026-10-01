import { SpecPage } from "@/components/content-page";

export default function SecurityPage() {
  return (
    <SpecPage
      eyebrow="Compliance"
      title="Security"
      intro="Defence in depth for high-value trades: strong authentication, hard authorization, and an audit trail nobody can rewrite."
      updated="Last updated: August 2026"
      blocks={[
        {
          title: "Authentication",
          specs: [
            { term: "Tokens", detail: "Short-lived JWT access tokens with rotating refresh tokens" },
            { term: "Passwords", detail: "bcrypt hashing, cost factor 12 — never stored in the clear" },
            { term: "Email gate", detail: "Mandatory verification before any deal activity" },
            { term: "Sessions", detail: "Stateless — no server-side session store to breach" },
          ],
        },
        {
          title: "Abuse protection",
          specs: [
            { term: "Login lockout", detail: "Blocked after 5 failed attempts" },
            { term: "Rate limiting", detail: "Per-IP limits on registration and recovery flows" },
            { term: "Idempotency", detail: "Keys on state-changing operations — no double-fires" },
            { term: "Error surface", detail: "404 problem+json for unknown paths — no stack leaks" },
          ],
        },
        {
          title: "Authorization",
          body: (
            <p>
              Role-based permissions gate every endpoint, and deal data is row-level scoped:
              unauthorised access to another party’s room returns not-found, not a hint that the
              record exists. IDOR-style probing is a dead end by design.
            </p>
          ),
          specs: [
            { term: "Model", detail: "RBAC — 7 platform roles, enforced at method level" },
            { term: "Deal scoping", detail: "Creator / party-organisation / privileged viewer only" },
            { term: "Compliance access", detail: "Evidence for the gate under review — not commercial margins" },
          ],
        },
        {
          title: "Engineering discipline",
          specs: [
            { term: "Audit log", detail: "Append-only — no edit or delete path, for anyone" },
            { term: "Module boundaries", detail: "Enforced automatically in the build" },
            { term: "Test coverage", detail: "90+ automated tests, including end-to-end security regressions" },
            { term: "Public surface", detail: "Auth endpoints and API docs only" },
          ],
        },
        {
          title: "Alignment & reporting",
          body: (
            <p>
              Controls are aligned with ISO 27001 principles and FATF guidance. To report a
              vulnerability, contact{" "}
              <span className="font-medium text-foreground">security@shaqal.com</span> with
              reproducible details — we acknowledge within two business days and credit researchers
              who help us fix issues.
            </p>
          ),
        },
      ]}
    />
  );
}
