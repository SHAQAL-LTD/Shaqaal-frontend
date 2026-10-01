import { FeaturePage, VisualFrame } from "@/components/content-page";
import { Workflow } from "lucide-react";

const STAGES = [
  "Registration",
  "Supplier Verification",
  "Buyer Onboarding",
  "SPA Signature",
  "Proof of Funds",
  "Advance Payment",
  "Origin Logistics",
  "Shipping",
  "Destination Clearance",
  "Settlement",
];

export default function DealRoomsPage() {
  return (
    <FeaturePage
      eyebrow="Platform"
      title="Deal rooms"
      lead="Every trade on Shaqal runs inside a deal room — one permissioned, audited space where both sides, their brokers and their financiers work from the same map."
      visual={
        <VisualFrame caption="Deal room · ten-stage pipeline" icon={Workflow}>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
            {STAGES.map((s, i) => (
              <span
                key={s}
                className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold"
              >
                {String(i + 1).padStart(2, "0")} {s}
              </span>
            ))}
          </div>
        </VisualFrame>
      }
      sections={[
        {
          title: "One room per trade",
          body: (
            <p>
              A room is created with the commodity details — mineral, quantity, purity, origin and
              destination — plus an optional target price. From the first second, the room carries
              its own audit trail: nothing about the deal lives in an inbox or a spreadsheet again.
            </p>
          ),
        },
        {
          title: "Stage gates, not to-do lists",
          body: (
            <p>
              Each stage is a gate. The room will not advance until the required parties, documents
              and payments exist — an SPA before signature, proof of funds before money moves,
              waybill, bill of lading and clearance certificates before the cargo does. The process
              itself is the control.
            </p>
          ),
        },
        {
          title: "Scoped parties",
          body: (
            <p>
              Only organisations explicitly admitted to the room see it — seller, buyer, broker and
              logistics, each in their own role. Compliance officers see the evidence for the gate
              they are reviewing, never commercial margins.
            </p>
          ),
        },
        {
          title: "Everyone sees the same state",
          body: (
            <p>
              Live stage, progress and notifications are shared across all parties. No more
              “where are we?” threads — the room is the single source of truth from registration
              to settlement.
            </p>
          ),
        },
      ]}
    />
  );
}
