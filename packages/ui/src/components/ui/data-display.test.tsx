import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { Avatar, getInitials } from "./avatar";
import { Badge } from "./badge";
import { Card, CardHeader } from "./card";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { Table, type SortState, type TableColumn } from "./table";
import { Tab, Tabs, TabsList, TabsPanel } from "./tabs";

interface Lead {
  id: string;
  name: string;
  value: number;
}
const leads: Lead[] = [
  { id: "l1", name: "Asha Rao", value: 120000 },
  { id: "l2", name: "Vikram Iyer", value: 45000 },
  { id: "l3", name: "Neha Kapoor", value: 980000 },
];
const columns: TableColumn<Lead>[] = [
  { id: "name", header: "Name", sortable: true },
  { id: "value", header: "Value", align: "end", numeric: true, sortable: true, cell: (r) => `₹${r.value}` },
];

describe("Table", () => {
  it("renders rows with an accessible caption", () => {
    render(<Table caption="Leads" columns={columns} rows={leads} getRowId={(r) => r.id} />);
    const table = screen.getByRole("table", { name: "Leads" });
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("₹980000")).toBeInTheDocument();
  });

  it("shows skeleton rows and aria-busy while loading", () => {
    render(<Table caption="Leads" columns={columns} rows={[]} getRowId={(r) => r.id} loading loadingRows={3} />);
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("aria-busy", "true");
    expect(within(table).getAllByRole("row")).toHaveLength(4);
  });

  it("shows the empty slot when there are no rows", () => {
    render(
      <Table caption="Leads" columns={columns} rows={[]} getRowId={(r) => r.id} empty={<EmptyState title="No leads yet" />} />,
    );
    expect(screen.getByText("No leads yet")).toBeInTheDocument();
  });

  it("selects rows and toggles all", async () => {
    function Harness() {
      const [selected, setSelected] = React.useState<Set<string>>(new Set());
      return (
        <>
          <Table
            caption="Leads"
            columns={columns}
            rows={leads}
            getRowId={(r) => r.id}
            selectedIds={selected}
            onSelectionChange={setSelected}
            getRowLabel={(r) => `Select ${r.name}`}
          />
          <output>{selected.size}</output>
        </>
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Asha Rao" }));
    expect(screen.getByRole("status")).toHaveTextContent("1");
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.getByRole("status")).toHaveTextContent("0");
  });

  it("cycles sort asc -> desc -> none and sets aria-sort", async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <Table caption="Leads" columns={columns} rows={leads} getRowId={(r) => r.id} sort={null} onSortChange={onSortChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Value" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "value", direction: "asc" });
    const asc: SortState = { columnId: "value", direction: "asc" };
    rerender(<Table caption="Leads" columns={columns} rows={leads} getRowId={(r) => r.id} sort={asc} onSortChange={onSortChange} />);
    expect(screen.getByRole("columnheader", { name: "Value" })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: "Value" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "value", direction: "desc" });
  });

  it("calls onRowClick but not when clicking the checkbox", async () => {
    const onRowClick = vi.fn();
    render(
      <Table
        caption="Leads"
        columns={columns}
        rows={leads}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        selectedIds={new Set()}
        onSelectionChange={() => {}}
        getRowLabel={(r) => `Select ${r.name}`}
      />,
    );
    await userEvent.click(screen.getByText("Vikram Iyer"));
    expect(onRowClick).toHaveBeenCalledWith(leads[1]);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Asha Rao" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Table caption="Leads" columns={columns} rows={leads} getRowId={(r) => r.id} selectedIds={new Set()} onSelectionChange={() => {}} getRowLabel={(r) => `Select ${r.name}`} />,
    );
    await expectNoAxeViolations(container);
  });
});

describe("Pagination", () => {
  it("shows the range and disables at the ends", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageSize={20} totalItems={134} onPageChange={onPageChange} />);
    expect(screen.getByText("1–20 of 134")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("Tabs", () => {
  it("switches panels with click and arrow keys", async () => {
    render(
      <Tabs defaultValue="activity">
        <TabsList>
          <Tab value="activity">Activity</Tab>
          <Tab value="notes" count={3}>
            Notes
          </Tab>
        </TabsList>
        <TabsPanel value="activity">Activity panel</TabsPanel>
        <TabsPanel value="notes">Notes panel</TabsPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Activity panel")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /Notes/ }));
    expect(screen.getByRole("tab", { name: /Notes/ })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(screen.getByText("Notes panel")).toBeVisible());
    await waitFor(() => expect(screen.queryByText("Activity panel")).toBeNull());
    screen.getByRole("tab", { name: /Notes/ }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
  });
});

describe("Avatar, Badge, Card", () => {
  it("derives initials", () => {
    expect(getInitials("Asha Rao")).toBe("AR");
    expect(getInitials("  northwind ")).toBe("N");
    expect(getInitials("Kiran Kumar Reddy")).toBe("KR");
    expect(getInitials("")).toBe("?");
  });

  it("avatar is an image with the person's name unless decorative", () => {
    const { rerender } = render(<Avatar name="Asha Rao" />);
    expect(screen.getByRole("img", { name: "Asha Rao" })).toHaveTextContent("AR");
    rerender(<Avatar name="Asha Rao" decorative />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("badge and card render content", async () => {
    const { container } = render(
      <Card>
        <CardHeader title="Pipeline" description="This month" actions={<Badge tone="success" dot>On track</Badge>} />
        Body
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Pipeline", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("On track")).toHaveAttribute("data-tone", "success");
    await expectNoAxeViolations(container);
  });
});
