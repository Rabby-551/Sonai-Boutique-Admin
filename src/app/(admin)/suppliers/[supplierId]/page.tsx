import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArchiveSupplierButton } from "@/features/procurement/components/archive-supplier-button";
import { PurchaseOrderTable } from "@/features/procurement/components/purchase-order-table";
import {
  getSupplier,
  listPurchaseOrders,
} from "@/features/procurement/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function SupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;
  const [supplier, orders, user] = await Promise.all([
    getSupplier(supplierId),
    listPurchaseOrders({ supplierId, pageSize: 100 }),
    getCurrentUser(),
  ]);
  if (!supplier) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Supplier"
        title={supplier.name}
        description={`${supplier.code} · ${supplier.paymentTerms}`}
        action={<StatusBadge status={supplier.status} />}
      />
      <section className="card detail-panel">
        <dl className="detail-list">
          <div>
            <dt>Contact</dt>
            <dd>{supplier.contactName}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{supplier.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{supplier.email ?? "—"}</dd>
          </div>
          <div>
            <dt>Lead time</dt>
            <dd>{supplier.leadTimeDays} days</dd>
          </div>
        </dl>
        <p className="notice">{supplier.address}</p>
        <div className="button-group">
          {can(user.role, "procurement.create") && (
            <Link
              className="button secondary"
              href={`/suppliers/${supplier.id}/edit`}
            >
              Edit supplier
            </Link>
          )}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Purchase-order history</h2>
        </div>
        <PurchaseOrderTable orders={orders.items} suppliers={[supplier]} />
      </section>
      {supplier.status !== "archived" &&
        can(user.role, "procurement.create") && (
          <ArchiveSupplierButton id={supplier.id} version={supplier.version} />
        )}
    </div>
  );
}
