import Link from "next/link";
import { OpenShiftForm } from "@/features/pos/components/open-shift-form";
import { PosWorkspace } from "@/features/pos/components/pos-workspace";
import { getPosBootstrap } from "@/features/pos/server/queries";
import { requirePermission } from "@/lib/auth/session";

export default async function PosPage() {
  const user = await requirePermission("pos.sell");
  const bootstrap = await getPosBootstrap();
  if (bootstrap.openShift)
    return <PosWorkspace bootstrap={bootstrap} cashierName={user.name} />;
  return (
    <div className="pos-start-screen">
      <div className="pos-start-nav">
        <Link className="text-link" href="/dashboard">
          ← Admin dashboard
        </Link>
        <Link className="text-link" href="/pos/transactions">
          Transactions
        </Link>
      </div>
      <OpenShiftForm registers={bootstrap.registers} />
    </div>
  );
}
