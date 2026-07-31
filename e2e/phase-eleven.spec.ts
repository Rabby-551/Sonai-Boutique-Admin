import { expect, test } from "@playwright/test";

test("Phase 11 release handoff exposes identity, gates and boundaries", async ({
  page,
}) => {
  await page.goto("/demo/release");
  await expect(
    page.getByRole("heading", { name: "Preview release handoff" }),
  ).toBeVisible();
  await expect(page.getByText(/not a production deployment/i)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Preview gates" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Guided demo/i }).first(),
  ).toHaveAttribute("href", "/demo");
  await expect(
    page.getByRole("heading", { name: "Preview limitations" }),
  ).toBeVisible();
  await expect(page.getByText(/Use only fictional data/i)).toBeVisible();
});

test("all review roles can read the release handoff", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Role matrix runs once.");
  for (const role of ["owner", "manager", "cashier", "support"]) {
    await context.addCookies([
      { name: "shonai-e2e-role", value: role, domain: "127.0.0.1", path: "/" },
    ]);
    await page.goto("/demo/release");
    await expect(
      page.getByRole("heading", { name: "Preview release handoff" }),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${role} session`, "i")),
    ).toBeVisible();
  }
});

test("release route directory reflows for mobile review", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Mobile-only responsive assertion.",
  );
  await page.goto("/demo/release");
  await expect(
    page.getByRole("link", { name: /Inventory Balances, movements/i }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});
