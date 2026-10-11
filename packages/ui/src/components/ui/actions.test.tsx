import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { Spinner } from "./spinner";

describe("Button", () => {
  it("renders a native button with type=button by default", () => {
    render(<Button>Create lead</Button>);
    const button = screen.getByRole("button", { name: "Create lead" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "primary");
  });

  it.each(["primary", "secondary", "ghost", "danger", "link"] as const)("applies the %s variant", (variant) => {
    render(<Button variant={variant}>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant);
  });

  it("calls onClick and is reachable by keyboard", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("blocks clicks and exposes aria-busy while loading, but stays focusable", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports submit buttons in forms", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Button leadingIcon={<Plus />}>Create lead</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button loading>Loading</Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("IconButton", () => {
  it("uses label as the accessible name", () => {
    render(<IconButton label="Add lead" icon={<Plus />} />);
    expect(screen.getByRole("button", { name: "Add lead" })).toBeInTheDocument();
  });
});

describe("Spinner", () => {
  it("announces a status by default and hides when decorative", () => {
    const { rerender } = render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    rerender(<Spinner label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
