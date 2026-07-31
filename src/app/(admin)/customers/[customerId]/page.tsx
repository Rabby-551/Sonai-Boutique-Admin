import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArchiveCustomerButton } from "@/features/customers/components/archive-customer-button";
import { CustomerOverview } from "@/features/customers/components/customer-overview";
import { LoyaltyPanel } from "@/features/customers/components/loyalty-panel";
import { getCustomer } from "@/features/customers/server/queries";
import { OrderTable } from "@/features/orders/components/order-table";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const [customer, user] = await Promise.all([
    getCustomer(customerId),
    getCurrentUser(),
  ]);
  if (!customer) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Customer profile"
        title={customer.name}
        description={`Customer ID ${customer.id}`}
        action={<StatusBadge status={customer.status} />}
      />
      <CustomerOverview customer={customer} />
      <LoyaltyPanel
        customer={customer}
        canAdjust={can(user.role, "loyalty.adjust")}
      />
      <section>
        <div className="section-heading">
          <h2>Order history</h2>
        </div>
        <OrderTable orders={customer.orders} />
      </section>
      {customer.status === "active" && can(user.role, "customers.manage") && (
        <ArchiveCustomerButton id={customer.id} version={customer.version} />
      )}
    </div>
  );
}
