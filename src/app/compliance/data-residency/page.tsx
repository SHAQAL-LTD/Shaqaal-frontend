import { SpecPage } from "@/components/content-page";

export default function DataResidencyPage() {
  return (
    <SpecPage
      eyebrow="Compliance"
      title="Data residency"
      intro="Where your data lives, who can reach it, and how long it stays — stated plainly."
      updated="Last updated: August 2026"
      blocks={[
        {
          title: "Where data lives",
          body: (
            <p>
              Platform data is hosted in a region agreed at contract time — with African, UAE and
              EU deployment options — and stays there unless a transfer is legally required and
              documented.
            </p>
          ),
          specs: [
            { term: "Deployment regions", detail: "Africa · UAE · European Union (chosen at contract)" },
            { term: "In transit", detail: "TLS — all client and service traffic encrypted" },
            { term: "At rest", detail: "Encrypted storage, including the document vault" },
            { term: "Data sales", detail: "Never — we do not sell personal data" },
            {
              term: "Sub-processors",
              detail:
                "Payment providers (e.g. Paystack), notification channels and infrastructure — all under data processing agreements",
            },
          ],
        },
        {
          title: "Controlled access",
          body: (
            <p>
              Role-based access control decides who sees what; deal data is row-level scoped, so
              even authenticated users only reach the rooms they belong to. Internal access is
              least-privilege and logged.
            </p>
          ),
        },
        {
          title: "Retention",
          specs: [
            { term: "Account data", detail: "Retained while the account is active" },
            { term: "Transaction & audit records", detail: "7 years — financial-crime and tax record-keeping" },
            { term: "Deletion requests", detail: "Handled per the Privacy Policy (compliance@shaqal.com)" },
            { term: "KYC documents", detail: "Retained with the organisation profile they verify" },
          ],
        },
      ]}
    />
  );
}
