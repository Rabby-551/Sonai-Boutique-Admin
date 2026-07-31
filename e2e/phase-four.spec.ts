import { expect, test } from "@playwright/test";

test("customer and complaint lists work on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/customers");
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await page.getByLabel("Loyalty").selectOption("guest");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/loyalty=guest/);
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/complaints");
  await expect(page.getByRole("heading", { name: "Complaints" })).toBeVisible();
});

test("manager creates a customer and complaint", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90_000);
  test.skip(
    browserName !== "chromium",
    "Persistent relationship mutation runs once.",
  );
  await page.goto("/customers/new");
  await page.getByLabel("Name").fill("Fictional Phase Four Customer");
  await page.getByLabel("Bangladesh phone").fill("+8801700000044");
  await page.getByLabel("Email").fill("phase.four@example.test");
  await page.getByLabel("Primary address").fill("House 4, Example Road, Dhaka");
  await page.getByLabel(/Loyalty consent/).check();
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByText("Customer created.")).toBeVisible();
  await page.goto("/complaints/new", { waitUntil: "domcontentloaded" });
  const customerOption = page
    .getByLabel("Customer", { exact: true })
    .locator("option")
    .filter({ hasText: "Fictional Phase Four Customer" });
  await page
    .getByLabel("Customer", { exact: true })
    .selectOption((await customerOption.getAttribute("value")) ?? "");
  await page
    .getByLabel("Description")
    .fill("Fictional delivery complaint used for browser verification.");
  await page.getByRole("button", { name: "Log complaint" }).click();
  await expect(page.getByText("Complaint logged.")).toBeVisible({
    timeout: 15_000,
  });
});

test("manager creates and submits a purchase order", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90_000);
  test.skip(
    browserName !== "chromium",
    "Persistent procurement mutation runs once.",
  );
  await page.goto("/purchase-orders/new");
  await page
    .getByLabel("Supplier", { exact: true })
    .selectOption("sup-demo-001");
  await page.getByLabel("Destination").selectOption("rupnagar");
  await page.getByLabel("Expected delivery").fill("2026-08-20");
  await page.locator('select[name="variantId"]').selectOption({ index: 1 });
  await page.getByLabel("Ordered quantity").fill("4");
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page.getByText("Purchase order draft created.")).toBeVisible({
    timeout: 15_000,
  });
});

test("support can manage complaints but cannot access procurement", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "support",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/complaints");
  await expect(page.getByRole("link", { name: "Log complaint" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Suppliers" })).toHaveCount(0);
  await page.goto("/purchase-orders");
  await expect(
    page.getByRole("heading", { name: "We could not load this view" }),
  ).toBeVisible();
});
