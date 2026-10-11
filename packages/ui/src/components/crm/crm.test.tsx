import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Phone } from "lucide-react";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { formatINR, formatINRCompact } from "../../lib/format";
import { ActivityItem, ActivityTimeline } from "./activity-timeline";
import { ApprovalCard } from "./approval-card";
import { ChannelMark } from "./channel-mark";
import { ConversationListItem } from "./conversation-list-item";
import { DealStage } from "./deal-stage";
import { FilterChip } from "./filter-chip";
import { FilterToolbar } from "./filter-toolbar";
import { MetricCard } from "./metric-card";
import { MoneyValue } from "./money-value";
import { PageHeader } from "./page-header";
import { RecordHeader } from "./record-header";
import { SidebarNav } from "./sidebar-nav";
import { SLAClock } from "./sla-clock";
import { StatusBadge } from "./status-badge";
import { TaskRow } from "./task-row";
import { TrustRungBadge } from "./trust-rung-badge";

describe("format", () => {
  it("formats INR with Indian grouping", () => {
    expect(formatINR(849600)).toBe("₹8,49,600");
    expect(formatINR(1234.5, true)).toBe("₹1,234.50");
  });
  it("formats compact lakh/crore", () => {
    expect(formatINRCompact(849600)).toBe("₹8.5 L");
    expect(formatINRCompact(23100000)).toBe("₹2.31 Cr");
    expect(formatINRCompact(64000)).toBe("₹64K");
    expect(formatINRCompact(950)).toBe("₹950");
    expect(formatINRCompact(-150000)).toBe("-₹1.5 L");
  });
});

describe("MoneyValue / MetricCard / PageHeader", () => {
  it("compact money keeps the full value for assistive tech", () => {
    render(<MoneyValue amount={849600} format="compact" />);
    expect(screen.getByText("₹8,49,600")).toBeInTheDocument();
    expect(screen.getByTitle("₹8,49,600")).toBeInTheDocument();
  });

  it("metric card shows label, value and trend words", async () => {
    const { container } = render(
      <MetricCard label="Pipeline" value={<MoneyValue amount={2310000} />} trend={{ direction: "up", label: "12%" }} hint="vs last month" />,
    );
    expect(screen.getByText("Pipeline")).toBeInTheDocument();
    expect(screen.getByText("₹23,10,000")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("page header renders an h1", () => {
    render(<PageHeader title="Leads" description="61 open" actions={<button>New</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Leads" })).toBeInTheDocument();
  });
});

describe("StatusBadge / SLAClock / TrustRungBadge / ChannelMark", () => {
  it("status badge resolves registry labels", () => {
    render(<StatusBadge status="awaiting_approval" />);
    expect(screen.getByText("Awaiting approval")).toHaveAttribute("data-tone", "warning");
  });

  it("SLA clock announces state word even when hidden", () => {
    render(<SLAClock state="breached" time="20m over" />);
    expect(screen.getByText("Breached:")).toBeInTheDocument();
    expect(screen.getByText("20m over")).toBeInTheDocument();
  });

  it("trust rung uses canonical labels", () => {
    render(<TrustRungBadge rung={2} />);
    expect(screen.getByText("R2 · Act with review")).toHaveAttribute("title", "Does the action; a human reviews after, with undo.");
  });

  it("icon-only channel mark keeps an accessible name", () => {
    render(<ChannelMark channel="whatsapp" display="icon" />);
    expect(screen.getByRole("img", { name: "WhatsApp" })).toBeInTheDocument();
  });
});

describe("ApprovalCard", () => {
  it("approves, shows outcome and undoes", async () => {
    const onApprove = vi.fn();
    const onUndo = vi.fn();
    render(
      <ApprovalCard
        title="Apply 12% discount to Q-1042"
        reason="Customer is a repeat buyer above ₹10 L annual spend."
        requestedBy="Meera S"
        changes={[{ field: "Discount", from: "5%", to: "12%" }]}
        onApprove={onApprove}
        onReject={vi.fn()}
        onUndo={onUndo}
      />,
    );
    const card = screen.getByRole("article", { name: "Apply 12% discount to Q-1042" });
    expect(within(card).getByText("12%")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(await screen.findByRole("status")).toHaveTextContent("Approved.");
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("warns when the action is irreversible and has no axe violations", async () => {
    const { container } = render(
      <ApprovalCard title="Send WhatsApp reminder" reason="Invoice 30 days overdue" requestedBy="Agent" rung={1} undoable={false} onApprove={vi.fn()} onReject={vi.fn()} />,
    );
    expect(screen.getByText("This can't be undone once approved.")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe("TaskRow / ConversationListItem / ActivityTimeline", () => {
  it("task row toggles done", async () => {
    function Harness() {
      const [done, setDone] = React.useState(false);
      return (
        <ul>
          <TaskRow title="Call Asha about revised quote" due="Today, 4 pm" overdue done={done} onDoneChange={setDone} />
        </ul>
      );
    }
    render(<Harness />);
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: 'Mark "Call Asha about revised quote" as done' }));
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText(/Overdue/)).toBeNull();
  });

  it("conversation item exposes unread count in the link name", async () => {
    const { container } = render(
      <ul>
        <ConversationListItem name="Asha Rao" preview="Can you share the GST invoice?" channel="whatsapp" timeLabel="10:42 am" dateTime="2026-10-11T10:42" unreadCount={2} href="#t1" />
      </ul>,
    );
    expect(screen.getByRole("link", { name: "Asha Rao, 2 unread" })).toHaveAttribute("href", "#t1");
    await expectNoAxeViolations(container);
  });

  it("timeline is an ordered, labelled list with time elements", () => {
    render(
      <ActivityTimeline label="Activity for Asha Rao">
        <ActivityItem icon={<Phone />} dateTime="2026-10-11T14:40" timeLabel="2:40 pm">
          Meera S called Asha Rao
        </ActivityItem>
      </ActivityTimeline>,
    );
    const list = screen.getByRole("list", { name: "Activity for Asha Rao" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getByText("2:40 pm").tagName).toBe("TIME");
  });
});

describe("FilterChip / FilterToolbar", () => {
  it("toggle chip uses aria-pressed; removable chip has a named remove button", async () => {
    const onRemove = vi.fn();
    function Harness() {
      const [hot, setHot] = React.useState(false);
      return (
        <>
          <FilterChip pressed={hot} onPressedChange={setHot} count={8}>
            Hot
          </FilterChip>
          <FilterChip onRemove={onRemove}>Owner: Meera S</FilterChip>
        </>
      );
    }
    render(<Harness />);
    const hot = screen.getByRole("button", { name: /Hot/ });
    expect(hot).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(hot);
    expect(hot).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Remove filter: Owner: Meera S" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("toolbar exposes a search landmark and scope", async () => {
    function Harness() {
      const [q, setQ] = React.useState("");
      return <FilterToolbar query={q} onQueryChange={setQ} searchLabel="Search leads" scope={`Showing ${q ? 1 : 24} of 61`} />;
    }
    render(<Harness />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search leads" }), "asha");
    await waitFor(() => expect(screen.getByText("Showing 1 of 61")).toBeInTheDocument());
  });
});

describe("RecordHeader / DealStage / SidebarNav", () => {
  it("record header has breadcrumb nav and h1", async () => {
    const { container } = render(
      <RecordHeader name="Kaveri Textiles" breadcrumbs={[{ label: "Accounts", href: "#/accounts" }, { label: "Kaveri Textiles" }]} meta={["Coimbatore", "Owner: Meera S"]} />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Kaveri Textiles" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("deal stage describes the position in words", () => {
    render(<DealStage stages={["New", "Qualified", "Proposal", "Negotiation", "Won"]} current="Proposal" />);
    expect(screen.getByRole("list", { name: "Stage 3 of 5: Proposal" })).toBeInTheDocument();
    expect(screen.getByText("Proposal").closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("sidebar nav marks the current page and supports custom links", () => {
    render(
      <SidebarNav
        currentHref="/leads"
        groups={[{ items: [{ label: "Today", href: "/today" }, { label: "Leads", href: "/leads", count: 7 }] }, { label: "Money", items: [{ label: "Quotes", href: "/quotes" }] }]}
        renderLink={(props) => <a data-custom="" {...props} />}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: /Leads/ })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Today" })).toHaveAttribute("data-custom");
    expect(within(nav).getByRole("list", { name: "Money" })).toBeInTheDocument();
  });
});
