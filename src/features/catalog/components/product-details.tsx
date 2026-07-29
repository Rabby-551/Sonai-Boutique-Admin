import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { Category, Product } from "../schemas/catalog";
import { ArchiveProductButton } from "./archive-button";

export function ProductDetails({
  product,
  category,
  canManage,
}: {
  product: Product;
  category?: Category;
  canManage: boolean;
}) {
  return (
    <>
      <PageHeader
        eyebrow={`Catalog · ${product.variants[0]?.sku}`}
        title={product.name}
        description={`${category?.name ?? "Uncategorized"} · Updated ${formatDate(product.updatedAt)}`}
        action={
          <div className="button-group">
            {canManage && (
              <Link className="button" href={`/products/${product.id}/edit`}>
                Edit product
              </Link>
            )}
            {canManage && product.status !== "archived" && (
              <ArchiveProductButton
                id={product.id}
                name={product.name}
                version={product.version}
              />
            )}
          </div>
        }
      />
      <div className="product-detail-grid">
        <section className="card">
          <div className="detail-image">
            <Image
              alt={product.images[0]?.altText ?? `${product.name} placeholder`}
              fill
              sizes="(max-width: 800px) 100vw, 40vw"
              src={product.images[0]?.previewUrl ?? "/product-placeholder.svg"}
            />
          </div>
          <div className="section-title" style={{ marginTop: 20 }}>
            <h2>Product summary</h2>
            <StatusBadge status={product.status} />
          </div>
          <p className="subtitle">{product.description}</p>
          <dl className="detail-list">
            <div>
              <dt>Selling price</dt>
              <dd>{formatMoney(product.priceMinor)}</dd>
            </div>
            <div>
              <dt>Unit cost</dt>
              <dd>{formatMoney(product.costMinor)}</dd>
            </div>
            <div>
              <dt>Low-stock threshold</dt>
              <dd>{product.lowStockThreshold} units</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{product.tags.join(", ") || "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="card table-card">
          <div className="section-title" style={{ padding: 20, margin: 0 }}>
            <h2>Variants and barcodes</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Option</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Barcode</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td>
                      <strong>{variant.sku}</strong>
                    </td>
                    <td>
                      {variant.color} · {variant.size}
                    </td>
                    <td>{variant.stock}</td>
                    <td>
                      {formatMoney(variant.priceMinor ?? product.priceMinor)}
                    </td>
                    <td>
                      <Image
                        alt={`Barcode for ${variant.sku}`}
                        height={44}
                        src={`/api/barcodes/${encodeURIComponent(variant.barcode)}`}
                        unoptimized
                        width={150}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
