import Link from "next/link";
import { ApprovalList } from "@/features/pos/components/approval-list";
import { listPosApprovals } from "@/features/pos/server/queries";

export default async function PosApprovalsPage() {
  const approvals = await listPosApprovals();
  return (
    <div className="pos-subpage">
      <header className="pos-subpage-header">
        <div>
          <span className="eyebrow">Manager control</span>
          <h1>POS approvals</h1>
          <p>Review discounts, returns, no-receipt overrides and exchanges.</p>
        </div>
        <Link className="button secondary" href="/pos/transactions">
          Transactions
        </Link>
      </header>
      <ApprovalList approvals={approvals} />
    </div>
  );
}
