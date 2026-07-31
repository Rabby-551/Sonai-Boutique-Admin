import { expect, test } from "@playwright/test";

test("desktop shell exposes active navigation and collapse control", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop shell assertion.");
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator(".recharts-wrapper")).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.locator(".app-shell")).not.toHaveClass(/sidebar-collapsed/);
});

test("quick navigation searches permitted destinations", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Command search assertion.");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Quick navigation/ }).click();
  await page
    .getByPlaceholder("Search pages and workflows")
    .fill("loyalty points");
  const dialog = page.getByRole("dialog", { name: "Quick navigation" });
  const rewardDestination = dialog.locator(
    '[data-navigation-id="loyalty-rewards"]',
  );
  await expect(rewardDestination).toBeVisible();
  await rewardDestination.click();
  await expect(page).toHaveURL(/\/loyalty\/rewards$/);
});

test("mobile shell uses a modal drawer without horizontal page overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile shell assertion.");
  await page.goto("/dashboard");
  await expect(page.locator(".desktop-sidebar")).toBeHidden();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Navigation menu" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("mobile list routes use essential-field record cards", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Mobile record-card assertion.",
  );
  await page.goto("/products");
  const firstRecord = page.locator(".responsive-record-table tbody tr").first();
  await expect(firstRecord).toBeVisible();
  await expect(firstRecord.locator('td[data-label="Product"]')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
