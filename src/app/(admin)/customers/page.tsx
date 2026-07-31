import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { listCustomers } from "@/features/customers/server/queries";
import { customerParams } from "@/features/customers/utils/customer-params";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const input = customerParams(await searchParams);
  const [result, user] = await Promise.all([
    listCustomers(input),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Relationships"
        title="Customers"
        description="Durable customer profiles, order context, complaints, and auditable loyalty balances."
        action={
          <div className="button-group">
            {can(user.role, "loyalty.configure") && (
              <Link
                className="button secondary"
                href="/customers/loyalty-settings"
              >
                Loyalty settings
              </Link>
            )}
            {can(user.role, "customers.manage") && (
              <Link className="button" href="/customers/new">
                Add customer
              </Link>
            )}
          </div>
        }
      />
      <CustomerFilters defaults={input} />
      <CustomerTable customers={result.items} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/customers"
      />
    </div>
  );
}
