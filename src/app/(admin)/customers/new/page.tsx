import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePermission } from "@/lib/auth/session";
export default async function NewCustomerPage() {
  await requirePermission("customers.manage");
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Customers"
        title="Add customer"
        description="Create a fictional or operational profile without rewriting historical orders."
      />
      <CustomerForm />
    </div>
  );
}
