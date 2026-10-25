import { expect, test, type Page } from "@playwright/test";

const routes = async (page: Page) => {
  await page.goto("/");
  return page.locator("aside nav a").evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
};

test("every sidebar link resolves to a rendered page with live previews", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const hrefs = await routes(page);
  expect(hrefs.length).toBeGreaterThan(40);
  for (const href of hrefs) {
    await page.goto(`/${href}`);
    // The builder previews a page (with its own h1) inside the docs page, so take the first.
    const h1 = page.locator("main h1").first();
    await expect(h1, href).toBeVisible();
    await expect(h1, href).not.toHaveText("Page not found");
    await expect(page.getByText(/Demo failed|Missing example|Missing manifest/), href).toHaveCount(0);
    if (/#\/(components|patterns)\/./.test(href)) {
      const stages = page.locator('[data-testid="example-stage"], [data-testid="playground-stage"]');
      expect(await stages.count(), href).toBeGreaterThan(0);
      for (const stage of await stages.all()) {
        expect((await stage.innerHTML()).length, `${href} preview is empty`).toBeGreaterThan(20);
      }
      await expect(page.getByRole("heading", { name: "API" })).toBeVisible();
    }
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test.describe("copy controls", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copy usage, import, source and install write the real text to the clipboard", async ({ page }) => {
    await page.goto("/#/components/button");
    const read = () => page.evaluate(() => navigator.clipboard.readText());

    await page.getByTestId("copy-usage").click();
    await expect(page.getByTestId("copy-usage")).toHaveText("Copied");
    expect(await read()).toContain('import { Button } from "@heigin/ui";');
    expect(await read()).toContain('<Button variant="secondary">Export</Button>');

    await page.getByTestId("copy-import").click();
    expect(await read()).toBe('import { Button } from "@heigin/ui";');

    await page.getByRole("tab", { name: "Source" }).click();
    await page.getByTestId("copy-source").click();
    const source = await read();
    expect(source).toContain("export const Button = React.forwardRef");
    expect(source).toContain('"use client";');

    await page.getByRole("button", { name: "button.module.css" }).click();
    await page.getByTestId("copy-source").click();
    expect(await read()).toContain(".button {");

    await page.getByRole("tab", { name: "Install" }).click();
    await page.getByTestId("copy-install").click();
    expect(await read()).toBe("npm install @heigin/ui");
    await page.getByTestId("copy-command").click();
    expect(await read()).toBe("node scripts/copy-component.mjs button --dest <your-app>/components/heigin");
  });

  test("playground controls change the live component and its snippet", async ({ page }) => {
    await page.goto("/#/components/button");
    const stage = page.getByTestId("playground-stage");
    await expect(stage.getByRole("button")).toHaveAttribute("data-variant", "primary");
    await page.getByRole("combobox", { name: "Variant" }).click();
    await page.getByRole("option", { name: "secondary" }).click();
    await expect(stage.getByRole("button")).toHaveAttribute("data-variant", "secondary");
    await page.getByTestId("pg-loading").click();
    await expect(stage.getByRole("button")).toHaveAttribute("aria-busy", "true");
    await page.getByTestId("copy-snippet").first().click();
    const snippet = await page.evaluate(() => navigator.clipboard.readText());
    expect(snippet).toContain('<Button variant="secondary" loading>');
  });
});

test("dialog example: opens, validates, closes on Escape and restores focus", async ({ page }) => {
  await page.goto("/#/components/dialog");
  const trigger = page.getByRole("button", { name: "New lead" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Create lead" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Create lead" }).click();
  await expect(dialog.getByText("Enter a name")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("dropdown menu: keyboard open, arrow, select", async ({ page }) => {
  await page.goto("/#/components/dropdown-menu");
  await page.getByTestId("example-stage").getByRole("button", { name: "Actions" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(page.getByText("Last action: Assign owner")).toBeVisible();
});

test("tabs switch with arrow keys; table states switch between populated, loading and empty", async ({ page }) => {
  await page.goto("/#/components/table");
  const table = page.getByRole("table", { name: "Open leads" });
  await expect(table.getByRole("row")).toHaveCount(5);
  await page.getByRole("tab", { name: "Loading" }).click();
  await expect(table).toHaveAttribute("aria-busy", "true");
  await page.getByRole("tab", { name: "Empty" }).click();
  await expect(page.getByText("No open leads", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Empty" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Loading" })).toBeFocused();
});

test("form validation example marks fields invalid and recovers", async ({ page }) => {
  await page.goto("/#/components/field");
  await page.getByRole("button", { name: "Save lead" }).click();
  const mobile = page.getByLabel(/Mobile/);
  await expect(mobile).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel(/Name/).fill("Asha Rao");
  await mobile.fill("9876543210");
  await page.getByRole("button", { name: "Save lead" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
});

test("disabled button cannot be activated", async ({ page }) => {
  await page.goto("/#/components/button");
  const disabled = page.getByRole("button", { name: "Disabled", exact: true });
  await expect(disabled).toBeDisabled();
});

test("visual reference screenshots (desktop)", async ({ page }) => {
  for (const [name, route] of [
    ["overview", "/"],
    ["button", "/#/components/button"],
    ["table", "/#/components/table"],
    ["colors", "/#/tokens/colors"],
    ["approval", "/#/patterns/approval-card"],
  ] as const) {
    await page.goto(route);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `test-results/screens/docs-desktop-${name}.png`, fullPage: false });
  }
});

test("View on GitHub stays in the top bar and links to the repository", async ({ page }) => {
  for (const route of ["/", "/#/components/button", "/#/builder"]) {
    await page.goto(route);
    const link = page.getByTestId("github-link");
    await expect(link, route).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://github.com/paragjha/HeiGin-Design-Library");
    await expect(link).toHaveAttribute("target", "_blank");
  }
  await page.mouse.wheel(0, 2000);
  const box = await page.getByTestId("github-link").boundingBox();
  expect(box!.y).toBeLessThan(48); // still pinned after scrolling
});
