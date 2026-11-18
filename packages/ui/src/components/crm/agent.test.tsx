import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { Loader } from "../ui/loader";
import { HeiGinMark } from "../ui/heigin-mark";
import { AgentTaskTrail, type AgentStep } from "./agent-task-trail";
import { AgentDecisionTree, type AgentDecision } from "./agent-decision-tree";

const decision: AgentDecision = {
  id: "incident",
  agent: { name: "Incident agent", model: "Claude Opus 5.5" },
  risk: "high",
  question: "Checkout errors jumped to 18% – what should I do?",
  recommended: "rollback",
  branches: [
    { id: "rollback", label: "Roll back to #481", question: "Tell customers about it?", options: [
      { id: "status", label: "Post on the status page", detail: "Public" },
      { id: "team", label: "Only tell the team", detail: "#incidents only", note: { text: "Legal asked for public notes on outages." } },
    ] },
    { id: "flag", label: "Turn the flag off", outcome: "New checkout off for 30%" },
  ],
};

const steps: AgentStep[] = [
  { id: "read", label: "Read the bug report", status: "done", seconds: 8, substeps: [{ label: "Opened ENG-2291", meta: "Linear" }] },
  { id: "patch", label: "Patch the checkout form", status: "active", activity: "Editing", seconds: 21, substeps: [{ label: "Found the empty-cart case", meta: "cart.ts:142" }] },
  { id: "note", label: "Write the release note", status: "pending" },
  { id: "pr", label: "Open a pull request", status: "approval", approval: { description: "Open PR #482 against main." } },
];

describe("Loader", () => {
  it("renders the orb by default with a status role", () => {
    render(<Loader label="Thinking" />);
    const el = screen.getByRole("status", { name: "Thinking" });
    expect(el).toHaveAttribute("data-variant", "orb");
  });
  it("renders a spinner when asked", () => {
    render(<Loader variant="spinner" label="Saving" />);
    expect(screen.getByRole("status", { name: "Saving" })).not.toHaveAttribute("data-variant", "orb");
  });
  it("is hidden from assistive tech when label is null", () => {
    const { container } = render(<Loader label={null} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("HeiGinMark", () => {
  it("is decorative without a title and named with one", () => {
    const { container, rerender } = render(<HeiGinMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    rerender(<HeiGinMark title="HeiGin" />);
    expect(screen.getByRole("img", { name: "HeiGin" })).toBeInTheDocument();
  });
});

describe("AgentTaskTrail", () => {
  it("shows progress, status text and the running activity", async () => {
    const { container } = render(<AgentTaskTrail title="Fix the checkout crash" steps={steps} />);
    expect(screen.getByRole("heading", { name: "Fix the checkout crash" })).toBeInTheDocument();
    expect(screen.getByText("1/4")).toBeInTheDocument();
    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByText(/, in progress/)).toBeInTheDocument();
    expect(screen.getByText("HeiGin Agent")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("opens and closes a finished step's sub-steps", async () => {
    const user = userEvent.setup();
    render(<AgentTaskTrail title="Trail" steps={steps} />);
    const toggle = screen.getByRole("button", { name: /Read the bug report/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("asks for approval and reports the decision", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const onDecline = vi.fn();
    const waiting = steps.map((s) => (s.id === "pr" ? { ...s, status: "waiting" as const } : s));
    render(<AgentTaskTrail title="Trail" steps={waiting} onApprove={onApprove} onDecline={onDecline} />);
    expect(screen.getByRole("status")).toHaveTextContent("Open a pull request: needs your approval");
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledWith(expect.objectContaining({ id: "pr" }));
    await user.click(screen.getByRole("button", { name: "Decline" }));
    expect(onDecline).toHaveBeenCalled();
  });

  it("uses a spinner on the running step when loader is spinner", () => {
    const { container } = render(<AgentTaskTrail title="Trail" steps={steps} loader="spinner" />);
    expect(container.querySelector('[data-status="active"] [data-variant="orb"]')).toBeNull();
    expect(container.querySelector('[data-status="active"] [data-size="sm"]')).not.toBeNull();
  });
});

describe("AgentDecisionTree", () => {
  it("shows the question, the branches and the agent's pick without axe violations", async () => {
    const { container } = render(<AgentDecisionTree decisions={[decision]} onDecide={() => {}} />);
    expect(screen.getByRole("article", { name: /Checkout errors jumped/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Roll back to #481/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Agent’s pick")).toBeInTheDocument();
    expect(screen.getByText("1 waiting for you")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("only takes number keys while focus is inside it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <AgentDecisionTree decisions={[decision]} onDecide={() => {}} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Outside" }));
    await user.keyboard("1");
    expect(screen.getByRole("button", { name: /Roll back to #481/ })).toHaveAttribute("aria-expanded", "false");
    screen.getByRole("button", { name: /Turn the flag off/ }).focus();
    await user.keyboard("1");
    expect(screen.getByRole("button", { name: /Roll back to #481/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("commits an option and links the agent's note", async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn();
    render(<AgentDecisionTree decisions={[decision]} onDecide={onDecide} />);
    await user.click(screen.getByRole("button", { name: /Roll back to #481/ }));
    const team = screen.getByRole("button", { name: /Only tell the team/ });
    expect(team).toHaveAccessibleDescription(/Legal asked for public notes/);
    await user.click(team);
    expect(onDecide).toHaveBeenCalledWith(decision, expect.objectContaining({ kind: "option", option: expect.objectContaining({ id: "team" }) }));
  });

  it("sends an Other… instruction and shows the agent's reply", async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn().mockResolvedValue("On it – holding the deploy.");
    render(<AgentDecisionTree decisions={[decision]} onDecide={onDecide} />);
    await user.click(screen.getByRole("button", { name: /Other/ }));
    await user.type(screen.getByLabelText(/what to do instead/), "Hold it{Enter}");
    expect(onDecide).toHaveBeenCalledWith(decision, { kind: "other", text: "Hold it" });
    expect(await screen.findByText("On it – holding the deploy.")).toBeInTheDocument();
  });
});
