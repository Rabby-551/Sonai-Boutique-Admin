import type { Product } from "../schemas/catalog";
export function ProductPricingFields({
  product,
  error,
}: {
  product?: Product;
  error: (name: string) => string | undefined;
}) {
  return (
    <section className="form-section">
      <div className="section-title">
        <div>
          <h2>Pricing and stock rules</h2>
          <p className="metric-label">
            Enter BDT amounts; the repository stores integer poisha.
          </p>
        </div>
      </div>
      <div className="form-grid three">
        <div className="field">
          <label htmlFor="product-price">Selling price (BDT)</label>
          <input
            className="input"
            defaultValue={product ? product.priceMinor / 100 : ""}
            id="product-price"
            min="0"
            name="price"
            required
            step="0.01"
            type="number"
          />
          <span className="field-error">{error("priceMinor")}</span>
        </div>
        <div className="field">
          <label htmlFor="product-cost">Unit cost (BDT)</label>
          <input
            className="input"
            defaultValue={product ? product.costMinor / 100 : ""}
            id="product-cost"
            min="0"
            name="cost"
            required
            step="0.01"
            type="number"
          />
          <span className="field-error">{error("costMinor")}</span>
        </div>
        <div className="field">
          <label htmlFor="low-stock">Low-stock threshold</label>
          <input
            className="input"
            defaultValue={product?.lowStockThreshold ?? 3}
            id="low-stock"
            min="0"
            name="lowStockThreshold"
            required
            type="number"
          />
        </div>
      </div>
    </section>
  );
}
