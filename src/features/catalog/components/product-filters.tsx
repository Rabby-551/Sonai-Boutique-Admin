import Link from "next/link";
import type { Category } from "../schemas/catalog";

export function ProductFilters({
  categories,
  defaults,
}: {
  categories: readonly Category[];
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="product-query">Search</label>
        <input
          className="input"
          id="product-query"
          name="query"
          defaultValue={defaults.query}
          placeholder="Name or SKU"
        />
      </div>
      <div className="field compact">
        <label htmlFor="category-filter">Category</label>
        <select
          className="select"
          id="category-filter"
          name="categoryId"
          defaultValue={defaults.categoryId}
        >
          <option value="">All categories</option>
          {categories
            .filter((item) => item.status === "active")
            .map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="status-filter">Status</label>
        <select
          className="select"
          id="status-filter"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="stock-filter">Stock</label>
        <select
          className="select"
          id="stock-filter"
          name="stock"
          defaultValue={defaults.stock ?? "all"}
        >
          <option value="all">All stock</option>
          <option value="in-stock">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="min-price-filter">Minimum price</label>
        <input
          className="input"
          defaultValue={defaults.minPrice}
          id="min-price-filter"
          min="0"
          name="minPrice"
          placeholder="BDT"
          type="number"
        />
      </div>
      <div className="field compact">
        <label htmlFor="max-price-filter">Maximum price</label>
        <input
          className="input"
          defaultValue={defaults.maxPrice}
          id="max-price-filter"
          min="0"
          name="maxPrice"
          placeholder="BDT"
          type="number"
        />
      </div>
      <div className="field compact">
        <label htmlFor="sort-filter">Sort</label>
        <select
          className="select"
          id="sort-filter"
          name="sort"
          defaultValue={defaults.sort ?? "updated-desc"}
        >
          <option value="updated-desc">Recently updated</option>
          <option value="name-asc">Name A–Z</option>
          <option value="price-asc">Price low–high</option>
          <option value="price-desc">Price high–low</option>
          <option value="stock-asc">Lowest stock</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="button" type="submit">
          Apply filters
        </button>
        <Link className="button secondary" href="/products">
          Reset
        </Link>
      </div>
    </form>
  );
}
