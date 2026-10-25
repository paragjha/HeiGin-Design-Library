import { expect, test } from "@playwright/test";

test("mobile: navigation drawer works and there is no horizontal page scroll", async ({ page }) => {
  await page.goto("/#/components/table");
  await expect(page.getByRole("link", { name: /View on GitHub/ })).toHaveAttribute("href", "https://github.com/paragjha/HeiGin-Design-Library");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "HeiGin UI" });
  await expect(drawer).toBeVisible();
  await drawer.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))));
  const foundations = drawer.getByRole("button", { name: "Foundations" });
  if ((await foundations.getAttribute("aria-expanded")) !== "true") {
    await foundations.click();
  }
  await drawer.getByRole("link", { name: "Colors" }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Colors" })).toBeVisible();
  for (const route of ["/", "/#/components/button", "/#/components/table", "/#/patterns/record-header"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} scrolls horizontally by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});

test("mobile: controls use 44px touch targets", async ({ page }) => {
  await page.goto("/#/components/button");
  const box = await page.getByTestId("playground-stage").getByRole("button").boundingBox();
  expect(box?.height).toBe(44);
  await page.goto("/#/components/input");
  const input = await page.getByTestId("playground-stage").getByRole("textbox").boundingBox();
  expect(input?.height).toBe(44);
});

test("visual reference screenshots (mobile)", async ({ page }) => {
  for (const [name, route] of [
    ["button", "/#/components/button"],
    ["table", "/#/components/table"],
  ] as const) {
    await page.goto(route);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `test-results/screens/docs-mobile-${name}.png` });
  }
});
