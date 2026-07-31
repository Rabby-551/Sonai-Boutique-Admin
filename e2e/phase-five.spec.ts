import { expect, test } from "@playwright/test";

test("campaign, reports, staff, and attendance views work responsively", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/campaigns");
  await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/reports");
  await expect(
    page.getByRole("heading", { name: "Sales report" }),
  ).toBeVisible();
  await expect(
    page.getByText("Revenue", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/staff");
  await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();
  await page.goto("/attendance");
  await expect(
    page.getByRole("heading", { name: "Attendance", exact: true }),
  ).toBeVisible();
});

test("owner creates and activates a campaign", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90_000);
  test.skip(
    browserName !== "chromium",
    "Persistent campaign mutation runs once.",
  );
  await page.goto("/campaigns/new");
  await page.getByLabel("Name").fill("Fictional Phase Five Campaign");
  await page.getByLabel("Description").fill("Browser verification campaign.");
  await page.getByLabel("Percentage off").fill("15");
  await page.getByLabel("Starts").fill("2026-07-01T00:00");
  await page.getByLabel("Ends").fill("2026-09-01T00:00");
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page.getByText("Campaign draft created.")).toBeVisible({
    timeout: 60_000,
  });
  await page.goto("/campaigns");
  await page.getByRole("link", { name: /CMP-0002/ }).click();
  await page.getByRole("button", { name: "Mark scheduled" }).click();
  await expect(page.getByText("Campaign marked scheduled.")).toBeVisible();
});

test("owner records attendance and creates payroll", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Persistent payroll mutation runs once.",
  );
  await page.goto("/attendance");
  await page
    .getByLabel("Staff", { exact: true })
    .last()
    .selectOption("stf-cashier-01");
  await page.getByLabel("Date", { exact: true }).fill("2026-07-11");
  await page
    .getByLabel("Status", { exact: true })
    .last()
    .selectOption("absent");
  await page.getByRole("button", { name: "Save attendance" }).click();
  await expect(page.getByText("Attendance recorded.")).toBeVisible();
  await page.goto("/payroll/new");
  await page.getByLabel("Month").fill("2026-07");
  await page.getByLabel("Scope").selectOption("rupnagar");
  await page.getByRole("button", { name: "Create payroll" }).click();
  await expect(page.getByText("Payroll draft created.")).toBeVisible();
});

test("support sees self-service attendance but not financial administration", async ({
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
  await page.goto("/attendance");
  await expect(
    page.getByRole("heading", { name: "Attendance", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Payroll" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Reports" })).toHaveCount(0);
  await page.goto("/payroll");
  await expect(
    page.getByRole("heading", { name: "We could not load this view" }),
  ).toBeVisible();
});

test("manager can inspect users and settings without privileged controls", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "manager",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New user" })).toHaveCount(0);
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Settings are read only for your role."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Save settings" })).toHaveCount(
    0,
  );
});
