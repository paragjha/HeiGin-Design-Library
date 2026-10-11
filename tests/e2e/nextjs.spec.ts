import { expect, test } from "@playwright/test";

test("Today (server-rendered) shows metrics and approvals work client-side", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Server render: content is in the initial HTML.
  const html = await (await page.request.get("/")).text();
  expect(html).toContain("₹2.31Cr");
  expect(html).toContain("Open pipeline");

  await page.goto("/");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText("Approved.")).toBeVisible();
  await expect(page.getByText(/demo — nothing was sent/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("Leads: filter, sort, select, row menu and validated dialog", async ({ page }) => {
  await page.goto("/leads");
  const table = page.getByRole("table", { name: "Leads" });
  await expect(table.getByRole("row")).toHaveCount(7); // header + 6 per page

  await page.getByRole("searchbox", { name: "Search leads" }).fill("kochi");
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(page.getByText("Showing 1 of 10")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search leads" }).press("Escape");

  await page.getByRole("button", { name: /^Hot/ }).click();
  await expect(page.getByText("Showing 4 of 10")).toBeVisible();

  await page.getByRole("checkbox", { name: "Select Neha Kapoor" }).click();
  await expect(page.getByRole("button", { name: "Export 1" })).toBeEnabled();

  await page.getByRole("button", { name: "Actions for Neha Kapoor" }).click();
  await page.getByRole("menuitem", { name: "Assign to me" }).click();
  await expect(page.getByText("Assigned Neha Kapoor to you (demo)")).toBeVisible();

  await page.getByRole("button", { name: "New lead" }).click();
  const dialog = page.getByRole("dialog", { name: "Create lead" });
  await dialog.getByRole("button", { name: "Create lead" }).click();
  await expect(dialog.getByText("Enter a 10-digit Indian mobile number")).toBeVisible();
  await dialog.getByLabel(/Name/).fill("Kiran Rao");
  await dialog.getByLabel(/Mobile/).fill("9876543210");
  await dialog.getByRole("combobox", { name: /Source/ }).click();
  await page.getByRole("option", { name: "WhatsApp" }).click();
  await dialog.getByRole("button", { name: "Create lead" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Kiran Rao was added to New (demo)")).toBeVisible();
  await page.screenshot({ path: "test-results/screens/nextjs-leads.png" });
});

test("Copied-source page renders local components", async ({ page }) => {
  await page.goto("/copied");
  await expect(page.getByText("Qualified")).toBeVisible();
  await page.getByRole("button", { name: "Copied Button" }).click();
  await expect(page.getByText("Clicked 1 times")).toBeVisible();
});
