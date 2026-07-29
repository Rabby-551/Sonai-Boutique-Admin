import type { CsvImportRow } from "../data/repository";

export interface CsvPreviewRow {
  rowNumber: number;
  value: CsvImportRow | null;
  errors: readonly string[];
}
export interface CsvPreview {
  headers: readonly string[];
  rows: readonly CsvPreviewRow[];
}
const required = [
  "name",
  "sku",
  "category",
  "price",
  "cost",
  "color",
  "size",
  "stock",
  "status",
];

function splitLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

/** Parses the documented catalog template and keeps row failures visible instead of silently dropping data. */
export function parseCatalogCsv(
  text: string,
  existingSkus: readonly string[] = [],
): CsvPreview {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headers = splitLine(lines[0] ?? "").map((header) =>
    header.toLowerCase(),
  );
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length)
    return {
      headers,
      rows: [
        {
          rowNumber: 1,
          value: null,
          errors: [`Missing headers: ${missing.join(", ")}`],
        },
      ],
    };
  const known = new Set(existingSkus.map((sku) => sku.toLowerCase()));
  const rows = lines.slice(1).map((line, index): CsvPreviewRow => {
    const values = splitLine(line);
    const get = (name: string) => values[headers.indexOf(name)]?.trim() ?? "";
    const price = Number(get("price"));
    const cost = Number(get("cost"));
    const stock = Number(get("stock"));
    const status = get("status").toLowerCase();
    const sku = get("sku");
    const errors: string[] = [];
    if (!get("name")) errors.push("Name is required.");
    if (!sku) errors.push("SKU is required.");
    else if (known.has(sku.toLowerCase()))
      errors.push("SKU already exists or is duplicated in this file.");
    else known.add(sku.toLowerCase());
    if (!get("category")) errors.push("Category is required.");
    if (!Number.isFinite(price) || price < 0)
      errors.push("Price must be a positive BDT amount.");
    if (!Number.isFinite(cost) || cost < 0 || cost > price)
      errors.push("Cost must be between zero and price.");
    if (!Number.isInteger(stock) || stock < 0)
      errors.push("Stock must be a whole number.");
    if (status !== "draft" && status !== "active")
      errors.push("Status must be draft or active.");
    const value = errors.length
      ? null
      : {
          name: get("name"),
          sku,
          category: get("category"),
          priceMinor: Math.round(price * 100),
          costMinor: Math.round(cost * 100),
          color: get("color") || "Default",
          size: get("size") || "Free",
          stock,
          status: status as "draft" | "active",
        };
    return { rowNumber: index + 2, value, errors };
  });
  return { headers, rows };
}
