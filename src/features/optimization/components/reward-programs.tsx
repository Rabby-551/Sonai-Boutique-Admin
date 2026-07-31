import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { RewardProgram } from "../schemas/optimization";

export function RewardPrograms({ rewards }: { rewards: RewardProgram[] }) {
  return (
    <section className="card table-card" aria-labelledby="rewards-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Ledger-backed design</div>
          <h2 id="rewards-title">Rewards and vouchers</h2>
        </div>
        <span className="badge warning">Fictional liability</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Program</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Value</th>
              <th scope="col">Issued</th>
              <th scope="col">Redeemed</th>
              <th scope="col">Open liability</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.eligibility}</small>
                </td>
                <td>{item.type}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{item.value}</td>
                <td>{item.issued}</td>
                <td>{item.redeemed}</td>
                <td>{formatMoney(item.liabilityMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-note">
        Redemption reserves points transactionally and restores them on failure
        or cancellation; this design does not process a live checkout.
      </div>
    </section>
  );
}
