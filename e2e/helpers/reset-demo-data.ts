import { expect, type Page } from "@playwright/test";

export async function resetDemoData(page: Page) {
  await page.goto("/demo");
  await page.getByLabel("Type RESET DEMO").fill("RESET DEMO");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(
    page.getByText("Deterministic fictional data has been restored."),
  ).toBeVisible({ timeout: 15_000 });
}
