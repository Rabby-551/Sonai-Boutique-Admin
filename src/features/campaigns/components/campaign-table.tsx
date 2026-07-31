import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { CampaignSummary } from "../data/repository";
export function CampaignTable({ campaigns }: { campaigns: CampaignSummary[] }) {
  if (!campaigns.length)
    return (
      <div className="empty-state">
        <h2>No campaigns found</h2>
        <p>Create a draft or adjust the current filters.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Window</th>
              <th>Discount</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((item) => (
              <tr key={item.id}>
                <td data-label="Campaign">
                  <Link href={`/campaigns/${item.id}`}>
                    <strong>{item.code}</strong>
                    <small>{item.name}</small>
                  </Link>
                </td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
                <td data-label="Window">
                  {item.startsAt.slice(0, 10)}
                  <small>to {item.endsAt.slice(0, 10)}</small>
                </td>
                <td data-label="Discount">{item.percentageOff}%</td>
                <td data-label="Orders">{item.orderCount}</td>
                <td data-label="Revenue">{formatMoney(item.revenueMinor)}</td>
                <td data-label="ROI">{item.roiPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
