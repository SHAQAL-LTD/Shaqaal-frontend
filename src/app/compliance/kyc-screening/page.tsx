import { SpecPage } from "@/components/content-page";

export default function KycScreeningPage() {
  return (
    <SpecPage
      eyebrow="Compliance"
      title="KYC & screening"
      intro="Verify an organisation once — then reuse that trust across every deal room it enters."
      blocks={[
        {
          title: "One KYC per organisation",
          body: (
            <p>
              Members submit identity and registration documents against their organisation
              profile. Once approved, the verification travels with the entity — counterparties
              stop re-collecting the same paperwork deal after deal.
            </p>
          ),
        },
        {
          title: "What we ask for",
          body: (
            <p>
              Required sets follow the organisation’s jurisdiction, resolved from the platform’s
              country compliance profiles — never a generic checklist:
            </p>
          ),
          specs: [
            {
              term: "Accepted formats",
              detail: "PDF, PNG, JPG — up to 50 MB per file",
            },
            {
              term: "Example document sets",
              detail:
                "Nigeria: CAC certificate + tax ID · elsewhere: passport, proof of address, bank statement",
            },
            {
              term: "Where requirements live",
              detail: "Country compliance profile, maintained per jurisdiction",
            },
            {
              term: "Identity fields",
              detail: "Legal name, registration number, tax ID, country",
            },
          ],
        },
        {
          title: "The review loop",
          body: (
            <p>
              Compliance officers work a dedicated desk — pending, approved and rejected queues —
              with side-by-side document review. Every decision carries a note and lands in the
              audit trail.
            </p>
          ),
          specs: [
            { term: "Outcomes", detail: "Approved or rejected, with a mandatory reviewer note" },
            { term: "Reviewer", detail: "Platform compliance officer role (RBAC-gated)" },
            { term: "Record", detail: "Decision written to the append-only audit log" },
            { term: "Visibility", detail: "Submitter sees live status on their KYC page" },
          ],
        },
        {
          title: "Verification gates access",
          body: (
            <p>
              Email verification and KYC status gate what an account can do — unverified accounts
              cannot open deal rooms, and only verified organisations can be admitted as
              counterparties.
            </p>
          ),
        },
      ]}
    />
  );
}
