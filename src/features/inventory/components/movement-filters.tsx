import type { InventoryLocation } from "../schemas/inventory";

export function MovementFilters({
  locations,
  defaults,
}: {
  locations: readonly InventoryLocation[];
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="movement-query">SKU, barcode or reference</label>
        <input
          className="input"
          defaultValue={defaults.query}
          id="movement-query"
          name="query"
        />
      </div>
      <div className="field compact">
        <label htmlFor="movement-actor">Actor</label>
        <input
          className="input"
          defaultValue={defaults.actor}
          id="movement-actor"
          name="actor"
        />
      </div>
      <div className="field compact">
        <label htmlFor="movement-from">From</label>
        <input
          className="input"
          defaultValue={defaults.dateFrom}
          id="movement-from"
          name="dateFrom"
          type="date"
        />
      </div>
      <div className="field compact">
        <label htmlFor="movement-to">To</label>
        <input
          className="input"
          defaultValue={defaults.dateTo}
          id="movement-to"
          name="dateTo"
          type="date"
        />
      </div>
      <div className="field compact">
        <label htmlFor="movement-location-filter">Location</label>
        <select
          className="select"
          defaultValue={defaults.locationId ?? "all"}
          id="movement-location-filter"
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
        <label htmlFor="movement-type">Type</label>
        <select
          className="select"
          defaultValue={defaults.type ?? "all"}
          id="movement-type"
          name="type"
        >
          <option value="all">All types</option>
          {[
            "receipt",
            "adjustment",
            "damage",
            "transfer_out",
            "transfer_in",
            "reservation",
            "reservation_release",
            "sale",
            "return",
            "count_correction",
          ].map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <button className="button" type="submit">
        Apply filters
      </button>
    </form>
  );
}
