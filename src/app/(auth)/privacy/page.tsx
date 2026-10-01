import { LegalPage } from "@/components/content-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How Shaqal collects, uses and protects your information — written to be read, not skipped."
      updated="Last updated: August 2026"
      sections={[
        {
          title: "1. Information We Collect",
          body: (
            <p>
              We collect account information (name, email, phone, country), KYC documents, deal and
              transaction data, and usage analytics to provide and improve our services.
            </p>
          ),
        },
        {
          title: "2. How We Use Your Information",
          body: (
            <p>
              Your data is used for account management, transaction processing, compliance
              verification (KYC/AML), platform security, and communication about your deals and
              account.
            </p>
          ),
        },
        {
          title: "3. Data Sharing",
          body: (
            <p>
              We do not sell your personal data. Data may be shared with payment processors
              (Paystack), compliance partners, and as required by law. All sharing is governed by
              strict data processing agreements.
            </p>
          ),
        },
        {
          title: "4. Data Security",
          body: (
            <p>
              We employ industry-standard security measures including encrypted data at rest and in
              transit, JWT authentication, rate limiting, and regular security audits.
            </p>
          ),
        },
        {
          title: "5. Data Retention",
          body: (
            <p>
              Account data is retained while your account is active. Transaction records are
              retained for 7 years as required by financial regulations. You may request data
              deletion by contacting support.
            </p>
          ),
        },
        {
          title: "6. Your Rights",
          body: (
            <p>
              You have the right to access, correct, export, and delete your personal data. Contact
              our compliance team at compliance@shaqal.com to exercise these rights.
            </p>
          ),
        },
      ]}
    />
  );
}
