import type { Product } from "../schemas/catalog";
import { formatMoney } from "@/lib/formatting";
import Image from "next/image";

export function BarcodeLabels({ products }: { products: readonly Product[] }) {
  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant })),
  );
  return (
    <div className="barcode-sheet">
      {variants.map(({ product, variant }) => (
        <article className="barcode-label" key={variant.id}>
          <div className="barcode-brand">SHONAI BOUTIQUE</div>
          <strong>{product.name}</strong>
          <span>
            {variant.color} · {variant.size}
          </span>
          <Image
            alt={`Code 128 barcode for ${variant.sku}`}
            height="64"
            src={`/api/barcodes/${encodeURIComponent(variant.barcode)}`}
            unoptimized
            width="220"
          />
          <span className="barcode-code">{variant.sku}</span>
          <strong>
            {formatMoney(variant.priceMinor ?? product.priceMinor)}
          </strong>
        </article>
      ))}
    </div>
  );
}
