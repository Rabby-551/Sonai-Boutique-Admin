import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { TransferTable } from "@/features/inventory/components/transfer-table";
import {
  listLocations,
  listTransfers,
} from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function TransfersPage() {
  const [transfers, locations, user] = await Promise.all([
    listTransfers(),
    listLocations(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory operations"
        title="Stock transfers"
        description="Draft, dispatch and receive stock between stable locations."
        action={
          can(user.role, "inventory.transfer") ? (
            <Link className="button" href="/inventory/transfers/new">
              New transfer
            </Link>
          ) : undefined
        }
      />
      <TransferTable transfers={transfers} locations={locations} />
    </div>
  );
}
