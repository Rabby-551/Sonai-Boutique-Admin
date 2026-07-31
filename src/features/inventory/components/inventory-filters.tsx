import type { InventoryLocation } from "../schemas/inventory";

export function InventoryFilters({
  locations,
  defaults,
}: {
  locations: readonly InventoryLocation[];
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="inventory-query">Product, SKU or barcode</label>
        <input
          className="input"
          defaultValue={defaults.query}
          id="inventory-query"
          name="query"
        />
      </div>
      <div className="field compact">
        <label htmlFor="inventory-location">Location</label>
        <select
          className="select"
          defaultValue={defaults.locationId ?? "all"}
          id="inventory-location"
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
        <label htmlFor="inventory-status">Stock status</label>
        <select
          className="select"
          defaultValue={defaults.status ?? "all"}
          id="inventory-status"
          name="status"
        >
          <option value="all">All statuses</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="inventory-sort">Sort</label>
        <select
          className="select"
          defaultValue={defaults.sort ?? "name"}
          id="inventory-sort"
          name="sort"
        >
          <option value="name">Product name</option>
          <option value="available-asc">Lowest available</option>
          <option value="available-desc">Highest available</option>
          <option value="value-desc">Highest value</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="inventory-min-value">Min value (BDT)</label>
        <input
          className="input"
          defaultValue={defaults.minValue}
          id="inventory-min-value"
          min={0}
          name="minValue"
          type="number"
        />
      </div>
      <div className="field compact">
        <label htmlFor="inventory-max-value">Max value (BDT)</label>
        <input
          className="input"
          defaultValue={defaults.maxValue}
          id="inventory-max-value"
          min={0}
          name="maxValue"
          type="number"
        />
      </div>
      <button className="button" type="submit">
        Apply filters
      </button>
    </form>
  );
}
