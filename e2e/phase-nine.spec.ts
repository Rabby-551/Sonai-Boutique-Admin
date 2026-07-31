import { expect, test } from "@playwright/test";

test("Phase 9 demo workspace guides a responsive staff review", async ({
  page,
}) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Demo and staff review" }),
  ).toBeVisible();
  await expect(page.getByText(/deterministic fictional people/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Start scenario" })).toHaveCount(
    6,
  );
  await expect(page.getByText("63% reviewed")).toBeVisible();
  await page
    .getByRole("checkbox", { name: /Keyboard route and form review/i })
    .check();
  await expect(page.getByText("75% reviewed")).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText(/Enter RESET DEMO exactly/i)).toBeVisible();
  await page.getByLabel("Type RESET DEMO").fill("RESET DEMO");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(
    page.getByText(/fictional data has been restored/i),
  ).toBeVisible();
});

test("support receives guidance without the owner reset control", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Permission scenario runs once.",
  );
  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "support",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Demo and staff review" }),
  ).toBeVisible();
  await expect(page.getByText(/requires the Owner role/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset demo" })).toHaveCount(0);
});
