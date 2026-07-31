import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { InventoryLocation, StockCount } from "../schemas/inventory";

export function CountTable({
  counts,
  locations,
}: {
  counts: readonly StockCount[];
  locations: readonly InventoryLocation[];
}) {
  const names = new Map(
    locations.map((location) => [location.id, location.name]),
  );
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Count</th>
              <th>Location</th>
              <th>Scope</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((count) => (
              <tr key={count.id}>
                <td data-label="Count">
                  <strong>{count.id.slice(0, 16)}</strong>
                </td>
                <td data-label="Location">{names.get(count.locationId)}</td>
                <td data-label="Scope">{count.scope}</td>
                <td data-label="Date">{count.scheduledDate}</td>
                <td data-label="Status">
                  <StatusBadge status={count.status} />
                </td>
                <td data-label="Action">
                  <Link
                    className="table-link"
                    href={`/stock-counts/${count.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!counts.length && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-inline">
                    No stock counts have been scheduled.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
