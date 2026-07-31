import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ComplaintControls } from "@/features/complaints/components/complaint-controls";
import { ComplaintTimeline } from "@/features/complaints/components/complaint-timeline";
import {
  complaintFormOptions,
  getComplaint,
} from "@/features/complaints/server/queries";
import { getCustomer } from "@/features/customers/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function ComplaintPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const { complaintId } = await params;
  const complaint = await getComplaint(complaintId);
  if (!complaint) notFound();
  const [customer, options, user] = await Promise.all([
    getCustomer(complaint.customerId),
    complaintFormOptions(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Complaint detail"
        title={complaint.caseNumber}
        description={`${complaint.type.replaceAll("_", " ")} · ${complaint.category.replaceAll("_", " ")}`}
        action={<StatusBadge status={complaint.status} />}
      />
      <section className="card detail-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Customer</span>
            <h2>
              <Link href={`/customers/${complaint.customerId}`}>
                {customer?.name ?? complaint.customerId}
              </Link>
            </h2>
          </div>
          <StatusBadge status={complaint.priority} />
        </div>
        <p>{complaint.description}</p>
        <dl className="detail-list">
          <div>
            <dt>Source</dt>
            <dd>{complaint.source}</dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>{complaint.assignedTo ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>
              {complaint.dueAt
                ? new Date(complaint.dueAt).toLocaleString("en-BD")
                : "No due date"}
            </dd>
          </div>
          <div>
            <dt>Resolution</dt>
            <dd>{complaint.resolution ?? "Open"}</dd>
          </div>
        </dl>
      </section>
      {can(user.role, "complaints.manage") && (
        <ComplaintControls complaint={complaint} staff={options.staff} />
      )}
      <ComplaintTimeline complaint={complaint} />
    </div>
  );
}
