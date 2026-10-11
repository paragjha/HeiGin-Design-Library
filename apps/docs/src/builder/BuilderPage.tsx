import * as React from "react";
import { ArrowDown, ArrowUp, Copy, CornerLeftUp, Download, Eye, MousePointerClick, Redo2, Trash2, Undo2 } from "lucide-react";
import { Badge, Button, Field, IconButton, Input, NativeSelect, SearchInput, Switch, Textarea, Tooltip } from "@heigin/ui";
import { CodeBlock } from "../components/CodeBlock";
import { CopyButton } from "../components/CopyButton";
import { href } from "../lib/router";
import { BLOCKS, BLOCK_MAP, canAccept, codeFor, createNode, getBlock, type BlockCategory, type FieldDef } from "./blocks";
import { generate } from "./codegen";
import {
  countNodes,
  duplicateNode,
  findNode,
  findParent,
  insertNode,
  moveNode,
  removeNode,
  updateNode,
  type BuilderDoc,
  type BuilderNode,
  type PropValue,
} from "./model";
import { TEMPLATES, defaultDoc } from "./templates";
import "./builder.css";

const STORAGE_KEY = "hg-builder-v1";
const CATEGORIES: BlockCategory[] = ["Layout", "Content", "Actions", "Forms", "Data", "CRM"];
/** Builder block -> docs page, for "View docs" links. */
const DOCS_LINK: Record<string, string> = {
  button: "/components/button",
  iconButton: "/components/icon-button",
  input: "/components/input",
  textarea: "/components/textarea",
  nativeSelect: "/components/native-select",
  checkbox: "/components/checkbox",
  switch: "/components/switch",
  radioGroup: "/components/radio-group",
  tabs: "/components/tabs",
  table: "/components/table",
  badge: "/components/badge",
  avatar: "/components/avatar",
  card: "/components/card",
  emptyState: "/components/empty-state",
  pageHeader: "/patterns/page-header",
  metricGroup: "/patterns/metric-card",
  metric: "/patterns/metric-card",
  statusBadge: "/patterns/status-badge",
  filterToolbar: "/patterns/filter-toolbar",
  approvalCard: "/patterns/approval-card",
  taskList: "/patterns/task-row",
  activityTimeline: "/patterns/activity-timeline",
  detailList: "/patterns/detail-list",
  dealStage: "/patterns/record-header",
};

// ───────────── history
interface History {
  past: BuilderDoc[];
  present: BuilderDoc;
  future: BuilderDoc[];
  /** Coalesces consecutive edits of the same field into one undo step. */
  lastKey: string | null;
}
type Action = { type: "set"; doc: BuilderDoc; key?: string } | { type: "undo" } | { type: "redo" };

function reducer(h: History, a: Action): History {
  if (a.type === "undo") {
    const prev = h.past[h.past.length - 1];
    return prev ? { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future], lastKey: null } : h;
  }
  if (a.type === "redo") {
    const next = h.future[0];
    return next ? { past: [...h.past, h.present], present: next, future: h.future.slice(1), lastKey: null } : h;
  }
  if (a.doc === h.present) return h;
  if (a.key && a.key === h.lastKey) return { ...h, present: a.doc };
  return { past: [...h.past, h.present].slice(-100), present: a.doc, future: [], lastKey: a.key ?? null };
}

function isValidNode(n: unknown): n is BuilderNode {
  const x = n as BuilderNode;
  return !!x && typeof x.id === "string" && BLOCK_MAP.has(x.type) && typeof x.props === "object" && Array.isArray(x.children) && x.children.every(isValidNode);
}
function loadDoc(): BuilderDoc {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as BuilderDoc | null;
    if (saved && typeof saved.name === "string" && isValidNode(saved.root)) return saved;
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return defaultDoc();
}

const summary = (n: BuilderNode) => {
  const p = n.props;
  const t = p.title ?? p.label ?? p.text ?? p.caption ?? "";
  return String(t).split("\n")[0]!.slice(0, 32);
};

// ───────────── canvas
function RenderNode({ n }: { n: BuilderNode }) {
  const def = getBlock(n.type);
  return (
    <div data-node-id={n.id} style={{ display: "contents" }}>
      {def.render(
        n.props,
        n.children.map((c) => <RenderNode key={c.id} n={c} />),
      )}
    </div>
  );
}

/** Bounding box of a display:contents wrapper = union of its element descendants' top-level boxes. */
function boxOf(wrapper: Element, container: Element) {
  const rects = [...wrapper.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width || r.height);
  if (!rects.length) return null;
  const c = container.getBoundingClientRect();
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { left: left - c.left + container.scrollLeft, top: top - c.top + container.scrollTop, width: right - left, height: bottom - top };
}

function Overlay({ canvas, id, variant, label, deps }: { canvas: React.RefObject<HTMLDivElement | null>; id: string | null; variant: "selected" | "hover"; label?: string; deps: unknown }) {
  const [box, setBox] = React.useState<ReturnType<typeof boxOf>>(null);
  React.useLayoutEffect(() => {
    const el = canvas.current;
    if (!el || !id) return setBox(null);
    const measure = () => {
      const w = el.querySelector(`[data-node-id="${id}"]`);
      setBox(w ? boxOf(w, el) : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = window.setTimeout(measure, 200); // after fonts/transitions settle
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [canvas, id, deps]);
  if (!box) return null;
  return (
    <div className={`b-overlay b-overlay--${variant}`} style={{ left: box.left - 3, top: box.top - 3, width: box.width + 6, height: box.height + 6 }} aria-hidden="true">
      {label && <span className="b-overlay__label">{label}</span>}
    </div>
  );
}

// ───────────── inspector field
function PropField({ def, value, onChange }: { def: FieldDef; value: PropValue | undefined; onChange: (v: PropValue) => void }) {
  if (def.kind === "boolean") return <Switch label={def.label} checked={Boolean(value)} onCheckedChange={(c) => onChange(c)} />;
  return (
    <Field label={def.label} description={def.help}>
      {def.kind === "select" ? (
        <NativeSelect size="sm" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {def.options!.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </NativeSelect>
      ) : def.kind === "textarea" ? (
        <Textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : def.kind === "number" ? (
        <Input
          size="sm"
          type="number"
          min={def.min}
          max={def.max}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(def.min ?? -Infinity, Math.min(def.max ?? Infinity, Number(e.target.value))))}
        />
      ) : (
        <Input size="sm" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

// ───────────── page
export function BuilderPage() {
  const [history, dispatch] = React.useReducer(reducer, undefined, () => ({ past: [], present: loadDoc(), future: [], lastKey: null }));
  const doc = history.present;
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const setDoc = React.useCallback((next: BuilderDoc, key?: string) => dispatch({ type: "set", doc: next, key }), []);
  const setRoot = (root: BuilderNode, key?: string) => setDoc({ ...doc, root }, key);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore (private mode / quota)
    }
  }, [doc]);
  React.useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const selected = selectedId ? findNode(doc.root, selectedId) : null;
  React.useEffect(() => {
    if (selectedId && !findNode(doc.root, selectedId)) setSelectedId(null);
  }, [doc.root, selectedId]);

  const generated = React.useMemo(() => generate(doc, codeFor), [doc]);

  // ── actions
  const add = (type: string) => {
    const child = createNode(type);
    const root = doc.root;
    const target = selected ?? root;
    let parentId: string | null = null;
    let index = 0;
    if (canAccept(target.type, type)) {
      parentId = target.id;
      index = target.children.length;
    } else {
      const loc = findParent(root, target.id);
      if (loc && canAccept(loc.parent.type, type)) {
        parentId = loc.parent.id;
        index = loc.index + 1;
      } else if (canAccept(root.type, type)) {
        parentId = root.id;
        index = root.children.length;
      }
    }
    if (!parentId) {
      setNotice(`${getBlock(type).label} can't be placed here. Select a container that accepts it.`);
      return;
    }
    setRoot(insertNode(root, parentId, index, child));
    setSelectedId(child.id);
    setNotice(`Added ${getBlock(type).label}`);
  };
  const remove = (id: string) => {
    if (id === doc.root.id) return;
    const loc = findParent(doc.root, id);
    setRoot(removeNode(doc.root, id));
    setSelectedId(loc ? (loc.parent.children[loc.index + 1]?.id ?? loc.parent.children[loc.index - 1]?.id ?? loc.parent.id) : null);
  };
  const duplicate = (id: string) => {
    const { root, newId } = duplicateNode(doc.root, id);
    setRoot(root);
    if (newId) setSelectedId(newId);
  };
  const move = (id: string, delta: -1 | 1) => setRoot(moveNode(doc.root, id, delta));
  const setProp = (id: string, key: string, value: PropValue) => setRoot(updateNode(doc.root, id, (n) => ({ ...n, props: { ...n.props, [key]: value } })), `${id}:${key}`);
  const selectParent = () => {
    if (!selectedId) return;
    const loc = findParent(doc.root, selectedId);
    if (loc) setSelectedId(loc.parent.id);
  };

  // ── keyboard shortcuts (ignored while typing in a field)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest("input, textarea, select, [contenteditable=true], [role=combobox]");
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (!typing && selectedId && (e.key === "Delete" || e.key === "Backspace") && t.closest(".builder")) {
        e.preventDefault();
        remove(selectedId);
      } else if (!typing && selectedId && mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate(selectedId);
      } else if (!typing && e.key === "Escape" && selectedId && t.closest(".builder")) {
        selectParent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── canvas pointer handling (edit mode intercepts interaction)
  const nodeIdFrom = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.("[data-node-id]")?.getAttribute("data-node-id") ?? null;
  const stop = (e: React.SyntheticEvent) => {
    if (preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const download = () => {
    const blob = new Blob([generated.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name || "Component"}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const outline = (n: BuilderNode, depth: number): React.ReactNode => (
    <li key={n.id}>
      <button
        type="button"
        className="b-tree__item"
        style={{ paddingLeft: 8 + depth * 14 }}
        aria-current={n.id === selectedId ? "true" : undefined}
        onClick={() => setSelectedId(n.id)}
        onMouseEnter={() => setHoverId(n.id)}
        onMouseLeave={() => setHoverId(null)}
      >
        <span className="b-tree__type">{getBlock(n.type).label}</span>
        <span className="b-tree__summary">{summary(n)}</span>
      </button>
      {n.children.length > 0 && <ul>{n.children.map((c) => outline(c, depth + 1))}</ul>}
    </li>
  );

  const q = filter.trim().toLowerCase();
  const palette = BLOCKS.filter((b) => !b.rootOnly && (!q || `${b.label} ${b.description} ${b.category}`.toLowerCase().includes(q)));
  const selDef = selected ? getBlock(selected.type) : null;
  const isRoot = selected?.id === doc.root.id;

  return (
    <div className="builder" data-testid="builder">
      <header className="b-toolbar">
        <div className="b-toolbar__title">
          <h1>Builder</h1>
          <Badge tone="outline">{doc.mode}</Badge>
          <span className="muted small">{countNodes(doc.root) - 1} blocks</span>
        </div>
        <div className="b-toolbar__controls">
          <label className="b-inline-field">
            <span>Start from</span>
            <NativeSelect
              size="sm"
              aria-label="Start from template"
              value=""
              onChange={(e) => {
                const t = TEMPLATES.find((x) => x.id === e.target.value);
                if (!t) return;
                setDoc(t.build());
                setSelectedId(null);
                setNotice(`Loaded ${t.label}. Undo restores your previous work.`);
              }}
            >
              <option value="">Template…</option>
              <optgroup label="Page">
                {TEMPLATES.filter((t) => t.mode === "page").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Section">
                {TEMPLATES.filter((t) => t.mode === "section").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Component">
                {TEMPLATES.filter((t) => t.mode === "component").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            </NativeSelect>
          </label>
          <label className="b-inline-field">
            <span>Component name</span>
            <Input
              size="sm"
              aria-label="Component name"
              value={doc.name}
              onChange={(e) => setDoc({ ...doc, name: e.target.value.replace(/[^A-Za-z0-9]/g, "") }, "name")}
              invalid={!/^[A-Z][A-Za-z0-9]*$/.test(doc.name)}
              style={{ width: 170 }}
            />
          </label>
          <Tooltip content="Undo (Ctrl+Z)">
            <IconButton label="Undo" icon={<Undo2 strokeWidth={1.6} />} size="sm" touch={false} disabled={!history.past.length} onClick={() => dispatch({ type: "undo" })} />
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Shift+Z)">
            <IconButton label="Redo" icon={<Redo2 strokeWidth={1.6} />} size="sm" touch={false} disabled={!history.future.length} onClick={() => dispatch({ type: "redo" })} />
          </Tooltip>
          <Button
            size="sm"
            touch={false}
            variant={preview ? "primary" : "secondary"}
            leadingIcon={preview ? <Eye strokeWidth={1.6} /> : <MousePointerClick strokeWidth={1.6} />}
            aria-pressed={preview}
            onClick={() => setPreview((p) => !p)}
            data-testid="preview-toggle"
          >
            {preview ? "Interact mode" : "Edit mode"}
          </Button>
        </div>
      </header>
      <p role="status" aria-live="polite" className="b-notice">
        {notice}
      </p>

      <div className="b-layout">
        {/* Left: palette + outline */}
        <aside className="b-panel b-left" aria-label="Blocks and outline">
          <section aria-labelledby="b-palette-h">
            <h2 id="b-palette-h" className="b-panel__title">
              Add a block
            </h2>
            <SearchInput aria-label="Filter blocks" placeholder="Filter blocks" value={filter} onValueChange={setFilter} size="sm" />
            {CATEGORIES.map((cat) => {
              const items = palette.filter((b) => b.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="b-palette__group">
                  <p className="b-palette__cat">{cat}</p>
                  <div className="b-palette__items">
                    {items.map((b) => (
                      <button key={b.type} type="button" className="b-palette__item" title={b.description} onClick={() => add(b.type)} data-testid={`add-${b.type}`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="muted tiny">Blocks are added inside the selected container, or after the selected block.</p>
          </section>
          <section aria-labelledby="b-outline-h">
            <h2 id="b-outline-h" className="b-panel__title">
              Outline
            </h2>
            <ul className="b-tree">{outline(doc.root, 0)}</ul>
          </section>
        </aside>

        {/* Centre: canvas */}
        <section className="b-canvas-wrap" aria-label="Canvas">
          <div
            ref={canvasRef}
            className={`b-canvas${preview ? " b-canvas--preview" : ""}`}
            data-testid="builder-canvas"
            onClickCapture={(e) => {
              if (preview) return;
              stop(e);
              setSelectedId(nodeIdFrom(e.target));
            }}
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onKeyDownCapture={(e) => {
              if (!preview && (e.key === "Enter" || e.key === " ")) stop(e);
            }}
            onMouseMove={(e) => {
              if (preview) return;
              const id = nodeIdFrom(e.target);
              if (id !== hoverId) setHoverId(id);
            }}
            onMouseLeave={() => setHoverId(null)}
          >
            <RenderNode n={doc.root} />
            {!preview && hoverId && hoverId !== selectedId && <Overlay canvas={canvasRef} id={hoverId} variant="hover" deps={doc} />}
            {!preview && selectedId && <Overlay canvas={canvasRef} id={selectedId} variant="selected" label={selDef?.label} deps={doc} />}
          </div>
        </section>

        {/* Right: inspector */}
        <aside className="b-panel b-right" aria-label="Properties">
          {!selected || !selDef ? (
            <div className="b-empty">
              <p className="b-panel__title">Properties</p>
              <p className="muted small">Select a block on the canvas or in the outline to edit it.</p>
            </div>
          ) : (
            <div className="b-inspector" data-testid="inspector">
              <div className="b-inspector__head">
                <div>
                  <p className="b-panel__title">{selDef.label}</p>
                  <p className="muted tiny">{selDef.description}</p>
                </div>
                {DOCS_LINK[selected.type] && (
                  <a className="tiny" href={href(DOCS_LINK[selected.type]!)}>
                    Docs
                  </a>
                )}
              </div>
              {!isRoot && (
                <div className="b-inspector__actions" role="group" aria-label="Block actions">
                  <IconButton label="Move up" icon={<ArrowUp strokeWidth={1.6} />} size="sm" touch={false} onClick={() => move(selected.id, -1)} />
                  <IconButton label="Move down" icon={<ArrowDown strokeWidth={1.6} />} size="sm" touch={false} onClick={() => move(selected.id, 1)} />
                  <IconButton label="Select parent (Esc)" icon={<CornerLeftUp strokeWidth={1.6} />} size="sm" touch={false} onClick={selectParent} />
                  <IconButton label="Duplicate (Ctrl+D)" icon={<Copy strokeWidth={1.6} />} size="sm" touch={false} onClick={() => duplicate(selected.id)} />
                  <IconButton label="Delete (Del)" icon={<Trash2 strokeWidth={1.6} />} size="sm" touch={false} variant="danger" onClick={() => remove(selected.id)} />
                </div>
              )}
              <div className="b-inspector__fields">
                {selDef.fields.length === 0 && <p className="muted small">No editable properties.</p>}
                {selDef.fields.map((f) => (
                  <PropField key={`${selected.id}-${f.key}`} def={f} value={selected.props[f.key]} onChange={(v) => setProp(selected.id, f.key, v)} />
                ))}
                {selDef.container && (
                  <p className="muted tiny">
                    Container{selDef.accepts ? ` — accepts ${selDef.accepts.map((t) => getBlock(t).label).join(", ")}` : ""}. Add blocks from the palette while this is selected.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Code */}
      <section className="b-code" aria-labelledby="b-code-h">
        <div className="b-code__head">
          <div>
            <h2 id="b-code-h" className="b-panel__title">
              Code — {doc.name || "Component"}.tsx
            </h2>
            <p className="muted tiny">
              {generated.client ? 'Client Component ("use client") — it holds state or event handlers.' : "Server-component safe."} Needs <code>@heigin/ui</code>
              {generated.imports.icons.length ? ", lucide-react" : ""}, and <code>import "@heigin/ui/styles.css"</code> once in your app root.
            </p>
          </div>
          <div className="b-code__actions">
            <CopyButton text={generated.code} label="Copy code" testId="copy-builder-code" />
            <Button size="sm" touch={false} variant="secondary" leadingIcon={<Download strokeWidth={1.6} />} onClick={download}>
              Download .tsx
            </Button>
          </div>
        </div>
        <CodeBlock code={generated.code} label="Generated code" maxHeight={560} />
      </section>
    </div>
  );
}
