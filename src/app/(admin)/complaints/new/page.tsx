import { PageHeader } from "@/components/ui/page-header";
import { ComplaintForm } from "@/features/complaints/components/complaint-form";
import { complaintFormOptions } from "@/features/complaints/server/queries";
export default async function NewComplaintPage() {
  const options = await complaintFormOptions();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Customer care"
        title="Log complaint"
        description="Record a centralized case and connect it to customer and order context."
      />
      <ComplaintForm customers={options.customers} orders={options.orders} />
    </div>
  );
}
