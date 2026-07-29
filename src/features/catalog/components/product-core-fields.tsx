import type { Category, Product } from "../schemas/catalog";
export function ProductCoreFields({
  categories,
  product,
  error,
}: {
  categories: readonly Category[];
  product?: Product;
  error: (name: string) => string | undefined;
}) {
  return (
    <section className="form-section">
      <div className="section-title">
        <div>
          <h2>Core information</h2>
          <p className="metric-label">
            Customer-facing identity, merchandising status and category.
          </p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="product-name">Product name</label>
          <input
            className="input"
            defaultValue={product?.name}
            id="product-name"
            name="name"
            required
          />
          <span className="field-error">{error("name")}</span>
        </div>
        <div className="field">
          <label htmlFor="product-category">Category</label>
          <select
            className="select"
            defaultValue={product?.categoryId}
            id="product-category"
            name="categoryId"
            required
          >
            <option value="">Select category</option>
            {categories
              .filter((item) => item.status === "active")
              .map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
          <span className="field-error">{error("categoryId")}</span>
        </div>
        <div className="field full">
          <label htmlFor="product-description">Description</label>
          <textarea
            className="textarea"
            defaultValue={product?.description}
            id="product-description"
            name="description"
            required
            rows={5}
          />
          <span className="field-error">{error("description")}</span>
        </div>
        <div className="field">
          <label htmlFor="product-tags">Tags</label>
          <input
            className="input"
            defaultValue={product?.tags.join(", ")}
            id="product-tags"
            name="tags"
            placeholder="batik, silk, occasion"
          />
          <span className="help">Separate tags with commas.</span>
        </div>
        <div className="field">
          <label htmlFor="product-status">Status</label>
          <select
            className="select"
            defaultValue={product?.status ?? "draft"}
            id="product-status"
            name="status"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            {product?.status === "archived" && (
              <option value="archived">Archived</option>
            )}
          </select>
        </div>
      </div>
    </section>
  );
}
