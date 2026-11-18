import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { TypeMotion } from "./type-motion";
import { AgentThinking } from "../crm/agent-thinking";

describe("TypeMotion", () => {
  it("keeps the headline as one accessible heading", async () => {
    const { container } = render(<TypeMotion text={"Agents that\nship"} />);
    const heading = screen.getByRole("heading", { level: 1, name: "Agents that ship" });
    expect(heading.querySelectorAll("br")).toHaveLength(1);
    expect(heading.querySelector('[aria-hidden="true"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
  it("renders as the element it is given", () => {
    render(<TypeMotion text="Hello" as="p" />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByLabelText("Hello").tagName).toBe("P");
  });
});

describe("AgentThinking", () => {
  const steps = [
    { id: "read", label: "Reading 48 open deals" },
    { id: "search", label: "Searching activity", shape: "lens" as const },
  ];
  it("shows the loader, the steps and announces thinking once", async () => {
    const { container } = render(<AgentThinking prompt="Which deals are at risk?" steps={steps} status="thinking" seconds={3.2} />);
    expect(screen.getByRole("status")).toHaveTextContent("Thinking");
    expect(screen.getByRole("list", { name: "Steps" })).toHaveTextContent("Searching activity");
    expect(container.querySelector('[data-variant="orb"]')).not.toBeNull();
    expect(container.querySelector("section")).toHaveAttribute("aria-busy", "true");
    await expectNoAxeViolations(container);
  });
  it("folds the steps away when done and reopens them", async () => {
    const user = userEvent.setup();
    render(
      <AgentThinking steps={steps} status="done" seconds={9} loader="spinner">
        Three deals need attention.
      </AgentThinking>,
    );
    expect(screen.getByText("Three deals need attention.")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Thought for 9s" });
    expect(screen.queryByRole("list", { name: "Steps" })).toBeNull();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("list", { name: "Steps" })).toBeInTheDocument();
  });
});
