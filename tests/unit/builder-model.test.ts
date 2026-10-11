import { describe, expect, it } from "vitest";
import { findParent, moveTo, node } from "../../apps/docs/src/builder/model";

const tree = () => {
  const a = node("text", { text: "a" });
  const b = node("text", { text: "b" });
  const c = node("text", { text: "c" });
  const inner = node("stack", {}, [node("text", { text: "x" })]);
  const root = node("page", {}, [a, b, c, inner]);
  return { root, a, b, c, inner };
};
const order = (r: ReturnType<typeof tree>["root"]) => r.children.map((n) => String(n.props.text ?? n.type));

describe("moveTo", () => {
  it("moves forward within the same parent (index refers to the pre-move list)", () => {
    const { root, a } = tree();
    expect(order(moveTo(root, a.id, root.id, 3))).toEqual(["b", "c", "a", "stack"]);
  });
  it("moves backward within the same parent", () => {
    const { root, c } = tree();
    expect(order(moveTo(root, c.id, root.id, 0))).toEqual(["c", "a", "b", "stack"]);
  });
  it("dropping a node next to itself is a no-op (same tree returned)", () => {
    const { root, b } = tree();
    expect(moveTo(root, b.id, root.id, 1)).toBe(root);
    expect(moveTo(root, b.id, root.id, 2)).toBe(root);
  });
  it("moves into another container", () => {
    const { root, a, inner } = tree();
    const next = moveTo(root, a.id, inner.id, 0);
    expect(findParent(next, a.id)?.parent.id).toBe(inner.id);
    expect(order(next)).toEqual(["b", "c", "stack"]);
  });
  it("refuses to move a container into itself or its descendants", () => {
    const { root, inner } = tree();
    expect(moveTo(root, inner.id, inner.id, 0)).toBe(root);
    expect(moveTo(root, inner.id, inner.children[0]!.id, 0)).toBe(root);
  });
});
