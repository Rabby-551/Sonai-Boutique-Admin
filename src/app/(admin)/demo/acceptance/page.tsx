import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { AcceptanceChecklist } from "@/features/demo/components/acceptance-checklist";
import { AcceptanceMetrics } from "@/features/demo/components/acceptance-metrics";
import { FreezeRegister } from "@/features/demo/components/freeze-register";
import { KnownLimitations } from "@/features/demo/components/known-limitations";
import { RouteReadiness } from "@/features/demo/components/route-readiness";
import { VisualEvidence } from "@/features/demo/components/visual-evidence";
import { getAcceptanceWorkspace } from "@/features/demo/server/queries";

export default async function AcceptancePage() {
  const { acceptance, user } = await getAcceptanceWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 10 · Design freeze"
        title="Stakeholder acceptance"
        description={`Mock-release evidence for ${user.name}'s ${user.role} review. No selection is production approval.`}
        action={
          <Link className="button secondary" href="/demo/release">
            Preview handoff
          </Link>
        }
      />
      <div className="notice">
        Review the limitations before selecting any sign-off item. Live
        identity, providers, persistence and deployment remain external.
      </div>
      <AcceptanceMetrics workspace={acceptance} />
      <RouteReadiness groups={acceptance.routeGroups} />
      <FreezeRegister records={acceptance.freezeRecords} />
      <VisualEvidence checkpoints={acceptance.visualCheckpoints} />
      <div className="grid-2 balanced acceptance-controls">
        <KnownLimitations limitations={acceptance.limitations} />
        <AcceptanceChecklist checks={acceptance.signoffChecks} />
      </div>
    </div>
  );
}
