import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "./drawer";
import { AlertDialog } from "./alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip } from "./tooltip";
import { ToastProvider, useToast } from "./toast";

describe("Dialog", () => {
  function Example() {
    return (
      <Dialog>
        <DialogTrigger render={<Button />}>New lead</DialogTrigger>
        <DialogContent
          title="Create lead"
          description="Add a lead to your pipeline."
          footer={<DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>}
        >
          <input aria-label="Name" />
        </DialogContent>
      </Dialog>
    );
  }

  it("opens, is labelled, closes on Escape and returns focus to the trigger", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "New lead" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Create lead" });
    expect(dialog).toHaveAccessibleDescription("Add a lead to your pipeline.");
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes from the footer and the close button", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "New lead" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await userEvent.click(screen.getByRole("button", { name: "New lead" }));
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("has no axe violations when open", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "New lead" }));
    const dialog = await screen.findByRole("dialog");
    await expectNoAxeViolations(dialog);
  });
});

describe("Drawer", () => {
  it("opens as a labelled dialog from the right", async () => {
    render(
      <Drawer>
        <DrawerTrigger render={<Button />}>Open details</DrawerTrigger>
        <DrawerContent title="Lead details">Body</DrawerContent>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open details" }));
    const drawer = await screen.findByRole("dialog", { name: "Lead details" });
    expect(drawer).toHaveAttribute("data-side", "right");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("AlertDialog", () => {
  it("focuses Cancel first and runs onConfirm", async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog
        trigger={<Button variant="danger">Delete quote</Button>}
        title="Delete quote Q-1042?"
        description="This cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onConfirm}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete quote" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete quote Q-1042?" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });

  it("stays open and shows loading while an async confirm runs", async () => {
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<AlertDialog defaultOpen title="Approve discount?" description="12% off" confirmLabel="Approve" onConfirm={onConfirm} />);
    const approve = await screen.findByRole("button", { name: "Approve" });
    await userEvent.click(approve);
    expect(approve).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    resolve();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
});

describe("DropdownMenu", () => {
  it("opens with keyboard, moves with arrows and selects with Enter", async () => {
    const onAssign = vi.fn();
    const onArchive = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onAssign}>Assign owner</DropdownMenuItem>
          <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Assign owner" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onArchive).toHaveBeenCalledOnce();
    expect(onAssign).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("Popover and Tooltip", () => {
  it("popover opens and closes on Escape", async () => {
    render(
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>Filters</PopoverTrigger>
        <PopoverContent title="Filter leads">
          <button type="button">Apply</button>
        </PopoverContent>
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(await screen.findByRole("dialog", { name: "Filter leads" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("tooltip appears on keyboard focus", async () => {
    render(
      <Tooltip content="Shortcut: N" delay={0}>
        <Button>New</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(await screen.findByText("Shortcut: N")).toBeInTheDocument();
  });
});

describe("Toast", () => {
  function Trigger() {
    const { toast } = useToast();
    return (
      <Button onClick={() => toast({ title: "Lead created", description: "Asha Rao added to New", tone: "success", timeout: 0 })}>
        Notify
      </Button>
    );
  }

  it("shows a toast and dismisses it", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(await screen.findByText("Lead created")).toBeInTheDocument();
    expect(screen.getByText("Asha Rao added to New")).toBeInTheDocument();
    // Base UI keeps Close aria-hidden until the viewport is focused (F6) or hovered; it is still clickable.
    await userEvent.click(screen.getByLabelText("Dismiss notification"));
    await waitFor(() => expect(screen.queryByText("Lead created")).toBeNull());
  });
});

// Keep React import used for JSX in older tooling.
void React;
