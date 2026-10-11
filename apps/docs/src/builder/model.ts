// Builder document model: a plain, JSON-serialisable tree so it can be saved, undone and code-generated.

export type PropValue = string | number | boolean;

export interface BuilderNode {
  id: string;
  type: string;
  props: Record<string, PropValue>;
  children: BuilderNode[];
}

/** What is being built. Decides the root node and the shape of the generated code. */
export type BuildMode = "page" | "section" | "component";

export interface BuilderDoc {
  mode: BuildMode;
  /** Name of the generated React component. */
  name: string;
  root: BuilderNode;
}

let counter = 0;
export const uid = () => `n${Date.now().toString(36)}${(counter++).toString(36)}`;

export function node(type: string, props: Record<string, PropValue> = {}, children: BuilderNode[] = []): BuilderNode {
  return { id: uid(), type, props, children };
}

export function findNode(root: BuilderNode, id: string): BuilderNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

export function findParent(root: BuilderNode, id: string): { parent: BuilderNode; index: number } | null {
  const index = root.children.findIndex((c) => c.id === id);
  if (index >= 0) return { parent: root, index };
  for (const child of root.children) {
    const hit = findParent(child, id);
    if (hit) return hit;
  }
  return null;
}

/** Immutable update of one node. */
export function updateNode(root: BuilderNode, id: string, fn: (n: BuilderNode) => BuilderNode): BuilderNode {
  if (root.id === id) return fn(root);
  let changed = false;
  const children = root.children.map((c) => {
    const next = updateNode(c, id, fn);
    if (next !== c) changed = true;
    return next;
  });
  return changed ? { ...root, children } : root;
}

export function insertNode(root: BuilderNode, parentId: string, index: number, child: BuilderNode): BuilderNode {
  return updateNode(root, parentId, (p) => {
    const children = [...p.children];
    children.splice(Math.max(0, Math.min(index, children.length)), 0, child);
    return { ...p, children };
  });
}

export function removeNode(root: BuilderNode, id: string): BuilderNode {
  const loc = findParent(root, id);
  if (!loc) return root;
  return updateNode(root, loc.parent.id, (p) => ({ ...p, children: p.children.filter((c) => c.id !== id) }));
}

export function moveNode(root: BuilderNode, id: string, delta: -1 | 1): BuilderNode {
  const loc = findParent(root, id);
  if (!loc) return root;
  const target = loc.index + delta;
  if (target < 0 || target >= loc.parent.children.length) return root;
  return updateNode(root, loc.parent.id, (p) => {
    const children = [...p.children];
    const [item] = children.splice(loc.index, 1);
    children.splice(target, 0, item!);
    return { ...p, children };
  });
}

export function cloneWithNewIds(n: BuilderNode): BuilderNode {
  return { ...n, id: uid(), props: { ...n.props }, children: n.children.map(cloneWithNewIds) };
}

export function duplicateNode(root: BuilderNode, id: string): { root: BuilderNode; newId: string | null } {
  const loc = findParent(root, id);
  if (!loc) return { root, newId: null };
  const copy = cloneWithNewIds(loc.parent.children[loc.index]!);
  return { root: insertNode(root, loc.parent.id, loc.index + 1, copy), newId: copy.id };
}

export function countNodes(n: BuilderNode): number {
  return 1 + n.children.reduce((sum, c) => sum + countNodes(c), 0);
}

/** "a\nb\n\nc" -> ["a", "b", "c"] — used by list-style text fields. */
export const lines = (value: PropValue | undefined) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** True when `id` is `ancestorId` or sits anywhere inside it. */
export function isWithin(root: BuilderNode, ancestorId: string, id: string): boolean {
  const ancestor = findNode(root, ancestorId);
  return !!ancestor && !!findNode(ancestor, id);
}

/**
 * Moves an existing node to `parentId` at `index` (index is in the parent's children *before* the
 * move). Returns the original tree when the move is impossible (into itself or a descendant).
 */
export function moveTo(root: BuilderNode, id: string, parentId: string, index: number): BuilderNode {
  if (isWithin(root, id, parentId)) return root;
  const loc = findParent(root, id);
  const moving = findNode(root, id);
  if (!loc || !moving) return root;
  let target = index;
  if (loc.parent.id === parentId && loc.index < index) target -= 1;
  if (loc.parent.id === parentId && loc.index === target) return root;
  return insertNode(removeNode(root, id), parentId, target, moving);
}
