import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { getCustomer } from "@/features/customers/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  await requirePermission("customers.manage");
  const customer = await getCustomer((await params).customerId);
  if (!customer) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Customers"
        title={`Edit ${customer.name}`}
        description="Profile changes do not rewrite historical order snapshots."
      />
      <CustomerForm customer={customer} />
    </div>
  );
}
