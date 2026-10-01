import { FeaturePage, VisualFrame } from "@/components/content-page";
import { FileLock } from "lucide-react";

export default function DocumentVaultPage() {
  return (
    <FeaturePage
      eyebrow="Platform"
      title="Document vault"
      lead="Trade documents live inside the deal, at the stage they matter — encrypted, scoped to the room, and logged on every access."
      visual={
        <VisualFrame
          caption="Deal vault · stage-gated document list"
          icon={FileLock}
        />
      }
      sections={[
        {
          title: "Stage-gated uploads",
          body: (
            <div className="space-y-2">
              <p>The vault demands evidence exactly where the risk is:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Stage 04 — SPA (Sale &amp; Purchase Agreement)</li>
                <li>Stage 05 — Proof of Funds</li>
                <li>Stage 07 — Origin waybill</li>
                <li>Stage 08 — Bill of Lading</li>
                <li>Stage 09 — Destination clearance certificate</li>
              </ul>
            </div>
          ),
        },
        {
          title: "Formats & limits",
          body: (
            <p>
              PDF, PNG and JPG uploads up to 50 MB per file. Files are tied to the deal and the
              stage they clear — never floating attachments in a chat thread.
            </p>
          ),
        },
        {
          title: "Access is scoped",
          body: (
            <p>
              Only parties of the deal room can read its vault; compliance reviewers access
              documents solely to evaluate the gate in front of them. Every download is written to
              the audit trail.
            </p>
          ),
        },
        {
          title: "Evidence on demand",
          body: (
            <p>
              Documents travel with the deal record — exportable alongside the audit timeline as a
              single evidence pack for banks, auditors and regulators.
            </p>
          ),
        },
      ]}
    />
  );
}
