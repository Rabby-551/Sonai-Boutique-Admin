import { expect, test } from "@playwright/test";

test("dashboard filters are URL-backed and accessible", async ({
  page,
}, testInfo) => {
  await page.goto("/dashboard");
  const filters =
    testInfo.project.name === "mobile"
      ? page.getByRole("dialog")
      : page.locator(".premium-filter-desktop");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open filters" }).click();
  }
  await filters
    .getByRole("combobox", { name: "Location", exact: true })
    .selectOption("online");
  await filters
    .getByRole("combobox", { name: "Date range", exact: true })
    .selectOption("7d");
  await filters.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(
    /branch=online.*range=7d|range=7d.*branch=online/,
  );
  await expect(
    page.getByText("2 active filters", { exact: true }),
  ).toBeVisible();
});

test("manager product workflow creates, edits and archives", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "One persistent mutation run is enough; mobile read behavior has separate coverage.",
  );
  await page.goto("/products/new");
  await page.getByLabel("Product name").fill("Azure Test Saree");
  await page.getByLabel("Category").selectOption({ label: "Sarees" });
  await page
    .getByLabel("Description")
    .fill("A complete blue saree created by the Phase 2 browser workflow.");
  await page.getByLabel("Selling price (BDT)").fill("4500");
  await page.getByLabel("Unit cost (BDT)").fill("2500");
  await page.getByLabel("SKU").fill("TEST-AZURE-001");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(
    page.getByRole("heading", { name: "Azure Test Saree" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit product" }).click();
  await page.getByLabel("Product name").fill("Azure Test Saree Updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Azure Test Saree Updated" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Archive product" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Archive", exact: true })
    .click();
  await expect(page.getByText("archived", { exact: true })).toBeVisible();
});

test("CSV preview identifies valid and invalid rows", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "File import is covered once in Chromium.",
  );
  await page.goto("/products/import");
  const csv = [
    "name,sku,category,price,cost,color,size,stock,status",
    "Imported Orna,TEST-IMPORT-1,Orna,1200,700,White,Free,3,draft",
    "Broken,TEST-IMPORT-1,Missing,10,20,Blue,Free,-1,wrong",
  ].join("\n");
  await page.getByLabel("Paste CSV contents (fallback)").fill(csv);
  await expect(page.getByText("1 valid rows")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/rows need correction/)).toBeVisible();
  await page.getByRole("button", { name: "Import valid rows" }).click();
  await expect(page.getByText(/1 products imported/)).toBeVisible();
});

test("barcode page renders valid Code 128 images", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Barcode HTTP generation is browser-independent.",
  );
  await page.goto("/products/barcodes");
  await expect(
    page.getByRole("heading", { name: "Barcode labels" }),
  ).toBeVisible();
  const image = page.getByAltText(/Code 128 barcode/).first();
  await expect(image).toBeVisible();
  await expect
    .poll(
      () => image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
});
