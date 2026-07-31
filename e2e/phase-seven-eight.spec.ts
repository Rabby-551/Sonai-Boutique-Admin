import { expect, test } from "@playwright/test";

test("Phase 7 platform and release designs remain clearly fictional", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/platform");
  await expect(
    page.getByRole("heading", { name: "Platform control center" }),
  ).toBeVisible();
  await expect(page.getByText(/No live identity, database/i)).toBeVisible();
  await expect(page.getByText("No live calls")).toBeVisible();

  await page.goto("/platform/migrations");
  await expect(
    page.getByRole("heading", {
      name: "Migration rehearsals",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/No development fixture has been imported/i),
  ).toBeVisible();

  await page.goto("/platform/release-readiness");
  await expect(
    page.getByRole("heading", { name: "Go / no-go readiness" }),
  ).toBeVisible();
  await expect(
    page.getByText("Backup restore and disaster recovery"),
  ).toBeVisible();
});

test("Phase 8 intelligence, growth, and finance designs are navigable", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/insights");
  await expect(
    page.getByRole("heading", { name: "Demand and operations intelligence" }),
  ).toBeVisible();
  await expect(page.getByText("Advisory only")).toHaveCount(0);

  await page.goto("/inventory/reorder-suggestions");
  await expect(page.getByText("Advisory only")).toBeVisible();
  await expect(page.getByText(/ordinary draft purchase orders/i)).toBeVisible();

  await page.goto("/customers/segments");
  await expect(
    page.getByRole("heading", { name: "Customer segments" }),
  ).toBeVisible();
  await page.goto("/loyalty/rewards");
  await expect(
    page.getByRole("heading", { name: "Rewards and redemption" }),
  ).toBeVisible();
  await page.goto("/finance/reconciliation");
  await expect(
    page.getByRole("heading", { name: "Payment reconciliation" }),
  ).toBeVisible();
});

test("Phase 8 operations, privacy, schedules, and localization are responsive", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [path, heading] of [
    ["/customers/privacy-requests", "Customer privacy requests"],
    ["/reports/schedules", "Scheduled reports"],
    ["/channels", "Channel operations"],
    ["/automation/rules", "Rules and execution controls"],
    ["/complaints/sla-policies", "Complaint SLA policies"],
    ["/settings/localization", "English and Bengali readiness"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText("Fictional design data.")).toBeVisible();
  }
  await expect(page.getByText("ইনভেন্টরি")).toBeVisible();
});

test("cashier sees scoped growth links but not platform or finance controls", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Permission navigation runs once.",
  );
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "cashier",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/customers/segments");
  await expect(
    page.getByRole("heading", { name: "Customer segments" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Platform" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Reconciliation" })).toHaveCount(
    0,
  );
  await page.goto("/platform");
  await expect(
    page.getByRole("heading", { name: "We could not load this view" }),
  ).toBeVisible();
});
