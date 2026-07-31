import { expect, test } from "@playwright/test";

test("health, readiness, and browser security headers are available", async ({
  request,
  page,
}) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  await expect(health.json()).resolves.toMatchObject({
    status: "ok",
    service: "shonai-admin",
  });

  const ready = await request.get("/api/ready");
  expect(ready.status()).toBe(200);
  await expect(ready.json()).resolves.toMatchObject({
    status: "ready",
    source: "mock",
  });

  const response = await page.goto("/dashboard");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
});

test("keyboard users can skip navigation and retain visible focus", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Physical keyboard focus is covered by the desktop project.",
  );
  await page.goto("/dashboard");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("not-found and permission failures provide accessible recovery", async ({
  page,
  context,
}) => {
  await page.goto("/route-that-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to dashboard" }),
  ).toBeVisible();

  await context.addCookies([
    {
      name: "shonai-e2e-role",
      value: "support",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/payroll");
  const heading = page.getByRole("heading", {
    name: "We could not load this view",
  });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("mobile controls meet the 44 pixel target and reduced motion is honored", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Mobile-specific release check.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard");
  for (const locator of [
    page.getByRole("button", { name: "Update dashboard" }),
    page.getByLabel("Location", { exact: true }),
    page.getByLabel("Date range", { exact: true }),
  ]) {
    const box = await locator.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const duration = await page
    .getByRole("button", { name: "Update dashboard" })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(["0s", "0.00001s"]).toContain(duration);
});
