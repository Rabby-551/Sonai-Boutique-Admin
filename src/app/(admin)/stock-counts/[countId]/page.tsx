import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { CountWorkspace } from "@/features/inventory/components/count-workspace";
import { getCount, listInventory } from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function StockCountPage({
  params,
}: {
  params: Promise<{ countId: string }>;
}) {
  const { countId } = await params;
  const [count, inventory, user] = await Promise.all([
    getCount(countId),
    listInventory({ pageSize: 1000 }),
    getCurrentUser(),
  ]);
  if (!count) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Stock count"
        title={count.scope}
        description={`${count.locationId} · ${count.scheduledDate}`}
        action={<StatusBadge status={count.status} />}
      />
      <CountWorkspace
        count={count}
        rows={inventory.items}
        canApprove={can(user.role, "inventory.approve")}
      />
    </div>
  );
}
