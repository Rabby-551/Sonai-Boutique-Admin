import type { InventoryLocation } from "@/features/inventory/schemas/inventory";

export function OrderFilters({
  locations,
  defaults,
}: {
  locations: readonly InventoryLocation[];
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="order-query">Order or customer</label>
        <input
          className="input"
          defaultValue={defaults.query}
          id="order-query"
          name="query"
        />
      </div>
      <div className="field compact">
        <label htmlFor="order-source">Source</label>
        <select
          className="select"
          defaultValue={defaults.source ?? "all"}
          id="order-source"
          name="source"
        >
          <option value="all">All sources</option>
          {["website", "whatsapp", "messenger", "phone", "branch"].map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="order-location">Location</label>
        <select
          className="select"
          defaultValue={defaults.locationId ?? "all"}
          id="order-location"
          name="locationId"
        >
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="order-status">Order status</label>
        <select
          className="select"
          defaultValue={defaults.status ?? "all"}
          id="order-status"
          name="status"
        >
          <option value="all">All statuses</option>
          {[
            "placed",
            "confirmed",
            "picking",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="payment-status">Payment</label>
        <select
          className="select"
          defaultValue={defaults.paymentStatus ?? "all"}
          id="payment-status"
          name="paymentStatus"
        >
          <option value="all">All payments</option>
          {["pending", "paid", "failed", "partially_refunded", "refunded"].map(
            (value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ),
          )}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="order-from">From</label>
        <input
          className="input"
          defaultValue={defaults.dateFrom}
          id="order-from"
          name="dateFrom"
          type="date"
        />
      </div>
      <div className="field compact">
        <label htmlFor="order-to">To</label>
        <input
          className="input"
          defaultValue={defaults.dateTo}
          id="order-to"
          name="dateTo"
          type="date"
        />
      </div>
      <button className="button" type="submit">
        Apply filters
      </button>
    </form>
  );
}
