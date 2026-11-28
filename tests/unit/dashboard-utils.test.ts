import { describe, expect, it } from "vitest";
import { fill, visibleTasks } from "../../templates/dashboard/lib/dashboard-utils";
import type { DashboardTask } from "../../templates/dashboard/lib/dashboard-config";

const task = (id: string, title: string, priority: number): DashboardTask => ({ id, title, priority, dot: "blue", tags: [] });
const TASKS = [task("a", "Pipeline review", 2), task("b", "Send Kaveri the quote", 1), task("c", "Kaveri usage check", 3)];

describe("visibleTasks", () => {
  it("keeps the config order until prioritized", () => {
    expect(visibleTasks(TASKS, "", false).map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(visibleTasks(TASKS, "", true).map((t) => t.id)).toEqual(["b", "a", "c"]);
  });
  it("matches the query in any case, ignoring outer spaces, and doesn't reorder the input", () => {
    expect(visibleTasks(TASKS, "  KAVERI ", true).map((t) => t.id)).toEqual(["b", "c"]);
    expect(TASKS.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(visibleTasks(TASKS, "nothing", false)).toEqual([]);
  });
});

describe("fill", () => {
  it("replaces known keys and leaves unknown ones", () => {
    expect(fill("Welcome, {firstName}! {x}", { firstName: "Asha" })).toBe("Welcome, Asha! {x}");
  });
});
