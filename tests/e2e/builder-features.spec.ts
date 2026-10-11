import { expect, test, type Page } from "@playwright/test";

const code = (page: Page) => page.getByRole("region", { name: "Generated code" });
const codeText = (page: Page) => code(page).innerText();
const tree = (page: Page, label: string) => page.locator(".b-tree__item", { has: page.locator(".b-tree__type", { hasText: new RegExp(`^${label}$`) }) }).first();
const clip = (page: Page) => page.evaluate(() => navigator.clipboard.readText());
const template = (page: Page, id: string) => page.getByLabel("Start from template").selectOption(id);

test.use({ permissions: ["clipboard-read", "clipboard-write"] });
test.beforeEach(async ({ page }) => {
  await page.goto("/#/builder");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("context menu: wrap a block and save it to My blocks", async ({ page }) => {
  const canvas = page.getByTestId("builder-canvas");
  await canvas.getByRole("heading", { level: 1, name: "Leads" }).click({ button: "right" });
  const menu = page.getByTestId("context-menu");
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: "Wrap in Card" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Wrapped in Card" })).toBeVisible();
  expect(await codeText(page)).toMatch(/<Card>\s*<PageHeader/);

  await canvas.getByRole("heading", { level: 1, name: "Leads" }).click({ button: "right" });
  await page.getByTestId("context-menu").getByRole("menuitem", { name: "Save to My blocks" }).click();
  const saved = page.getByTestId("my-block");
  await expect(saved).toHaveText(/Page header: Leads/);
  await saved.click();
  expect(((await codeText(page)).match(/<PageHeader/g) ?? []).length).toBe(2);
});

test("keyboard: Alt+arrows move the selected block", async ({ page }) => {
  await tree(page, "Filter toolbar").click();
  await page.keyboard.press("Alt+ArrowDown");
  const src = await codeText(page);
  expect(src.indexOf("<FilterToolbar")).toBeGreaterThan(src.indexOf("<Table"));
  await page.keyboard.press("Alt+ArrowUp");
  const back = await codeText(page);
  expect(back.indexOf("<FilterToolbar")).toBeLessThan(back.indexOf("<Table"));
});

test("copy just the selected block, and code ↔ canvas linking", async ({ page }) => {
  await tree(page, "Data table").click();
  await page.getByTestId("copy-block-code").click();
  const copied = await clip(page);
  expect(copied).toContain("export default function DataTableBlock()");
  expect(copied).not.toContain("<PageHeader");

  // Selecting a block highlights its lines in the code
  await tree(page, "Page header").click();
  await expect(code(page).locator(".line.is-highlighted").first()).toContainText("<PageHeader");
  // Clicking a line selects the block it belongs to
  await code(page).locator(".line", { hasText: "<FilterToolbar" }).click();
  await expect(page.getByTestId("inspector")).toContainText("Filter toolbar");
});

test("designs: save, switch away, reopen", async ({ page }) => {
  const canvas = page.getByTestId("builder-canvas");
  await canvas.getByRole("heading", { level: 1, name: "Leads" }).click();
  await page.getByTestId("inspector").getByLabel("Title").fill("Saved leads");
  await page.getByRole("button", { name: "Designs" }).click();
  const drawer = page.getByRole("dialog", { name: "Designs" });
  await drawer.getByLabel("Title").fill("My leads page");
  await drawer.getByTestId("save-design-as").click();
  await expect(drawer.getByText("My leads page")).toBeVisible();
  await page.keyboard.press("Escape");

  await template(page, "dashboard-page");
  await expect(canvas.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  await page.reload(); // saved designs survive reloads
  await page.getByRole("button", { name: "Designs" }).click();
  await page.getByRole("dialog", { name: "Designs" }).getByRole("button", { name: "Open" }).click();
  await expect(page.getByTestId("builder-canvas").getByRole("heading", { level: 1, name: "Saved leads" })).toBeVisible();
});

test("share link opens the same design", async ({ page, browser }) => {
  await template(page, "settings-section");
  await page.getByTestId("share").click();
  await expect(page.getByRole("status").filter({ hasText: "Share link copied" })).toBeVisible();
  const url = await clip(page);
  expect(url).toContain("#/builder?d=z.");
  // A different browser profile: nothing shared except the link.
  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  await other.goto(url);
  await expect(other.getByTestId("builder-canvas").getByText("Workspace details")).toBeVisible();
  await expect(other.getByRole("region", { name: "Generated code" })).toContainText("export default function WorkspaceSettings()");
  await expect.poll(() => other.url()).not.toContain("?d="); // token removed after loading
  // A share link opened in a tab that is already on the builder also loads
  await page.goto(url.replace("?d=", "?x=1&d="));
  await template(page, "blank-page");
  await page.evaluate((u) => (location.hash = new URL(u).hash), url);
  await expect(page.getByTestId("builder-canvas").getByText("Workspace details")).toBeVisible();
  await otherContext.close();
});

test("import: builder code restores exactly", async ({ page }) => {
  await template(page, "deal-page");
  await page.getByTestId("copy-builder-code").click();
  const copied = await clip(page);
  expect(copied).toContain("heigin-builder:v1:");
  await template(page, "blank-page");
  await page.getByRole("button", { name: "Import" }).click();
  await page.getByTestId("import-text").fill(copied);
  await page.getByTestId("run-import").click();
  await expect(page.getByRole("status").filter({ hasText: "exactly" })).toBeVisible();
  await expect(page.getByTestId("builder-canvas").getByRole("heading", { level: 1, name: "Kaveri Textiles — 40 looms" })).toBeVisible();
});

test("form block validates in interact mode", async ({ page }) => {
  await template(page, "lead-form-section");
  await expect(code(page)).toContainText("const handleSubmit = (event: FormEvent<HTMLFormElement>) => {");
  await page.getByTestId("preview-toggle").click();
  const canvas = page.getByTestId("builder-canvas");
  await canvas.getByRole("button", { name: "Create lead" }).click();
  await expect(canvas.getByText("Enter name")).toBeVisible();
  await expect(canvas.getByText("Enter source")).toBeVisible();
  await canvas.getByLabel(/^Name/).fill("Asha Rao");
  await canvas.getByLabel(/^Mobile/).fill("12345");
  await canvas.getByRole("button", { name: "Create lead" }).click();
  await expect(canvas.getByText("Enter a 10-digit Indian mobile number")).toBeVisible();
  await canvas.getByLabel(/^Mobile/).fill("9876543210");
  await canvas.getByLabel(/^Source/).selectOption("whatsapp");
  await canvas.getByRole("button", { name: "Create lead" }).click();
  await expect(canvas.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
});

test("list editor, dialog block and Next.js route export", async ({ page }) => {
  await template(page, "dashboard-page");
  await tree(page, "Activity timeline").click();
  const inspector = page.getByTestId("inspector");
  await inspector.getByRole("button", { name: "Add row" }).click();
  await inspector.getByLabel("What happened, row 5").fill("Payment received from Kaveri");
  await expect(page.getByTestId("builder-canvas").getByText("Payment received from Kaveri")).toBeVisible();

  // Dialog: inline preview in edit mode, real modal in interact mode
  await page.getByTestId("add-dialog").click();
  await expect(page.getByTestId("builder-canvas").getByText(/Dialog content — opens from the button/)).toBeVisible();
  await page.getByTestId("preview-toggle").click();
  await page.getByTestId("builder-canvas").getByRole("button", { name: "New lead" }).click();
  await expect(page.getByRole("dialog", { name: "Create lead" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByTestId("preview-toggle").click();

  await page.getByRole("tab", { name: "Next.js route" }).click();
  await page.getByTestId("copy-route-page").click();
  expect(await clip(page)).toContain("export default async function Page()");
});

test("sidebar template: sections, icon picker and copy", async ({ page }) => {
  await template(page, "sidebar-only");
  const canvas = page.getByTestId("builder-canvas");
  await expect(canvas.getByText("Sales")).toBeVisible();
  await expect(canvas.getByText("Workspace")).toBeVisible();
  await expect(code(page)).toContainText('label: "Sales"');
  await tree(page, "Sidebar").click();
  const inspector = page.getByTestId("inspector");
  await inspector.getByRole("combobox", { name: "Icon, row 2" }).selectOption("Phone");
  await expect(code(page)).toContainText("<Phone strokeWidth={1.6} />");
  await inspector.getByRole("button", { name: "Add row" }).click();
  await inspector.getByLabel("Label, row 5").fill("Reports");
  await expect(canvas.getByText("Reports")).toBeVisible();
});

test("handle stays grabbable at the top edge; grid items can span columns", async ({ page }) => {
  await template(page, "dashboard-page");
  await page.getByTestId("builder-canvas").getByRole("heading", { level: 1, name: "Dashboard" }).click();
  const handle = page.getByTestId("drag-handle");
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  const canvasBox = (await page.getByTestId("builder-canvas").boundingBox())!;
  expect(box!.y).toBeGreaterThanOrEqual(canvasBox.y); // not clipped by the canvas top edge

  await tree(page, "Card").click();
  await page.getByTestId("inspector").getByLabel("Column span").fill("2");
  await expect(code(page)).toContainText('gridColumn: "span 2"');
});
