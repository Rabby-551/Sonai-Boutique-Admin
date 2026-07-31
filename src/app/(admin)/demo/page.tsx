import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DemoMetrics } from "@/features/demo/components/demo-metrics";
import { ResetDemoData } from "@/features/demo/components/reset-demo-data";
import { RoleGuide } from "@/features/demo/components/role-guide";
import { ScenarioGrid } from "@/features/demo/components/scenario-grid";
import { UatChecklist } from "@/features/demo/components/uat-checklist";
import { getDemoWorkspace } from "@/features/demo/server/queries";

export default async function DemoPage() {
  const { workspace, user, canReset } = await getDemoWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 9 · Mock UAT"
        title="Demo and staff review"
        description={`Guided fictional workflows for ${user.name}'s ${user.role} session, with no live provider calls.`}
        action={
          <Link className="button secondary" href="/demo/acceptance">
            Review design freeze
          </Link>
        }
      />
      <div className="notice">
        This workspace uses deterministic fictional people, products, orders and
        operational evidence. Checklist selections are not production approval.
      </div>
      <DemoMetrics workspace={workspace} />
      <ScenarioGrid scenarios={workspace.scenarios} />
      <RoleGuide roles={workspace.roles} />
      <div className="grid-2 balanced demo-controls">
        <UatChecklist checks={workspace.checks} />
        <ResetDemoData canReset={canReset} />
      </div>
    </div>
  );
}
