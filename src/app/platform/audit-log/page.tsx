import { FeaturePage, VisualFrame } from "@/components/content-page";
import { ScrollText } from "lucide-react";

export default function AuditLogPage() {
  return (
    <FeaturePage
      eyebrow="Platform"
      title="Audit log"
      lead="An append-only history of everything that happened in a deal room — the feature that turns “trust me” into “here’s the record”."
      visual={
        <VisualFrame caption="Audit trail · append-only timeline" icon={ScrollText} />
      }
      sections={[
        {
          title: "What gets recorded",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Stage transitions and who triggered them</li>
              <li>Compliance decisions — approvals and rejections with notes</li>
              <li>Document uploads and downloads</li>
              <li>Payment initialization and settlement events</li>
              <li>Commission tree creation and locking</li>
              <li>Account and authentication events</li>
            </ul>
          ),
        },
        {
          title: "Immutable by design",
          body: (
            <p>
              The log is append-only at the storage layer: there is no edit or delete path, for
              anyone — including administrators. History can grow, but it cannot be rewritten.
            </p>
          ),
        },
        {
          title: "UTID at settlement",
          body: (
            <p>
              When a deal completes stage 10, it mints a UTID — a cryptographic transaction
              identifier that fingerprints the finished deal. The finished room is a closed,
              referenceable artifact.
            </p>
          ),
        },
        {
          title: "Export for auditors",
          body: (
            <p>
              The full timeline plus the deal configuration exports as a JSON evidence pack. Banks,
              auditors and regulators receive proof instead of screenshots.
            </p>
          ),
        },
      ]}
    />
  );
}
