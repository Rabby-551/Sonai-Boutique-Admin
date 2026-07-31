import { expect, test } from "@playwright/test";
import { resetDemoData } from "./helpers/reset-demo-data";

const archetypes = [
  ["dashboard", "/dashboard"],
  ["products", "/products"],
  ["product-form", "/products/new"],
  ["orders", "/orders/ord-captured-001"],
  ["reports", "/reports"],
] as const;

for (const [name, route] of archetypes) {
  test(`${name} archetype matches its redesign baseline`, async ({ page }) => {
    await resetDemoData(page);
    await page.goto(route);
    const recordLimit = name === "products" ? 4 : name === "orders" ? 3 : null;
    await page.addStyleTag({
      content: `.topbar { position: relative !important; }${recordLimit ? `.responsive-record-table tbody tr:nth-child(n + ${recordLimit}) { display: none !important; }` : ""}`,
    });
    await expect(page.locator("#main-content")).toHaveScreenshot(
      `${name}-main.png`,
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.02,
        mask: recordLimit
          ? [page.locator(".responsive-record-table tbody")]
          : [],
      },
    );
  });
}
