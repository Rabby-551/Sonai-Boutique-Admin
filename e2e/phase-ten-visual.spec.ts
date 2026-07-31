import { expect, test } from "@playwright/test";
import { resetDemoData } from "./helpers/reset-demo-data";

test("demo workspace matches its accepted visual baseline", async ({
  page,
}) => {
  await resetDemoData(page);
  await page.goto("/demo");
  await page.addStyleTag({
    content: ".topbar { position: relative !important; }",
  });
  await expect(page.locator("#main-content")).toHaveScreenshot(
    "demo-main.png",
    {
      animations: "disabled",
    },
  );
});

test("acceptance workspace matches its accepted visual baseline", async ({
  page,
}) => {
  await resetDemoData(page);
  await page.goto("/demo/acceptance");
  await page.addStyleTag({
    content: ".topbar { position: relative !important; }",
  });
  await expect(page.locator("#main-content")).toHaveScreenshot(
    "acceptance-main.png",
    {
      animations: "disabled",
    },
  );
});
