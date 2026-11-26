import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { StorageScanner, type StorageCategory } from "./storage-scanner";

const GB = 1e9;
const CATEGORIES: StorageCategory[] = [
  { id: "attachments", label: "Attachments", size: 52.6 * GB, color: "#4593f0", detail: "Quotes and contracts on 1,284 deals." },
  { id: "exports", label: "Exports", size: 46.8 * GB, color: "#f5822a" },
  { id: "trash", label: "Trash", size: 31.4 * GB, color: "#ec4a5e", detail: "Deleted records stay here for 30 days." },
];
const CAPACITY = 512 * GB;

describe("StorageScanner", () => {
  it("shows the total, each category and what's free, with the bar as a meter", async () => {
    const { container } = render(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="ready" />);
    expect(screen.getByText("130.8 GB")).toBeInTheDocument();
    expect(screen.getByText("381.2 GB available")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Storage used" })).toHaveAttribute("aria-valuetext", "130.8 GB of 512 GB used");
    expect(screen.getByRole("button", { name: "Exports 46.8 GB" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("130.8 GB of 512 GB used");
    expect(screen.getByText("Nothing worth clearing right now.")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("while scanning, names the work and the path, and holds Rescan without dropping its focus", async () => {
    const user = userEvent.setup();
    const onRescan = vi.fn();
    const { rerender } = render(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="ready" onRescan={onRescan} />);
    const rescan = screen.getByRole("button", { name: "Rescan" });
    rescan.focus();
    await user.keyboard("{Enter}");
    expect(onRescan).toHaveBeenCalledTimes(1);
    rerender(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="scanning" path="/attachments/northwind/rate-card.pdf" onRescan={onRescan} />);
    expect(rescan).toHaveFocus();
    expect(rescan).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    expect(onRescan).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Calculating");
    expect(screen.getByText("/attachments/northwind/rate-card.pdf")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Looking for things you can clear")).toBeInTheDocument();
  });

  it("shows a category's detail on focus and keeps it when picked", async () => {
    const user = userEvent.setup();
    render(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="ready" />);
    const trash = screen.getByRole("button", { name: "Trash 31.4 GB" });
    expect(trash).toHaveAccessibleDescription("Deleted records stay here for 30 days.");
    await user.tab();
    await user.tab();
    await user.tab();
    expect(trash).toHaveFocus();
    expect(screen.queryByText("381.2 GB available")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Attachments 52.6 GB" })).toHaveAttribute("data-dim");
    await user.keyboard("{Enter}");
    expect(trash).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    expect(trash).not.toHaveFocus();
    // Focus left the card, but the picked category still fills the line.
    expect(screen.getAllByText("Trash")).toHaveLength(2);
    expect(screen.queryByText("381.2 GB available")).not.toBeInTheDocument();
  });

  it("runs the suggestion, and ignores repeat clicks while clearing", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const suggestion = { message: "Old exports are using 46.8 GB.", actionLabel: "Delete old exports", onAction };
    const { rerender } = render(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="ready" suggestion={suggestion} />);
    await user.click(screen.getByRole("button", { name: "Delete old exports" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    rerender(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="clearing" activity="Deleting old exports" suggestion={suggestion} />);
    expect(screen.getByRole("status")).toHaveTextContent("Deleting old exports");
    const button = screen.getByRole("button", { name: "Delete old exports" });
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
    // The last suggestion is done: focus moves to the footer message, not the page.
    expect(button).toHaveFocus();
    rerender(<StorageScanner categories={CATEGORIES} capacity={CAPACITY} status="ready" />);
    expect(screen.getByText("Nothing worth clearing right now.").closest("p")).toHaveFocus();
  });
});
