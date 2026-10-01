import { LegalPage } from "@/components/content-page";

export default function SanctionsPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Sanctions policy"
      intro="Counterparty integrity is checked before anyone enters a deal room — and re-checked as lists change."
      updated="Last updated: August 2026"
      sections={[
        {
          title: "1. Screening at onboarding",
          body: (
            <p>
              Every organisation and its principals are screened against applicable sanctions and
              watchlists — including OFAC (US), the UN Consolidated List and EU restrictive
              measures — as part of KYC review before approval.
            </p>
          ),
        },
        {
          title: "2. Screening at admission",
          body: (
            <p>
              Being verified once is not a permanent pass. A party is re-screened when it is
              admitted to a new deal room, so a change in list status surfaces before trade begins.
            </p>
          ),
        },
        {
          title: "3. Ongoing monitoring",
          body: (
            <p>
              Verification statuses can be revised by platform operators at any time. Where a match
              or concern is identified, access is suspended pending compliance review.
            </p>
          ),
        },
        {
          title: "4. Escalation & reporting",
          body: (
            <p>
              Suspected sanctions issues are escalated to the compliance desk, recorded in the
              audit trail, and handled in line with applicable AML/CFT obligations and cooperation
              with competent authorities. Questions: compliance@shaqal.com.
            </p>
          ),
        },
      ]}
    />
  );
}
