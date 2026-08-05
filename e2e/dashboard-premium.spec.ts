import { expect, test } from "@playwright/test";

test("premium dashboard preserves its locked hero and complete intelligence structure", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Operations overview" }),
  ).toBeVisible();
  const hero = page.getByRole("region", { name: "Sonai Boutique operations" });
  await expect(hero.getByRole("img")).toBeVisible();
  await expect(page.locator(".premium-kpi-card")).toHaveCount(6);
  await expect(
    page.getByRole("heading", { name: "Bangladesh order density" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
});

test("compact dashboard follows the chart-led reference grid", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Covered once on desktop.");
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/dashboard");
  await expect(page.locator(".compact-chart-slot")).toBeVisible();
  await expect(page.locator(".compact-kpi-slot")).toBeVisible();
  const layout = await page.evaluate(() => {
    const chart = document
      .querySelector(".compact-chart-slot")
      ?.getBoundingClientRect();
    const metrics = document
      .querySelector(".compact-kpi-slot")
      ?.getBoundingClientRect();
    return {
      chartY: chart?.y,
      metricsY: metrics?.y,
      chartHeight: chart?.height,
    };
  });
  expect(Math.abs((layout.chartY ?? 0) - (layout.metricsY ?? 0))).toBeLessThan(
    2,
  );
  expect(layout.chartHeight ?? 0).toBeLessThan(460);
  await page.getByRole("tab", { name: "Customer growth" }).click();
  await expect(page.getByText("Repeat rate", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Customer growth" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("dashboard exports return the intended filtered CSV contracts", async ({
  request,
}) => {
  const summary = await request.get(
    "/api/dashboard/export?view=summary&range=7d",
  );
  expect(summary.status()).toBe(200);
  expect(summary.headers()["content-disposition"]).toContain(
    "dashboard-summary.csv",
  );
  expect(await summary.text()).toContain('"revenue"');
  const orders = await request.get(
    "/api/dashboard/export?view=orders&orderStatus=confirmed",
  );
  expect(orders.status()).toBe(200);
  expect(orders.headers()["content-disposition"]).toContain(
    "dashboard-orders.csv",
  );
  expect(await orders.text()).toContain('"SH-260805-1848"');
});

test("chart, map and order drawers remain keyboard accessible", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Covered once on desktop.");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Full screen" }).click();
  await expect(page.locator(".premium-chart-dialog")).toBeVisible();
  await page
    .locator(".premium-chart-dialog")
    .getByRole("button", { name: "Close" })
    .click();
  const marker = page.getByRole("button", { name: "Chattogram: 168 Orders" });
  await marker.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".premium-map-tooltip")).toContainText(
    "Chattogram",
  );
  await page.getByRole("button", { name: "Preview SH-260805-1846" }).click();
  const preview = page.locator(".premium-order-preview");
  await expect(preview).toBeVisible();
  await expect(preview).not.toContainText(/phone|email|address/i);
});

test("locale switch refreshes server content and preserves the Bangla font", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "বাংলায় দেখুন" }).click();
  await expect(
    page.getByRole("heading", { name: "অপারেশনস ওভারভিউ" }),
  ).toBeVisible();
  await expect(page.locator(".premium-dashboard")).toHaveCSS(
    "font-family",
    /Hind Siliguri/,
  );
  await expect(
    page.getByRole("heading", { name: "বাংলাদেশে অর্ডারের ঘনত্ব" }),
  ).toBeVisible();
});

test("mobile filters and order cards have no horizontal page overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-only layout check.");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open filters" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(
    page
      .locator(".premium-orders-panel tbody tr")
      .first()
      .locator('td[data-label="Customer"]'),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
