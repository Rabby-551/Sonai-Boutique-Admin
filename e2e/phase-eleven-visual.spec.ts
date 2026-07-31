import { expect, test } from "@playwright/test";
import { resetDemoData } from "./helpers/reset-demo-data";

test("preview release handoff matches its accepted baseline", async ({
  page,
}) => {
  await resetDemoData(page);
  await page.goto("/demo/release");
  await page.addStyleTag({
    content: ".topbar { position: relative !important; }",
  });
  await expect(page.locator("#main-content")).toHaveScreenshot(
    "release-main.png",
    {
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
    },
  );
});
