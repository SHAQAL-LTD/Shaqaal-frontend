import { FeaturePage, VisualFrame } from "@/components/content-page";
import { Network } from "lucide-react";

export default function CommissionEnginePage() {
  return (
    <FeaturePage
      eyebrow="Platform"
      title="Commission engine"
      lead="Who earns what on a deal is agreed up front, visualised as a commission tree, and locked before settlement — so nobody renegotiates at the finish line."
      visual={
        <VisualFrame caption="Commission tree · agreed, then locked" icon={Network} />
      }
      sections={[
        {
          title: "Commission trees",
          body: (
            <p>
              Each deal room can carry a commission tree: a hierarchy of allocation nodes that
              defines how fees flow between the parties — brokers, introducers, facilitators and
              the platform — the moment value moves.
            </p>
          ),
        },
        {
          title: "Flexible allocation nodes",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Percentage or fixed-value allocations</li>
              <li>Buy-side or sell-side tagging</li>
              <li>Anchored to any organisation in the room</li>
              <li>Parent/child structure for nested splits</li>
            </ul>
          ),
        },
        {
          title: "Lock before money moves",
          body: (
            <p>
              A tree can be locked once agreed. A locked tree cannot be rewritten — the allocations
              become part of the deal’s immutable record, and every change before the lock is
              itself an audited event.
            </p>
          ),
        },
        {
          title: "Transparent to the room",
          body: (
            <p>
              All parties see the same tree. No side agreements, no surprise splits at settlement —
              the maths is on the wall from day one.
            </p>
          ),
        },
      ]}
    />
  );
}
