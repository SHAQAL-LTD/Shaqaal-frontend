import { FeaturePage } from "@/components/content-page";

export default function ContactPage() {
  return (
    <FeaturePage
      eyebrow="Company"
      title="Contact the desk"
      lead="Reach the right team directly — trade operations, compliance, or security."
      sections={[
        {
          title: "Trade desk",
          body: (
            <p>
              Deal rooms, onboarding, counterparties and settlement questions:{" "}
              <span className="font-medium text-foreground">desk@shaqal.com</span>
            </p>
          ),
        },
        {
          title: "Compliance",
          body: (
            <p>
              KYC/KYB reviews, sanctions questions and data-rights requests (access, export,
              deletion):{" "}
              <span className="font-medium text-foreground">compliance@shaqal.com</span>
            </p>
          ),
        },
        {
          title: "Security",
          body: (
            <p>
              Vulnerability reports and security disclosures:{" "}
              <span className="font-medium text-foreground">security@shaqal.com</span> — please
              include reproduction steps; we acknowledge within two business days.
            </p>
          ),
        },
        {
          title: "Offices",
          body: (
            <div className="space-y-1.5">
              <p>
                <span className="font-medium text-foreground">Dubai</span> — Shaqal Metals FZE
              </p>
              <p>
                <span className="font-medium text-foreground">Accra</span> — West Africa trade desk
              </p>
              <p>
                <span className="font-medium text-foreground">Geneva</span> — Trading &amp;
                partnerships
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}
