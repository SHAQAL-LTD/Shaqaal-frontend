import { LegalPage } from "@/components/content-page";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="The agreement between you and Shaqal for use of the platform."
      updated="Last updated: August 2026"
      sections={[
        {
          title: "1. Acceptance of Terms",
          body: (
            <p>
              By accessing or using the Shaqal TradeOS platform, you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Platform.
            </p>
          ),
        },
        {
          title: "2. Platform Description",
          body: (
            <p>
              Shaqal TradeOS is a digital trade facilitation platform for mineral commodity trading
              across Africa. It provides deal pipeline management, document management, payment
              processing (fiat and crypto), and compliance verification services.
            </p>
          ),
        },
        {
          title: "3. User Eligibility",
          body: (
            <p>
              You must be at least 18 years old and have the legal authority to enter into binding
              agreements. You must complete KYC verification before engaging in transactions.
            </p>
          ),
        },
        {
          title: "4. Account Security",
          body: (
            <p>
              You are responsible for maintaining the confidentiality of your account
              credentials. Shaqal implements rate limiting, JWT authentication, and session
              management to protect your account.
            </p>
          ),
        },
        {
          title: "5. Payment Terms",
          body: (
            <p>
              All payments are processed through integrated payment gateways (Paystack for fiat,
              USDT for crypto). Platform fees apply as configured. Escrow mechanisms protect both
              buyers and suppliers during deal settlement.
            </p>
          ),
        },
        {
          title: "6. Dispute Resolution",
          body: (
            <p>
              Any disputes shall be resolved through the Platform compliance review process before
              escalation to external arbitration under applicable trade laws.
            </p>
          ),
        },
        {
          title: "7. Limitation of Liability",
          body: (
            <p>
              Shaqal Ltd. provides the Platform on an as-is basis. We are not liable for losses
              arising from trade transactions between parties, except as explicitly covered by our
              escrow and payment protection mechanisms.
            </p>
          ),
        },
      ]}
    />
  );
}
