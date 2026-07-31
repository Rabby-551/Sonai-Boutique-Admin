import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { InventoryLocation, StockTransfer } from "../schemas/inventory";

export function TransferTable({
  transfers,
  locations,
}: {
  transfers: readonly StockTransfer[];
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
              <th>Transfer</th>
              <th>Route</th>
              <th>Lines</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td data-label="Transfer">
                  <strong>{transfer.id.slice(0, 16)}</strong>
                </td>
                <td data-label="Route">
                  {names.get(transfer.sourceLocationId)} →{" "}
                  {names.get(transfer.destinationLocationId)}
                </td>
                <td data-label="Lines">{transfer.lines.length}</td>
                <td data-label="Status">
                  <StatusBadge status={transfer.status} />
                </td>
                <td data-label="Updated">
                  {new Date(transfer.updatedAt).toLocaleString("en-BD")}
                </td>
                <td data-label="Action">
                  <Link
                    className="table-link"
                    href={`/inventory/transfers/${transfer.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!transfers.length && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-inline">
                    No transfers have been created.
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
