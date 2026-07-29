import type { CatalogStore, Product, ProductVariant } from "../schemas/catalog";

const createdAt = "2026-07-29T09:00:00.000Z";

function variant(
  sku: string,
  color: string,
  size: string,
  stock: number,
  priceMinor: number | null = null,
): ProductVariant {
  return {
    id: `var-${sku.toLowerCase()}`,
    sku,
    color,
    size,
    priceMinor,
    stock,
    barcode: sku.replaceAll("-", ""),
    active: true,
  };
}

function product(
  input: Omit<Product, "slug" | "version" | "createdAt" | "updatedAt">,
): Product {
  return {
    ...input,
    slug: input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    version: 1,
    createdAt,
    updatedAt: createdAt,
  };
}

export const initialCatalogStore: CatalogStore = {
  categories: [
    {
      id: "cat-sarees",
      name: "Sarees",
      slug: "sarees",
      parentId: null,
      displayOrder: 1,
      status: "active",
      version: 1,
    },
    {
      id: "cat-batik",
      name: "Batik Sarees",
      slug: "batik-sarees",
      parentId: "cat-sarees",
      displayOrder: 1,
      status: "active",
      version: 1,
    },
    {
      id: "cat-three-piece",
      name: "Three Piece",
      slug: "three-piece",
      parentId: null,
      displayOrder: 2,
      status: "active",
      version: 1,
    },
    {
      id: "cat-orna",
      name: "Orna",
      slug: "orna",
      parentId: null,
      displayOrder: 3,
      status: "active",
      version: 1,
    },
    {
      id: "cat-shawls",
      name: "Shawls",
      slug: "shawls",
      parentId: null,
      displayOrder: 4,
      status: "active",
      version: 1,
    },
  ],
  products: [
    product({
      id: "prd-batik-silk",
      name: "Batik Silk Saree",
      description:
        "A fluid silk saree finished with hand-worked batik geometry and a restrained tonal border.",
      categoryId: "cat-batik",
      priceMinor: 1_250_000,
      costMinor: 720_000,
      lowStockThreshold: 5,
      tags: ["batik", "silk", "occasion"],
      status: "active",
      variants: [
        variant("SH-SAR-1048-BR", "Brown", "Free", 8),
        variant("SH-SAR-1048-TL", "Teal", "Free", 5),
      ],
      images: [
        {
          id: "img-batik-1",
          name: "batik-silk-front.webp",
          altText: "Brown Batik Silk Saree, front drape",
          mimeType: "image/webp",
          sizeBytes: 184_000,
          position: 0,
          previewUrl: "/product-placeholder.svg",
        },
      ],
    }),
    product({
      id: "prd-ivory-three-piece",
      name: "Ivory Embroidered Three Piece",
      description:
        "An ivory three-piece set with fine botanical embroidery, soft lining and a matching orna.",
      categoryId: "cat-three-piece",
      priceMinor: 980_000,
      costMinor: 560_000,
      lowStockThreshold: 4,
      tags: ["embroidered", "ivory"],
      status: "active",
      variants: [
        variant("SH-3PC-0281-S", "Ivory", "S", 4),
        variant("SH-3PC-0281-M", "Ivory", "M", 7),
        variant("SH-3PC-0281-L", "Ivory", "L", 2),
      ],
      images: [
        {
          id: "img-ivory-1",
          name: "ivory-three-piece.webp",
          altText: "Ivory embroidered three-piece set",
          mimeType: "image/webp",
          sizeBytes: 172_000,
          position: 0,
          previewUrl: "/product-placeholder.svg",
        },
      ],
    }),
    product({
      id: "prd-handloom-shawl",
      name: "Handloom Winter Shawl",
      description:
        "A warm handloom shawl with a softly brushed finish and traditional woven edge details.",
      categoryId: "cat-shawls",
      priceMinor: 560_000,
      costMinor: 310_000,
      lowStockThreshold: 3,
      tags: ["handloom", "winter"],
      status: "active",
      variants: [
        variant("SH-SHL-0097-MR", "Maroon", "Free", 2),
        variant("SH-SHL-0097-BK", "Black", "Free", 0),
      ],
      images: [],
    }),
    product({
      id: "prd-jamdani-orna",
      name: "Jamdani Orna",
      description:
        "A lightweight Jamdani orna with handwoven motifs designed for everyday and occasion styling.",
      categoryId: "cat-orna",
      priceMinor: 390_000,
      costMinor: 210_000,
      lowStockThreshold: 3,
      tags: ["jamdani", "handwoven"],
      status: "draft",
      variants: [variant("SH-ORN-0143-WH", "White", "Free", 5)],
      images: [],
    }),
  ],
};
