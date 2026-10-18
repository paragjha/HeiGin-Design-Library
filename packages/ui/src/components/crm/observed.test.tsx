import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Layers } from "lucide-react";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { DetailList } from "./detail-list";
import { MetricCard, MetricGroup } from "./metric-card";


describe("DetailList", () => {
  it("renders label/value pairs as a description list", async () => {
    const { container } = render(
      <DetailList
        items={[
          { label: "Stage", value: "New Enquiry", icon: <Layers /> },
          { label: "Owner", value: "Meera S" },
        ]}
      />,
    );
    const dl = container.querySelector("dl")!;
    expect(within(dl).getByText("Stage").tagName).toBe("DT");
    expect(within(dl).getByText("New Enquiry").tagName).toBe("DD");
    await expectNoAxeViolations(container);
  });
});

describe("MetricGroup", () => {
  it("is a labelled region of metric cells", async () => {
    const { container } = render(
      <MetricGroup label="Pipeline summary" columns={5}>
        <MetricCard label="Open pipeline" value="₹10.1L" hint="12 open deals" />
        <MetricCard label="Overdue tasks" value="3" tone="danger" hint="Needs follow-up" />
      </MetricGroup>,
    );
    const region = screen.getByRole("region", { name: "Pipeline summary" });
    expect(within(region).getByText("₹10.1L")).toBeInTheDocument();
    expect(region.style.getPropertyValue("--metric-columns")).toBe("5");
    await expectNoAxeViolations(container);
  });
});
