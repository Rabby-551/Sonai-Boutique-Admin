import { expect, test } from "@playwright/test";

test("owner can navigate the operations workspace", async ({
  page,
  isMobile,
}) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Operations overview" }),
  ).toBeVisible();
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});
