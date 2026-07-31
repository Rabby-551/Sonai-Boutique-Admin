import { expect, test } from "@playwright/test";

test("Phase 10 acceptance exposes the complete mock design freeze", async ({
  page,
}) => {
  await page.goto("/demo/acceptance");
  await expect(
    page.getByRole("heading", { name: "Stakeholder acceptance" }),
  ).toBeVisible();
  await expect(
    page.getByText("Route pages inventoried").locator(".."),
  ).toContainText("71");
  await expect(
    page.getByRole("heading", { name: "Design freeze register" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Sessions and role overrides are fictional/i),
  ).toBeVisible();
  await expect(page.getByText("0% selected")).toBeVisible();
  await page
    .getByRole("checkbox", { name: /Business workflows and terminology/i })
    .check();
  await expect(page.getByText("20% selected")).toBeVisible();
  await expect(page.getByText(/do not create durable approval/i)).toBeVisible();
});

test("guided demo links to the acceptance workspace", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "Review design freeze" }).click();
  await expect(page).toHaveURL(/\/demo\/acceptance$/);
  await expect(
    page.getByRole("link", { name: "Preview handoff" }),
  ).toBeVisible();
});
