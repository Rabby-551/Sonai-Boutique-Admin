import Link from "next/link";
import { TransactionWorkspace } from "@/features/pos/components/transaction-workspace";
import {
  getPosBootstrap,
  listPosApprovals,
  listPosReturns,
  listPosSales,
} from "@/features/pos/server/queries";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";

export default async function PosTransactionsPage() {
  const user = await requirePermission("pos.return");
  const canApprove = can(user.role, "pos.approve");
  const [sales, returns, bootstrap, approvals] = await Promise.all([
    listPosSales(),
    listPosReturns(),
    getPosBootstrap(),
    canApprove ? listPosApprovals() : Promise.resolve([]),
  ]);
  return (
    <div className="pos-subpage">
      <header className="pos-subpage-header">
        <div>
          <span className="eyebrow">In-store service</span>
          <h1>Transactions, returns and exchanges</h1>
        </div>
        <div className="button-group">
          <Link className="button secondary" href="/pos">
            Back to register
          </Link>
          {canApprove && (
            <Link className="button" href="/pos/approvals">
              Approvals
            </Link>
          )}
        </div>
      </header>
      <TransactionWorkspace
        approvals={approvals}
        bootstrap={bootstrap}
        canApprove={canApprove}
        returns={returns}
        sales={sales}
      />
    </div>
  );
}
