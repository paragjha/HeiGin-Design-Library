import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { AppSidebar, type AppSidebarProps } from "./app-sidebar";

const icon = <svg />;
const props = (over: Partial<AppSidebarProps> = {}): AppSidebarProps => ({
  rail: [[{ label: "Sales", href: "/sales", icon }, { label: "Files", href: "/files", icon }]],
  railFooter: [{ label: "Settings", href: "/settings", icon }],
  currentRail: "/sales",
  currentHref: "/sales/pipeline",
  groups: [
    { items: [{ label: "Pipeline", href: "/sales/pipeline", icon }] },
    {
      label: "Outreach",
      items: [{ label: "Campaigns", href: "/sales/campaigns", icon, onAdd: () => {}, addLabel: "New campaign", children: [{ label: "Drafts", href: "/sales/drafts", count: 10 }, { label: "Sent", href: "/sales/sent", count: 0 }] }],
    },
  ],
  ...over,
});

describe("AppSidebar", () => {
  it("names both landmarks and marks the current area and page", async () => {
    const { container } = render(<AppSidebar {...props()} />);
    const rail = screen.getByRole("navigation", { name: "Areas" });
    const panel = screen.getByRole("navigation", { name: "Main" });
    expect(within(rail).getByRole("link", { name: "Sales" })).toHaveAttribute("aria-current", "page");
    expect(within(rail).getByRole("link", { name: "Files" })).not.toHaveAttribute("aria-current");
    expect(within(panel).getByRole("link", { name: "Pipeline" })).toHaveAttribute("aria-current", "page");
    expect(within(panel).getByRole("link", { name: "Drafts 10" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Sent" })).toBeInTheDocument(); // a 0 count is hidden
    await expectNoAxeViolations(container);
  });

  it("puts the + action in its own named button", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AppSidebar {...props({ groups: [{ items: [{ label: "Pages", href: "/pages", onAdd }] }] })} />);
    const add = screen.getByRole("button", { name: "New in Pages" });
    expect(screen.getByRole("link", { name: "Pages" })).not.toContainElement(add);
    await user.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("collapses the panel to the rail and makes it inert", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(<AppSidebar {...props({ onCollapsedChange })} />);
    const toggle = screen.getByRole("button", { name: "Navigation panel" });
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("inert");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("inert");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(toggle).toHaveFocus();
  });

  it("renders links through renderLink, rail ones included", () => {
    const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>((p, ref) => <a ref={ref} data-router="" {...p} />);
    render(<AppSidebar {...props({ renderLink: (p) => <Link {...p} /> })} />);
    expect(screen.getByRole("link", { name: "Files" })).toHaveAttribute("data-router");
    expect(screen.getByRole("link", { name: "Pipeline" })).toHaveAttribute("data-router");
  });
});
