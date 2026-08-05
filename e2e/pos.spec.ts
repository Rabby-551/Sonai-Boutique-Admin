import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "cashier",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
});

test("cashier opens a register and completes a cash sale", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90_000);
  test.skip(browserName !== "chromium", "Persistent POS mutation runs once.");
  await page.goto("/pos");
  await expect(
    page.getByRole("heading", { name: "Open your shift" }),
  ).toBeVisible();
  await page.getByLabel("Register").selectOption("reg-rupnagar-01");
  await page.getByLabel("Opening cash float (BDT)").fill("500");
  await page.getByRole("button", { name: "Open shift" }).click();
  await expect(
    page.getByRole("heading", { name: "Point of sale" }),
  ).toBeVisible();
  const search = page.getByPlaceholder(/Scan barcode or search product/);
  await search.fill("SH-SAR-1048-BR");
  await search.press("Enter");
  await page.getByLabel("Applied amount").fill("11250");
  await page.getByLabel("Cash received").fill("12000");
  await page.getByRole("button", { name: /Accept.*11,250/ }).click();
  await expect(
    page.getByRole("heading", { name: "Sales receipt" }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/^POS-\d{6}-\d{4}$/)).toBeVisible();
});

test("POS remains discoverable and responsive for a cashier", async ({
  page,
  isMobile,
}) => {
  await page.goto("/pos");
  await expect(
    page.getByRole("heading", { name: /Open your shift|Point of sale/ }),
  ).toBeVisible();
  await page.goto("/dashboard");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Point of sale" })).toBeVisible();
  await expect(page.getByRole("link", { name: "POS settings" })).toHaveCount(0);
});
