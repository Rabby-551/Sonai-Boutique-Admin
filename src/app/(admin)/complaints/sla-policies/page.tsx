import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { SlaPolicies } from "@/features/optimization/components/sla-policies";
import { getAutomationWorkspace } from "@/features/optimization/server/queries";

export default async function ComplaintSlaPage() {
  const workspace = await getAutomationWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Service operations"
        title="Complaint SLA policies"
        description="Business-hour response and resolution targets with visible escalation and breach states."
        action={
          <Link className="button secondary" href="/complaints">
            Complaint queue
          </Link>
        }
      />
      <MockDesignNotice>
        Breaches and escalations are fictional and no staff notification is
        sent.
      </MockDesignNotice>
      <SlaPolicies policies={workspace.slaPolicies} />
    </div>
  );
}
