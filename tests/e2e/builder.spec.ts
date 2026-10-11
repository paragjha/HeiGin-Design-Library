import { expect, test, type Page } from "@playwright/test";

const code = (page: Page) => page.getByRole("region", { name: "Generated code" });

test.beforeEach(async ({ page }) => {
  await page.goto("/#/builder");
  await page.evaluate(() => localStorage.removeItem("hg-builder-v1"));
  await page.reload();
});

test.describe("builder", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("select, edit, undo, add, delete and copy", async ({ page }) => {
    const canvas = page.getByTestId("builder-canvas");
    await expect(canvas.getByRole("heading", { level: 1, name: "Leads" })).toBeVisible();
    await expect(code(page)).toContainText("export default function LeadsPage()");

    // Select by clicking the canvas, edit in the inspector, see canvas + code update
    await canvas.getByRole("heading", { level: 1, name: "Leads" }).click();
    const inspector = page.getByTestId("inspector");
    await expect(inspector).toContainText("Page header");
    await inspector.getByLabel("Title").fill("Customers");
    await expect(canvas.getByRole("heading", { level: 1, name: "Customers" })).toBeVisible();
    await expect(code(page)).toContainText('title="Customers"');

    // One undo step reverts the whole edit
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(canvas.getByRole("heading", { level: 1, name: "Leads" })).toBeVisible();

    // Page header only accepts buttons, so a Badge lands after it in the page
    await canvas.getByRole("heading", { level: 1, name: "Leads" }).click();
    await page.getByTestId("add-badge").click();
    await expect(page.getByRole("status").filter({ hasText: "Added Badge" })).toBeVisible();
    await expect(code(page)).toContainText('<Badge tone="success" dot>Qualified</Badge>');

    // Delete with the keyboard while the canvas has focus context
    await page.getByTestId("inspector").getByRole("button", { name: "Delete (Del)" }).click();
    await expect(code(page)).not.toContainText("<Badge");

    // Copy code puts the full file on the clipboard
    await page.getByTestId("copy-builder-code").click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip.startsWith('"use client";')).toBe(true);
    expect(clip).toContain("export default function LeadsPage()");

    // Autosave survives a reload
    await canvas.getByRole("heading", { level: 1, name: "Leads" }).click();
    await page.getByTestId("inspector").getByLabel("Title").fill("Saved title");
    await page.reload();
    await expect(page.getByTestId("builder-canvas").getByRole("heading", { level: 1, name: "Saved title" })).toBeVisible();
  });

  test("edit mode blocks interaction, interact mode allows it", async ({ page }) => {
    const canvas = page.getByTestId("builder-canvas");
    await expect(canvas.getByText("1–5 of 8")).toBeVisible();
    await canvas.getByRole("button", { name: "Next page" }).click();
    await expect(canvas.getByText("1–5 of 8")).toBeVisible(); // edit mode: click only selects
    await page.getByTestId("preview-toggle").click();
    await canvas.getByRole("button", { name: "Next page" }).click();
    await expect(canvas.getByText("6–8 of 8")).toBeVisible();
  });

  test("templates switch build mode and client/server output", async ({ page }) => {
    await page.getByLabel("Start from template").selectOption("settings-section");
    await expect(code(page)).toContainText("export default function WorkspaceSettings()");
    await expect(code(page)).not.toContainText("use client");
    await expect(page.getByText("Server-component safe.")).toBeVisible();
    await page.getByLabel("Start from template").selectOption("component");
    await expect(code(page)).toContainText("<ApprovalCard");
    await page.screenshot({ path: "test-results/screens/builder-component.png" });
    await page.getByLabel("Start from template").selectOption("dashboard-page");
    await expect(page.getByTestId("builder-canvas").getByRole("region", { name: "Pipeline summary" })).toBeVisible();
    await page.getByTestId("builder-canvas").getByText("Win rate").click();
    await page.screenshot({ path: "test-results/screens/builder-dashboard.png" });
  });
});
