import type { Category, Product } from "../schemas/catalog";
import { CategoryRow } from "./category-row";

export function CategoryTable({
  categories,
  products,
  canManage,
}: {
  categories: readonly Category[];
  products: readonly Product[];
  canManage: boolean;
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Parent</th>
              <th>Products</th>
              <th>Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow
                canManage={canManage}
                categories={categories}
                category={category}
                key={category.id}
                productCount={
                  products.filter(
                    (product) =>
                      product.categoryId === category.id &&
                      product.status !== "archived",
                  ).length
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
