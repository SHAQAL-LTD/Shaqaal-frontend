import { FeaturePage } from "@/components/content-page";

export default function AboutPage() {
  return (
    <FeaturePage
      eyebrow="Company"
      title="About Shaqal"
      lead="We’re building the audited operating system for cross-border mineral deals — because the world’s most valuable trades still run on chat threads and spreadsheets."
      sections={[
        {
          title: "Why Shaqal exists",
          body: (
            <p>
              Cross-border mineral trade is full of real value and broken plumbing: counterparties
              verified five times over, documents scattered across inboxes, stage changes agreed
              in voice notes, and no shared record anyone can hand to a bank or a regulator. The
              trust gap costs deals — especially African producers, who are asked to prove
              legitimacy hardest and carry the most friction.
            </p>
          ),
        },
        {
          title: "What we’re building",
          body: (
            <p>
              One platform where a deal is a room: ten enforced stages, documents gated to the
              moments they matter, compliance decisions in one queue, stage-gated payments in fiat
              or USDT — and an append-only audit trail behind all of it, ending in a cryptographic
              transaction ID at settlement. Evidence, not promises.
            </p>
          ),
        },
        {
          title: "How we work",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Evidence over assertions — if we claim it, the audit log can show it</li>
              <li>Compliance-first, not compliance-after</li>
              <li>Built with brokers, traders and financiers, not around them</li>
              <li>Plain language over jargon — in the product and on this site</li>
            </ul>
          ),
        },
        {
          title: "Where we operate",
          body: (
            <p>
              Shaqal Metals FZE operates from Dubai, Accra and Geneva, serving trade corridors
              across Africa — starting with gold and mineral export routes where the trust gap is
              widest.
            </p>
          ),
        },
      ]}
    />
  );
}
