import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationRules } from "@/features/optimization/components/automation-rules";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { getAutomationWorkspace } from "@/features/optimization/server/queries";

export default async function AutomationRulesPage() {
  const workspace = await getAutomationWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Safe automation"
        title="Rules and execution controls"
        description="Allow-listed triggers, conditions and low-risk actions with approval and failure evidence."
        action={
          <Link className="button secondary" href="/complaints/sla-policies">
            Complaint SLA
          </Link>
        }
      />
      <MockDesignNotice>
        No job, notification or recommendation is actually dispatched.
      </MockDesignNotice>
      <AutomationRules rules={workspace.automationRules} />
    </div>
  );
}
