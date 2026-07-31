import { expect, test } from "@playwright/test";

test("inventory filters work on desktop and mobile", async ({ page }) => {
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await page.getByLabel("Location", { exact: true }).selectOption("loc-online");
  await page.getByLabel("Stock status").selectOption("low");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/locationId=loc-online/);
  await expect(page.getByRole("table")).toBeVisible();
});

test("manager records a scanner-assisted stock receipt", async ({
  page,
  browserName,
}) => {
  test.setTimeout(60_000);
  test.skip(browserName !== "chromium", "Persistent stock mutation runs once.");
  const sku = "SH-SAR-1048-BR";
  await page.goto("/stock-movements/new", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Scan barcode or enter SKU").fill(sku);
  await page.getByLabel("Scan barcode or enter SKU").press("Enter");
  await expect(page.getByText(`${sku} selected.`)).toBeVisible();
  await page.getByLabel("Quantity").fill("2");
  await page.getByLabel("Reference").fill("E2E-RECEIPT-1");
  await page.getByLabel("Reason").fill("Automated stock receipt verification");
  await page.getByRole("button", { name: "Record movement" }).click();
  await expect(page.getByText("Stock movement recorded.")).toBeVisible({
    timeout: 15_000,
  });
  await page.goto(`/stock-movements?query=${encodeURIComponent(sku)}`);
  await expect(page.getByText("E2E-RECEIPT-1")).toBeVisible();
});

test("manual order reserves then cancellation releases stock", async ({
  page,
  browserName,
}) => {
  test.setTimeout(60_000);
  test.skip(browserName !== "chromium", "Persistent order mutation runs once.");
  await page.goto("/orders/new");
  await page.getByLabel("Customer name").fill("Fictional E2E Customer");
  await page.getByLabel("Bangladesh phone").fill("+8801712345678");
  await page.getByLabel("Delivery address").fill("House 12, Test Road, Dhaka");
  await page.getByRole("button", { name: "Create order" }).click();
  await expect(page).toHaveURL(/\/orders\/ord-/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: /^SH-\d{6}-\d{4}$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm and reserve" }).click();
  await expect(
    page.getByText("Order confirmed and stock reserved."),
  ).toBeVisible();
  await page
    .getByPlaceholder("Cancellation reason")
    .fill("Customer changed requested color");
  const cancelButton = page.getByRole("button", { name: "Cancel order" });
  await expect(cancelButton).toBeEnabled({ timeout: 30_000 });
  await cancelButton.click();
  await expect(
    page.getByText("Order cancelled and reservations released."),
  ).toBeVisible();
});

test("cashier and support receive granular navigation", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "cashier",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Record movement" })).toHaveCount(
    0,
  );
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "support",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create order" })).toHaveCount(0);
});
