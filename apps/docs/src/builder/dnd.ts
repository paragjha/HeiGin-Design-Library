// Drag-and-drop geometry for the builder canvas and outline (native HTML5 DnD, no dependency).
import { canAccept } from "./blocks";
import { findNode, findParent, isWithin, type BuilderNode } from "./model";

export type DragPayload =
  | { kind: "new"; type: string }
  | { kind: "saved"; type: string; node: BuilderNode }
  | { kind: "move"; id: string; type: string };

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DropTarget {
  parentId: string;
  index: number;
  /** Where to draw the insertion line (canvas content coordinates). */
  line: Box;
  /** Empty container: highlight it instead of drawing a line. */
  inside?: Box;
}

/** Bounding box of a display:contents wrapper (union of its element children), in canvas coordinates. */
export function boxOf(wrapper: Element, container: Element): Box | null {
  const rects = [...wrapper.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width || r.height);
  if (!rects.length) return null;
  const c = container.getBoundingClientRect();
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { left: left - c.left + container.scrollLeft, top: top - c.top + container.scrollTop, width: right - left, height: bottom - top };
}

const boxFor = (canvas: HTMLElement, id: string) => {
  const w = canvas.querySelector(`[data-node-id="${id}"]`);
  return w ? boxOf(w, canvas) : null;
};

/** Main axis children flow along inside a container. */
export function axisOf(n: BuilderNode): "x" | "y" {
  if (n.type === "stack") return n.props.direction === "row" ? "x" : "y";
  return n.type === "pageHeader" || n.type === "metricGroup" || n.type === "grid" ? "x" : "y";
}

/** A payload may land in `parent` if the parent accepts the type and is not the dragged node or inside it. */
export function canDropInto(root: BuilderNode, payload: DragPayload, parent: BuilderNode): boolean {
  if (!canAccept(parent.type, payload.type)) return false;
  return payload.kind !== "move" || !isWithin(root, payload.id, parent.id);
}

function edgeLine(box: Box, axis: "x" | "y", after: boolean): Box {
  return axis === "x"
    ? { left: (after ? box.left + box.width : box.left) - 2, top: box.top, width: 3, height: box.height }
    : { left: box.left, top: (after ? box.top + box.height : box.top) - 2, width: box.width, height: 3 };
}

function dropInside(canvas: HTMLElement, container: BuilderNode, px: number, py: number): DropTarget | null {
  const own = boxFor(canvas, container.id);
  if (!own) return null;
  const kids = container.children.map((c) => ({ c, box: boxFor(canvas, c.id) })).filter((k): k is { c: BuilderNode; box: Box } => !!k.box);
  if (!kids.length) {
    const inset = { left: own.left + 4, top: own.top + 4, width: Math.max(own.width - 8, 8), height: Math.max(own.height - 8, 8) };
    return { parentId: container.id, index: 0, line: inset, inside: inset };
  }
  const axis = axisOf(container);
  // For wrapping rows (grid), only compare against children on the pointer's row.
  const row = axis === "x" ? kids.filter((k) => py >= k.box.top && py <= k.box.top + k.box.height) : kids;
  const pool = row.length ? row : kids;
  const before = pool.find((k) => (axis === "x" ? px < k.box.left + k.box.width / 2 : py < k.box.top + k.box.height / 2));
  if (before) return { parentId: container.id, index: container.children.indexOf(before.c), line: edgeLine(before.box, axis, false) };
  const last = pool[pool.length - 1]!;
  return { parentId: container.id, index: container.children.indexOf(last.c) + 1, line: edgeLine(last.box, axis, true) };
}

/** Resolves where a drop at client point (x, y) would land on the canvas, or null when it can't. */
export function computeCanvasDrop(canvas: HTMLElement, root: BuilderNode, payload: DragPayload, x: number, y: number): DropTarget | null {
  const hit = document.elementFromPoint(x, y);
  if (!hit || !canvas.contains(hit)) return null;
  const rect = canvas.getBoundingClientRect();
  const px = x - rect.left + canvas.scrollLeft;
  const py = y - rect.top + canvas.scrollTop;
  let id: string | null = hit.closest("[data-node-id]")?.getAttribute("data-node-id") ?? root.id;

  while (id) {
    const n = findNode(root, id);
    if (!n) return null;
    // Pointer is over a container that takes this block: drop among its children.
    if (canDropInto(root, payload, n)) return dropInside(canvas, n, px, py);
    const loc = findParent(root, id);
    if (!loc) return null;
    // Otherwise drop before/after the hovered block if its parent takes it.
    if (canDropInto(root, payload, loc.parent)) {
      const box = boxFor(canvas, id);
      if (!box) return null;
      const axis = axisOf(loc.parent);
      const after = axis === "x" ? px > box.left + box.width / 2 : py > box.top + box.height / 2;
      return { parentId: loc.parent.id, index: loc.index + (after ? 1 : 0), line: edgeLine(box, axis, after) };
    }
    id = loc.parent.id;
  }
  return null;
}

export type TreeDropPosition = "before" | "after" | "inside";

/** Outline drop: top 30% = before, bottom 30% = after, middle = inside (when the row is a container that accepts it). */
export function computeTreeDrop(
  root: BuilderNode,
  payload: DragPayload,
  targetId: string,
  relY: number,
): { parentId: string; index: number; position: TreeDropPosition } | null {
  const target = findNode(root, targetId);
  if (!target) return null;
  const loc = findParent(root, targetId);
  const insideOk = canDropInto(root, payload, target);
  const siblingOk = !!loc && canDropInto(root, payload, loc.parent) && !(payload.kind === "move" && isWithin(root, payload.id, targetId) && payload.id !== targetId);
  const pick = (pos: TreeDropPosition) => {
    if (pos === "inside" && insideOk) return { parentId: target.id, index: target.children.length, position: pos };
    if (pos !== "inside" && siblingOk && loc) return { parentId: loc.parent.id, index: loc.index + (pos === "after" ? 1 : 0), position: pos };
    return null;
  };
  if (relY < 0.3) return pick("before") ?? pick("inside");
  if (relY > 0.7) return pick("after") ?? pick("inside");
  return pick("inside") ?? pick(relY < 0.5 ? "before" : "after");
}
