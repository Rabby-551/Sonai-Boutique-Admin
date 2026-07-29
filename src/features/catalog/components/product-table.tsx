import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { Category, Product } from "../schemas/catalog";

export function ProductTable({
  products,
  categories,
  canManage,
}: {
  products: readonly Product[];
  categories: readonly Category[];
  canManage: boolean;
}) {
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  if (!products.length)
    return (
      <section className="card empty">
        <h2>No products match</h2>
        <p>Change the filters or add a product to this catalog.</p>
        {canManage && (
          <Link className="button" href="/products/new">
            Add product
          </Link>
        )}
      </section>
    );
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Variants</th>
              <th>Stock</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce(
                (sum, item) => sum + item.stock,
                0,
              );
              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="metric-label">
                      {product.variants.map((item) => item.sku).join(", ")}
                    </div>
                  </td>
                  <td>
                    {categoryNames.get(product.categoryId) ?? "Uncategorized"}
                  </td>
                  <td>{formatMoney(product.priceMinor)}</td>
                  <td>{product.variants.length}</td>
                  <td>
                    {stock}{" "}
                    {stock === 0 ? (
                      <StatusBadge status="Out of stock" />
                    ) : stock <= product.lowStockThreshold ? (
                      <StatusBadge status="Low stock" />
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td>
                    <Link
                      className="button secondary"
                      href={`/products/${product.id}`}
                    >
                      {canManage ? "Open" : "View"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
