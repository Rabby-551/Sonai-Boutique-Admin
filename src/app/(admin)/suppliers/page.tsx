import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SupplierTable } from "@/features/procurement/components/supplier-table";
import { listSuppliers } from "@/features/procurement/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function SuppliersPage() {
  const [suppliers, user] = await Promise.all([
    listSuppliers(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Procurement"
        title="Suppliers"
        description="Supplier contacts, commercial terms, supplied SKUs, and purchasing history."
        action={
          can(user.role, "procurement.create") && (
            <Link className="button" href="/suppliers/new">
              Add supplier
            </Link>
          )
        }
      />
      <SupplierTable suppliers={suppliers} />
    </div>
  );
}
