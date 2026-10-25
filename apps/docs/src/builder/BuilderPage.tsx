import * as React from "react";
import { ContextMenu } from "@base-ui/react/context-menu";
import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Copy,
  CornerLeftUp,
  Download,
  Eye,
  FileCode2,
  FolderOpen,
  Import,
  Link2,
  MousePointerClick,
  Redo2,
  Save,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Drawer,
  DrawerContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Field,
  IconButton,
  Input,
  SearchInput,
  Select,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  Textarea,
  ToastProvider,
  Tooltip,
} from "@heigin/ui";
import { CodeBlock } from "../components/CodeBlock";
import { CopyButton } from "../components/CopyButton";
import { copyText } from "../lib/clipboard";
import { href } from "../lib/router";
import { listManifests } from "../lib/source";
import { BLOCKS, CanvasModeContext, canAccept, createNode, getBlock, layoutStyle, LAYOUT_FIELDS, type BlockCategory, type FieldDef, SPAN_FIELD } from "./blocks";
import { ICONS, ICON_NAMES } from "./data";
import { componentNameOf, generate, generateRoute, type GenerateOptions } from "./codegen";
import { computeCanvasDrop, computeTreeDrop, boxOf, type DragPayload, type DropTarget, type TreeDropPosition } from "./dnd";
import { importCode } from "./importer";
import { ListEditor } from "./ListEditor";
import {
  cloneWithNewIds,
  countNodes,
  duplicateNode,
  findNode,
  findParent,
  indentNode,
  insertNode,
  moveNode,
  moveTo,
  node,
  outdentNode,
  removeNode,
  unwrapNode,
  updateNode,
  wrapNode,
  type BuilderDoc,
  type BuilderNode,
  type PropValue,
} from "./model";
import {
  decodeShare,
  deleteBlock,
  deleteDesign,
  encodeShare,
  instantiateBlock,
  isValidDoc,
  listBlocks,
  listDesigns,
  saveBlock,
  saveDesign,
  shareTokenFromHash,
  shareUrl,
  type SavedBlock,
  type SavedDesign,
} from "./storage";
import { TEMPLATES, defaultDoc } from "./templates";
import "./builder.css";

const STORAGE_KEY = "hg-builder-v1";
const CATEGORIES: BlockCategory[] = ["Layout", "Content", "Actions", "Forms", "Data", "Overlays", "CRM"];
const WRAPPERS = [
  { type: "card", label: "Card", props: { title: "", description: "", padding: "md" } },
  { type: "stack", label: "Stack", props: {} },
  { type: "section", label: "Section", props: { title: "Section" } },
  { type: "grid", label: "Grid", props: {} },
] as const;
/** Builder block -> docs page, for "Docs" links. */
const DOCS_LINK: Record<string, string> = {
  button: "/components/button",
  iconButton: "/components/icon-button",
  input: "/components/input",
  textarea: "/components/textarea",
  select: "/components/select",
  checkbox: "/components/checkbox",
  switch: "/components/switch",
  radioGroup: "/components/radio-group",
  tabs: "/components/tabs",
  table: "/components/table",
  badge: "/components/badge",
  avatar: "/components/avatar",
  card: "/components/card",
  emptyState: "/components/empty-state",
  errorState: "/components/empty-state",
  loadingState: "/components/skeleton",
  dialog: "/components/dialog",
  drawer: "/components/drawer",
  dropdownMenu: "/components/dropdown-menu",
  toastButton: "/components/toast",
  form: "/components/field",
  pageHeader: "/patterns/page-header",
  metricGroup: "/patterns/metric-card",
  metric: "/patterns/metric-card",
  statusBadge: "/patterns/status-badge",
  filterToolbar: "/patterns/filter-toolbar",
  approvalCard: "/patterns/approval-card",
  taskList: "/patterns/task-row",
  activityTimeline: "/patterns/activity-timeline",
  conversationList: "/patterns/conversation-list-item",
  detailList: "/patterns/detail-list",
  dealStage: "/patterns/record-header",
  appShell: "/patterns/sidebar-nav",
  sidebar: "/patterns/sidebar-nav",
};

/** Export name -> copied-source module path (default copy destination components/heigin). */
const SOURCE_IMPORTS: Record<string, string> = Object.fromEntries(
  listManifests().flatMap((m) => {
    const path = `@/components/heigin/${m.entry.replace(/\.tsx?$/, "")}`;
    return [...m.exports, ...m.types].map((name) => [name, path]);
  }),
);
const MANIFEST_OF: Record<string, string> = Object.fromEntries(listManifests().flatMap((m) => [...m.exports, ...m.types].map((name) => [name, m.name])));

// ───────────── history
interface History {
  past: BuilderDoc[];
  present: BuilderDoc;
  future: BuilderDoc[];
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
function loadDoc(): BuilderDoc {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as unknown;
    if (isValidDoc(saved)) return saved;
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return defaultDoc();
}

const summary = (n: BuilderNode) => {
  const p = n.props;
  const t = p.title ?? p.label ?? p.text ?? p.caption ?? p.triggerLabel ?? "";
  return String(t).split("\n")[0]!.slice(0, 32);
};

// ───────────── canvas rendering
function RenderNode({ n }: { n: BuilderNode }) {
  const def = getBlock(n.type);
  const ls = layoutStyle(n.props);
  return (
    <div data-node-id={n.id} style={(ls as React.CSSProperties | undefined) ?? { display: "contents" }}>
      {def.render(
        n.props,
        n.children.map((c) => <RenderNode key={c.id} n={c} />),
        n,
      )}
    </div>
  );
}

function Overlay({
  canvas,
  id,
  variant,
  label,
  deps,
  onHandleDragStart,
  onHandleDragEnd,
}: {
  canvas: React.RefObject<HTMLDivElement | null>;
  id: string | null;
  variant: "selected" | "hover";
  label?: string;
  deps: unknown;
  onHandleDragStart?: (e: React.DragEvent) => void;
  onHandleDragEnd?: () => void;
}) {
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
    const t = window.setTimeout(measure, 200);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [canvas, id, deps]);
  if (!box) return null;
  const isDraggable = variant === "selected" && !!onHandleDragStart;
  return (
    <div
      className={`b-overlay b-overlay--${variant}${isDraggable ? " b-overlay--draggable" : ""}`}
      style={{ left: box.left - 3, top: box.top - 3, width: box.width + 6, height: box.height + 6 }}
      aria-hidden="true"
      draggable={isDraggable || undefined}
      onDragStart={isDraggable ? onHandleDragStart : undefined}
      onDragEnd={isDraggable ? onHandleDragEnd : undefined}
    >
      {label &&
        (onHandleDragStart ? (
          <span className="b-overlay__label b-overlay__handle" draggable onDragStart={onHandleDragStart} onDragEnd={onHandleDragEnd} title="Drag to move" data-testid="drag-handle">
            <span aria-hidden="true">⠿</span> {label}
          </span>
        ) : (
          <span className="b-overlay__label">{label}</span>
        ))}
    </div>
  );
}

// ───────────── inspector field
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const Icon = ICONS[value];
  const names = ICON_NAMES.filter((n) => n !== "none");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-flex", width: 20, height: 20, alignItems: "center", justifyContent: "center", color: "var(--hg-color-ink)" }} aria-hidden="true">
        {Icon ? <Icon size={18} strokeWidth={1.6} /> : null}
      </span>
      <Select
        size="sm"
        value={value || null}
        placeholder="No icon"
        onValueChange={(v) => onChange(v ?? "")}
        options={names.map((n) => ({ value: n, label: n }))}
      />
    </div>
  );
}

function PropField({ def, value, onChange }: { def: FieldDef; value: PropValue | undefined; onChange: (v: PropValue) => void }) {
  if (def.kind === "boolean") return <Switch label={def.label} checked={Boolean(value)} onCheckedChange={(c) => onChange(c)} />;
  if (def.kind === "list") return <ListEditor def={def} value={String(value ?? "")} onChange={onChange} />;
  if (def.kind === "icon")
    return (
      <Field label={def.label} description={def.help}>
        <IconPicker value={String(value ?? "")} onChange={onChange} />
      </Field>
    );
  return (
    <Field label={def.label} description={def.help}>
      {def.kind === "select" ? (
        <Select
          size="sm"
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v ?? "")}
          options={def.options!.map((o) => ({ value: o, label: o }))}
        />
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

const download = (filename: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

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
  // Drag and drop
  const dragRef = React.useRef<DragPayload | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [dropHint, setDropHint] = React.useState<DropTarget | null>(null);
  const [treeHint, setTreeHint] = React.useState<{ id: string; position: TreeDropPosition } | null>(null);
  // Panels
  const [designsOpen, setDesignsOpen] = React.useState(false);
  const [designs, setDesigns] = React.useState<SavedDesign[]>(() => listDesigns());
  const [currentDesignId, setCurrentDesignId] = React.useState<string | null>(null);
  const [designTitle, setDesignTitle] = React.useState("");
  const [myBlocks, setMyBlocks] = React.useState<SavedBlock[]>(() => listBlocks());
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");
  const [importResult, setImportResult] = React.useState<{ exact: boolean; warnings: string[] } | null>(null);
  const [importError, setImportError] = React.useState("");
  // Export
  const [exportTab, setExportTab] = React.useState("file");
  const [importStyle, setImportStyle] = React.useState<"package" | "source">("package");
  const [includeState, setIncludeState] = React.useState(true);
  const [route, setRoute] = React.useState("leads");
  // Left-panel tabs so the outline isn't buried below the long palette.
  const [leftTab, setLeftTab] = React.useState<"blocks" | "outline">("blocks");
  // Canvas viewport preset — affects the canvas only, not the generated code.
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const VIEWPORT_WIDTHS: Record<"desktop" | "tablet" | "mobile", number | null> = { desktop: null, tablet: 768, mobile: 390 };

  const setDoc = React.useCallback((next: BuilderDoc, key?: string) => dispatch({ type: "set", doc: next, key }), []);
  const setRoot = (root: BuilderNode, key?: string) => setDoc({ ...doc, root }, key);

  // Persist + notices
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore (private mode / quota)
    }
  }, [doc]);
  React.useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  // Open a shared design from the URL (#/builder?d=...), on load and when the hash changes in an open tab.
  React.useEffect(() => {
    const open = () => {
      const token = shareTokenFromHash();
      if (!token) return;
      void decodeShare(token).then((shared) => {
        if (shared) {
          setDoc(shared);
          setSelectedId(null);
          setNotice(`Opened shared design "${shared.name}". Undo restores what you had before.`);
        } else setNotice("That share link is invalid or damaged.");
        window.history.replaceState(null, "", `${location.pathname}${location.search}#/builder`);
      });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [setDoc]);

  const selected = selectedId ? findNode(doc.root, selectedId) : null;
  React.useEffect(() => {
    if (selectedId && !findNode(doc.root, selectedId)) setSelectedId(null);
  }, [doc.root, selectedId]);

  const genOptions: GenerateOptions = { importStyle, sourceImports: SOURCE_IMPORTS, includeState };
  const generated = React.useMemo(() => generate(doc, getBlock, { importStyle, sourceImports: SOURCE_IMPORTS, includeState }), [doc, importStyle, includeState]);
  const routeFiles = React.useMemo(() => generateRoute(doc, generated, route).files, [doc, generated, route]);
  const copyCommand = React.useMemo(() => {
    const names = [...new Set(generated.imports.ui.map((n) => MANIFEST_OF[n]).filter(Boolean))].sort();
    return names.length ? `node scripts/copy-component.mjs ${names.join(" ")} --dest components/heigin` : "";
  }, [generated]);

  // ── selection-aware helpers
  const selDef = selected ? getBlock(selected.type) : null;
  const isRoot = selected?.id === doc.root.id;

  // ── actions
  const insertAtSelection = (child: BuilderNode, label: string) => {
    const root = doc.root;
    const target = selected ?? root;
    let parentId: string | null = null;
    let index = 0;
    if (canAccept(target.type, child.type)) {
      parentId = target.id;
      index = target.children.length;
    } else {
      const loc = findParent(root, target.id);
      if (loc && canAccept(loc.parent.type, child.type)) {
        parentId = loc.parent.id;
        index = loc.index + 1;
      } else if (canAccept(root.type, child.type)) {
        parentId = root.id;
        index = root.children.length;
      }
    }
    if (!parentId) {
      setNotice(`${label} can't be placed here. Select a container that accepts it.`);
      return;
    }
    setRoot(insertNode(root, parentId, index, child));
    setSelectedId(child.id);
    setNotice(`Added ${label}`);
  };
  const add = (type: string) => insertAtSelection(createNode(type), getBlock(type).label);
  const addSaved = (b: SavedBlock) => insertAtSelection(instantiateBlock(b), b.name);
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
  const indent = (id: string) => {
    const next = indentNode(doc.root, id, (c) => canAccept(c.type, findNode(doc.root, id)!.type));
    if (next === doc.root) setNotice("Can't move into the previous block — it isn't a container that accepts this block.");
    else setRoot(next);
  };
  const outdent = (id: string) => {
    const next = outdentNode(doc.root, id, (c) => canAccept(c.type, findNode(doc.root, id)!.type));
    if (next === doc.root) setNotice("Can't move out of this container here.");
    else setRoot(next);
  };
  const wrap = (id: string, w: (typeof WRAPPERS)[number]) => {
    const target = findNode(doc.root, id);
    const loc = findParent(doc.root, id);
    if (!target || !loc) return;
    if (!canAccept(loc.parent.type, w.type) || !canAccept(w.type, target.type)) {
      setNotice(`Can't wrap ${getBlock(target.type).label} in a ${w.label} here.`);
      return;
    }
    const wrapper = { ...createNode(w.type), children: [] as BuilderNode[] };
    wrapper.props = { ...wrapper.props, ...w.props };
    setRoot(wrapNode(doc.root, id, wrapper));
    setSelectedId(wrapper.id);
    setNotice(`Wrapped in ${w.label}`);
  };
  const unwrap = (id: string) => {
    const target = findNode(doc.root, id);
    const loc = findParent(doc.root, id);
    if (!target || !loc || !getBlock(target.type).container) return;
    if (!target.children.every((c) => canAccept(loc.parent.type, c.type))) {
      setNotice("Its children can't be placed in the parent container.");
      return;
    }
    setRoot(unwrapNode(doc.root, id));
    setSelectedId(target.children[0]?.id ?? loc.parent.id);
  };
  const setProp = (id: string, key: string, value: PropValue) => setRoot(updateNode(doc.root, id, (n) => ({ ...n, props: { ...n.props, [key]: value } })), `${id}:${key}`);
  const selectParent = () => {
    if (!selectedId) return;
    const loc = findParent(doc.root, selectedId);
    if (loc) setSelectedId(loc.parent.id);
  };
  const copyBlockCode = async (id: string) => {
    const target = findNode(doc.root, id);
    if (!target) return;
    const label = getBlock(target.type)
      .label.split(/[^A-Za-z0-9]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
    const blockDoc: BuilderDoc = { mode: "component", name: `${label}Block`, root: node("fragment", {}, [cloneWithNewIds(target)]) };
    const ok = await copyText(generate(blockDoc, getBlock, { ...genOptions, includeState: false }).code);
    setNotice(ok ? `Copied ${getBlock(target.type).label} code` : "Copy failed");
  };
  const saveAsMyBlock = (id: string) => {
    const target = findNode(doc.root, id);
    if (!target) return;
    const name = `${getBlock(target.type).label}${summary(target) ? `: ${summary(target)}` : ""}`;
    saveBlock(cloneWithNewIds(target), name);
    setMyBlocks(listBlocks());
    setNotice(`Saved "${name}" to My blocks`);
  };

  // ── drag and drop
  const startDrag = (e: React.DragEvent, payload: DragPayload) => {
    dragRef.current = payload;
    e.dataTransfer.effectAllowed = payload.kind === "move" ? "move" : "copy";
    e.dataTransfer.setData("text/plain", payload.type);
    setDragging(true);
    setHoverId(null);
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
    setDropHint(null);
    setTreeHint(null);
  };
  const applyDrop = (parentId: string, index: number) => {
    const payload = dragRef.current;
    if (!payload) return;
    if (payload.kind === "move") {
      const next = moveTo(doc.root, payload.id, parentId, index);
      if (next !== doc.root) {
        setRoot(next);
        setNotice(`Moved ${getBlock(payload.type).label}`);
      }
      setSelectedId(payload.id);
    } else {
      const child = payload.kind === "saved" ? cloneWithNewIds(payload.node) : createNode(payload.type);
      setRoot(insertNode(doc.root, parentId, index, child));
      setSelectedId(child.id);
      setNotice(`Added ${getBlock(payload.type).label}`);
    }
    endDrag();
  };

  // ── keyboard shortcuts (ignored while typing in a field)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest("input, textarea, select, [contenteditable=true], [role=combobox]");
      if (typing) return;
      const mod = e.ctrlKey || e.metaKey;
      const inBuilder = !!t.closest(".builder") || t === document.body;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (!selectedId || !inBuilder) {
        return;
      } else if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        move(selectedId, -1);
      } else if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        move(selectedId, 1);
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        indent(selectedId);
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        outdent(selectedId);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        remove(selectedId);
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate(selectedId);
      } else if (e.key === "Escape") {
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
    if ((e.target as HTMLElement).closest?.(".b-overlay__handle")) return;
    if (e.type === "pointerdown" && (e as React.PointerEvent).button === 2) return; // let the context menu open
    e.preventDefault();
    e.stopPropagation();
  };
  const sameHint = (a: DropTarget | null, b: DropTarget | null) =>
    a?.parentId === b?.parentId && a?.index === b?.index && a?.line.left === b?.line.left && a?.line.top === b?.line.top;

  // ── code ↔ canvas linking
  const highlight = selectedId && exportTab === "file" ? (generated.lines[selectedId] ?? null) : null;
  const selectByLine = (line: number) => {
    let best: string | null = null;
    let span = Infinity;
    for (const [id, [a, b]] of Object.entries(generated.lines)) {
      if (line >= a && line <= b && b - a < span) {
        best = id;
        span = b - a;
      }
    }
    if (best) setSelectedId(best);
  };

  // ── designs + share + import
  const refreshDesigns = () => setDesigns(listDesigns());
  const saveCurrent = (asNew: boolean) => {
    const d = saveDesign(doc, designTitle || doc.name, asNew ? undefined : (currentDesignId ?? undefined));
    setCurrentDesignId(d.id);
    setDesignTitle(d.title);
    refreshDesigns();
    setNotice(`Saved design "${d.title}"`);
  };
  const share = async () => {
    const url = shareUrl(await encodeShare(doc));
    const ok = await copyText(url);
    setNotice(ok ? `Share link copied (${Math.round(url.length / 100) / 10}k characters). Anyone with the link can open this design.` : url);
  };
  const runImport = async () => {
    setImportError("");
    try {
      const res = await importCode(importText);
      setDoc(res.doc);
      setSelectedId(null);
      setImportResult({ exact: res.exact, warnings: res.warnings });
      setNotice(res.exact ? `Imported "${res.doc.name}" exactly (builder state found).` : `Imported "${res.doc.name}" (best effort).`);
      if (res.exact || res.warnings.length === 0) setImportOpen(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Couldn't read that code.");
    }
  };

  // ── outline
  const outline = (n: BuilderNode, depth: number): React.ReactNode => (
    <li key={n.id}>
      <button
        type="button"
        className="b-tree__item"
        style={{ paddingLeft: 8 + depth * 14 }}
        aria-current={n.id === selectedId ? "true" : undefined}
        data-drop={treeHint?.id === n.id ? treeHint.position : undefined}
        data-testid={`tree-${n.id}`}
        onClick={() => setSelectedId(n.id)}
        onMouseEnter={() => !dragging && setHoverId(n.id)}
        onMouseLeave={() => setHoverId(null)}
        draggable={n.id !== doc.root.id}
        onDragStart={(e) => startDrag(e, { kind: "move", id: n.id, type: n.type })}
        onDragEnd={endDrag}
        onDragOver={(e) => {
          const payload = dragRef.current;
          if (!payload) return;
          const r = e.currentTarget.getBoundingClientRect();
          const drop = computeTreeDrop(doc.root, payload, n.id, (e.clientY - r.top) / r.height);
          if (!drop) {
            if (treeHint?.id === n.id) setTreeHint(null);
            return;
          }
          e.preventDefault();
          e.dataTransfer.dropEffect = payload.kind === "move" ? "move" : "copy";
          if (treeHint?.id !== n.id || treeHint.position !== drop.position) setTreeHint({ id: n.id, position: drop.position });
        }}
        onDragLeave={() => treeHint?.id === n.id && setTreeHint(null)}
        onDrop={(e) => {
          e.preventDefault();
          const payload = dragRef.current;
          if (!payload) return;
          const r = e.currentTarget.getBoundingClientRect();
          const drop = computeTreeDrop(doc.root, payload, n.id, (e.clientY - r.top) / r.height);
          if (drop) applyDrop(drop.parentId, drop.index);
          else endDrag();
        }}
      >
        <span className="b-tree__type">{getBlock(n.type).label}</span>
        <span className="b-tree__summary">{summary(n)}</span>
      </button>
      {n.children.length > 0 && <ul>{n.children.map((c) => outline(c, depth + 1))}</ul>}
    </li>
  );

  const q = filter.trim().toLowerCase();
  const palette = BLOCKS.filter((b) => !b.rootOnly && (!q || `${b.label} ${b.description} ${b.category}`.toLowerCase().includes(q)));
  const savedPalette = myBlocks.filter((b) => !q || b.name.toLowerCase().includes(q));

  const canvasProps = {
    ref: canvasRef,
    className: `b-canvas${preview ? " b-canvas--preview" : ""}`,
    "data-testid": "builder-canvas",
    onClickCapture: (e: React.MouseEvent) => {
      if (preview) return;
      stop(e);
      setSelectedId(nodeIdFrom(e.target));
    },
    onContextMenuCapture: (e: React.MouseEvent) => {
      if (preview) return;
      const id = nodeIdFrom(e.target);
      if (id) setSelectedId(id);
    },
    onPointerDownCapture: stop,
    onMouseDownCapture: stop,
    onKeyDownCapture: (e: React.KeyboardEvent) => {
      if (!preview && (e.key === "Enter" || e.key === " ")) stop(e);
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (preview || dragging) return;
      const id = nodeIdFrom(e.target);
      if (id !== hoverId) setHoverId(id);
    },
    onMouseLeave: () => setHoverId(null),
    onDragOver: (e: React.DragEvent) => {
      const payload = dragRef.current;
      const canvas = canvasRef.current;
      if (!payload || !canvas) return;
      const hint = computeCanvasDrop(canvas, doc.root, payload, e.clientX, e.clientY);
      if (hint) {
        e.preventDefault();
        e.dataTransfer.dropEffect = payload.kind === "move" ? "move" : "copy";
      }
      if (!sameHint(hint, dropHint)) setDropHint(hint);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropHint(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const payload = dragRef.current;
      const canvas = canvasRef.current;
      const hint = payload && canvas ? computeCanvasDrop(canvas, doc.root, payload, e.clientX, e.clientY) : null;
      if (hint) applyDrop(hint.parentId, hint.index);
      else endDrag();
    },
  };
  const canvasChildren = (
    <>
      <CanvasModeContext.Provider value={preview ? "interact" : "edit"}>
        <ToastProvider>
          <RenderNode n={doc.root} />
        </ToastProvider>
      </CanvasModeContext.Provider>
      {!preview && !dragging && hoverId && hoverId !== selectedId && <Overlay canvas={canvasRef} id={hoverId} variant="hover" deps={doc} />}
      {!preview && selectedId && (
        <Overlay
          canvas={canvasRef}
          id={selectedId}
          variant="selected"
          label={selDef?.label}
          deps={doc}
          onHandleDragStart={!isRoot && selected ? (e) => startDrag(e, { kind: "move", id: selected.id, type: selected.type }) : undefined}
          onHandleDragEnd={endDrag}
        />
      )}
      {dropHint && (
        <div
          className={dropHint.inside ? "b-drop b-drop--inside" : "b-drop"}
          style={{ left: dropHint.line.left, top: dropHint.line.top, width: dropHint.line.width, height: dropHint.line.height }}
          aria-hidden="true"
          data-testid="drop-indicator"
        />
      )}
    </>
  );

  const blockActions = (id: string) => {
    const n = findNode(doc.root, id);
    if (!n) return [];
    const def = getBlock(n.type);
    const root = id === doc.root.id;
    const items: { key: string; label: string; onSelect: () => void; danger?: boolean; disabled?: boolean; shortcut?: string }[] = [
      { key: "copy", label: "Copy block code", onSelect: () => void copyBlockCode(id) },
      { key: "save", label: "Save to My blocks", onSelect: () => saveAsMyBlock(id), disabled: root },
      { key: "dup", label: "Duplicate", onSelect: () => duplicate(id), disabled: root, shortcut: "Ctrl+D" },
      { key: "up", label: "Move up", onSelect: () => move(id, -1), disabled: root, shortcut: "Alt+↑" },
      { key: "down", label: "Move down", onSelect: () => move(id, 1), disabled: root, shortcut: "Alt+↓" },
      { key: "in", label: "Move into previous container", onSelect: () => indent(id), disabled: root, shortcut: "Alt+→" },
      { key: "out", label: "Move out of container", onSelect: () => outdent(id), disabled: root, shortcut: "Alt+←" },
      ...WRAPPERS.map((w) => ({ key: `wrap-${w.type}`, label: `Wrap in ${w.label}`, onSelect: () => wrap(id, w), disabled: root })),
      ...(def.container && !root ? [{ key: "unwrap", label: "Unwrap (keep children)", onSelect: () => unwrap(id) }] : []),
      { key: "parent", label: "Select parent", onSelect: selectParent, disabled: root, shortcut: "Esc" },
      { key: "del", label: "Delete", onSelect: () => remove(id), danger: true, disabled: root, shortcut: "Del" },
    ];
    return items;
  };
  const renderMenu = (id: string) =>
    blockActions(id).map((it, i) => (
        <React.Fragment key={it.key}>
          {(i === 2 || i === 7 || it.key === "parent") && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={it.onSelect} disabled={it.disabled} tone={it.danger ? "danger" : "default"} shortcut={it.shortcut}>
            {it.label}
          </DropdownMenuItem>
        </React.Fragment>
      ));

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
            <select
              className="b-native-select"
              aria-label="Start from template"
              value=""
              onChange={(e) => {
                const t = TEMPLATES.find((x) => x.id === e.target.value);
                if (!t) return;
                setDoc(t.build());
                setSelectedId(null);
                setCurrentDesignId(null);
                setNotice(`Loaded ${t.label}. Undo restores your previous work.`);
              }}
            >
              <option value="">Template…</option>
              {(["page", "section", "component"] as const).map((mode) => (
                <optgroup key={mode} label={mode[0]!.toUpperCase() + mode.slice(1)}>
                  {TEMPLATES.filter((t) => t.mode === mode).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="b-inline-field">
            <span>Component name</span>
            <Input
              size="sm"
              aria-label="Component name"
              value={doc.name}
              onChange={(e) => setDoc({ ...doc, name: e.target.value.replace(/[^A-Za-z0-9]/g, "") }, "name")}
              invalid={!/^[A-Z][A-Za-z0-9]*$/.test(doc.name)}
              style={{ width: 160 }}
            />
          </label>
          <Tooltip content="Undo (Ctrl+Z)">
            <IconButton label="Undo" icon={<Undo2 strokeWidth={1.6} />} size="sm" touch={false} disabled={!history.past.length} onClick={() => dispatch({ type: "undo" })} />
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Shift+Z)">
            <IconButton label="Redo" icon={<Redo2 strokeWidth={1.6} />} size="sm" touch={false} disabled={!history.future.length} onClick={() => dispatch({ type: "redo" })} />
          </Tooltip>
          <Button size="sm" touch={false} variant="secondary" leadingIcon={<FolderOpen strokeWidth={1.6} />} onClick={() => (refreshDesigns(), setDesignTitle(designTitle || doc.name), setDesignsOpen(true))}>
            Designs
          </Button>
          <Button size="sm" touch={false} variant="secondary" leadingIcon={<Link2 strokeWidth={1.6} />} onClick={() => void share()} data-testid="share">
            Share
          </Button>
          <Button size="sm" touch={false} variant="secondary" leadingIcon={<Import strokeWidth={1.6} />} onClick={() => (setImportResult(null), setImportError(""), setImportOpen(true))}>
            Import
          </Button>
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
        {/* Left: palette + outline split into tabs so the outline isn't buried. */}
        <aside className="b-panel b-left" aria-label="Blocks and outline">
          <Tabs value={leftTab} onValueChange={(v) => setLeftTab(v as "blocks" | "outline")}>
            <TabsList aria-label="Left panel">
              <Tab value="blocks">Blocks</Tab>
              <Tab value="outline" count={countNodes(doc.root) - 1}>Outline</Tab>
            </TabsList>
            <TabsPanel value="blocks">
          <section aria-labelledby="b-palette-h" className="b-left__pane">
            <SearchInput aria-label="Filter blocks" placeholder="Filter blocks" value={filter} onValueChange={setFilter} size="sm" />
            <h2 id="b-palette-h" className="sr-only">Add a block</h2>
            {savedPalette.length > 0 && (
              <div className="b-palette__group">
                <p className="b-palette__cat">My blocks</p>
                <div className="b-palette__items">
                  {savedPalette.map((b) => (
                    <span key={b.id} className="b-palette__saved">
                      <button
                        type="button"
                        className="b-palette__item"
                        title="Click to add, or drag onto the canvas or outline."
                        onClick={() => addSaved(b)}
                        draggable
                        onDragStart={(e) => startDrag(e, { kind: "saved", type: b.node.type, node: b.node })}
                        onDragEnd={endDrag}
                        data-testid="my-block"
                      >
                        {b.name}
                      </button>
                      <button
                        type="button"
                        className="b-palette__remove"
                        aria-label={`Delete my block ${b.name}`}
                        onClick={() => {
                          deleteBlock(b.id);
                          setMyBlocks(listBlocks());
                        }}
                      >
                        <X size={12} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {CATEGORIES.map((cat) => {
              const items = palette.filter((b) => b.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="b-palette__group">
                  <p className="b-palette__cat">{cat}</p>
                  <div className="b-palette__items">
                    {items.map((b) => (
                      <button
                        key={b.type}
                        type="button"
                        className="b-palette__item"
                        title={`${b.description} Click to add, or drag onto the canvas or outline.`}
                        onClick={() => add(b.type)}
                        draggable
                        onDragStart={(e) => startDrag(e, { kind: "new", type: b.type })}
                        onDragEnd={endDrag}
                        data-testid={`add-${b.type}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="muted tiny">
              Click to add inside the selected container (or after the selected block), or drag onto the canvas or outline. Right-click a block for more
              actions. Alt+arrows move the selected block.
            </p>
          </section>
            </TabsPanel>
            <TabsPanel value="outline">
              <section aria-labelledby="b-outline-h" className="b-left__pane b-left__pane--outline">
                <h2 id="b-outline-h" className="sr-only">Outline</h2>
                <ul className="b-tree">{outline(doc.root, 0)}</ul>
              </section>
            </TabsPanel>
          </Tabs>
        </aside>

        {/* Centre: canvas with context menu */}
        <section className="b-canvas-wrap" aria-label="Canvas">
          <div className="b-viewport" role="group" aria-label="Viewport preset">
            {(["desktop", "tablet", "mobile"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className="b-viewport__btn"
                aria-pressed={viewport === v}
                onClick={() => setViewport(v)}
                data-testid={`viewport-${v}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
                {VIEWPORT_WIDTHS[v] ? <span className="muted tiny" style={{ marginLeft: 6 }}>{VIEWPORT_WIDTHS[v]}px</span> : null}
              </button>
            ))}
          </div>
          <div className="b-canvas-frame" data-viewport={viewport} style={VIEWPORT_WIDTHS[viewport] ? { maxWidth: VIEWPORT_WIDTHS[viewport]! } : undefined}>
            <ContextMenu.Root disabled={preview}>
              <ContextMenu.Trigger {...canvasProps}>{canvasChildren}</ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Positioner className="b-cmenu__positioner">
                  <ContextMenu.Popup className="b-cmenu" data-testid="context-menu">
                    {selectedId ? renderMenu(selectedId) : null}
                  </ContextMenu.Popup>
                </ContextMenu.Positioner>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          </div>
        </section>

        {/* Right: inspector */}
        <aside className="b-panel b-right" aria-label="Properties">
          {!selected || !selDef ? (
            <div className="b-empty">
              <p className="b-panel__title">Properties</p>
              <p className="muted small">Select a block on the canvas, in the outline, or by clicking a line of code.</p>
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
              <div className="b-inspector__actions" role="group" aria-label="Block actions">
                {!isRoot && (
                  <>
                    <IconButton label="Move up (Alt+↑)" icon={<ArrowUp strokeWidth={1.6} />} size="sm" touch={false} onClick={() => move(selected.id, -1)} />
                    <IconButton label="Move down (Alt+↓)" icon={<ArrowDown strokeWidth={1.6} />} size="sm" touch={false} onClick={() => move(selected.id, 1)} />
                    <IconButton label="Select parent (Esc)" icon={<CornerLeftUp strokeWidth={1.6} />} size="sm" touch={false} onClick={selectParent} />
                    <IconButton label="Duplicate (Ctrl+D)" icon={<Copy strokeWidth={1.6} />} size="sm" touch={false} onClick={() => duplicate(selected.id)} />
                    <IconButton label="Save to My blocks" icon={<BookmarkPlus strokeWidth={1.6} />} size="sm" touch={false} onClick={() => saveAsMyBlock(selected.id)} />
                  </>
                )}
                <IconButton label="Copy block code" icon={<FileCode2 strokeWidth={1.6} />} size="sm" touch={false} onClick={() => void copyBlockCode(selected.id)} data-testid="copy-block-code" />
                {!isRoot && (
                  <IconButton label="Delete (Del)" icon={<Trash2 strokeWidth={1.6} />} size="sm" touch={false} variant="danger" onClick={() => remove(selected.id)} />
                )}
              </div>
              <div className="b-inspector__fields">
                {selDef.fields.length === 0 && <p className="muted small">No editable properties.</p>}
                {selected.type === "grid" && (
                  <div className="b-grid-presets" role="group" aria-label="Column layout presets">
                    <p className="b-inspector__section-title muted tiny" style={{ fontWeight: 600, margin: 0 }}>Column layout</p>
                    <div className="b-grid-presets__row">
                      {([
                        { label: "Sidebar + content", value: "240px 1fr", preview: "▍│░░░" },
                        { label: "Content + sidebar", value: "1fr 240px", preview: "░░░│▍" },
                        { label: "Equal halves", value: "1fr 1fr", preview: "░░│░░" },
                        { label: "Thirds", value: "1fr 1fr 1fr", preview: "░│░│░" },
                        { label: "Content + rail", value: "1fr 2fr", preview: "░│░░░" },
                        { label: "Clear", value: "", preview: "—" },
                      ] as const).map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className="b-grid-presets__btn"
                          aria-pressed={String(selected.props.columnWidths ?? "") === p.value}
                          onClick={() => setProp(selected.id, "columnWidths", p.value)}
                          title={p.value ? `grid-template-columns: ${p.value}` : "Clear custom column widths"}
                          data-testid={`grid-preset-${p.value || "clear"}`}
                        >
                          <span aria-hidden="true" className="b-grid-presets__preview">{p.preview}</span>
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selDef.fields.map((f) => (
                  <PropField key={`${selected.id}-${f.key}`} def={f} value={selected.props[f.key]} onChange={(v) => setProp(selected.id, f.key, v)} />
                ))}
                {!isRoot && findParent(doc.root, selected.id)?.parent.type === "grid" && (
                  <PropField key={`${selected.id}-span`} def={SPAN_FIELD} value={selected.props.span} onChange={(v) => setProp(selected.id, "span", v)} />
                )}
                {!isRoot && (
                  <>
                    <p className="b-inspector__section-title muted tiny" style={{ marginTop: "var(--hg-space-3)", fontWeight: 600 }}>Layout</p>
                    {LAYOUT_FIELDS.map((f) => (
                      <PropField key={`${selected.id}-${f.key}`} def={f} value={selected.props[f.key]} onChange={(v) => setProp(selected.id, f.key, v)} />
                    ))}
                  </>
                )}
                {selDef.container && (
                  <p className="muted tiny">
                    Container{selDef.accepts ? ` — accepts ${selDef.accepts.map((t) => getBlock(t).label).join(", ")}` : ""}. Add or drop blocks while this is
                    selected.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Code + export */}
      <section className="b-code" aria-labelledby="b-code-h">
        <Tabs value={exportTab} onValueChange={setExportTab}>
          <div className="b-code__head">
            <div className="b-code__titles">
              <h2 id="b-code-h" className="b-panel__title">
                Code
              </h2>
              <TabsList aria-label="Export format">
                <Tab value="file">Single file</Tab>
                <Tab value="route">Next.js route</Tab>
              </TabsList>
            </div>
            <div className="b-code__options">
              <label className="b-inline-field">
                <span>Imports</span>
                <select className="b-native-select" aria-label="Import style" value={importStyle} onChange={(e) => setImportStyle(e.target.value as "package" | "source")}>
                  <option value="package">@heigin/ui package</option>
                  <option value="source">Copied source</option>
                </select>
              </label>
              <Checkbox label="Include builder state" description="Lets you re-import this code later" checked={includeState} onCheckedChange={setIncludeState} />
            </div>
          </div>
          <p className="muted tiny b-code__info">
            {generated.client ? '"use client" — it holds state or event handlers.' : "Server-component safe."}{" "}
            {importStyle === "package" ? (
              <>
                Needs <code>@heigin/ui</code>
                {generated.imports.icons.length ? ", lucide-react" : ""} and <code>import "@heigin/ui/styles.css"</code> once.
              </>
            ) : (
              <>
                Copy the components first: <code>{copyCommand || "(none needed)"}</code>, then import <code>components/heigin/styles/tokens.css</code> once.
              </>
            )}{" "}
            {generated.props.length > 0 && <>Props: {generated.props.map((p) => p.name).join(", ")}.</>} Click a line to select its block.
          </p>
          <TabsPanel value="file">
            <div className="b-code__actions">
              <CopyButton text={generated.code} label="Copy code" testId="copy-builder-code" />
              <Button size="sm" touch={false} variant="secondary" leadingIcon={<Download strokeWidth={1.6} />} onClick={() => download(`${componentNameOf(doc)}.tsx`, generated.code)}>
                Download .tsx
              </Button>
            </div>
            <CodeBlock code={generated.code} label="Generated code" maxHeight={560} highlight={highlight} onLineClick={selectByLine} />
          </TabsPanel>
          <TabsPanel value="route">
            <div className="b-code__actions">
              <label className="b-inline-field">
                <span>Route</span>
                <Input size="sm" aria-label="Route path" value={route} onChange={(e) => setRoute(e.target.value.replace(/[^a-z0-9/-]/gi, "").toLowerCase())} style={{ width: 200 }} />
              </label>
            </div>
            {routeFiles.map((f, i) => (
              <div key={f.path} className="b-route-file">
                <div className="b-code__actions">
                  <code className="inline-code">{f.path}</code>
                  <CopyButton text={f.code} label="Copy" testId={i === 0 ? "copy-route-page" : "copy-route-component"} variant="ghost" />
                  <Button size="sm" touch={false} variant="ghost" leadingIcon={<Download strokeWidth={1.6} />} onClick={() => download(f.path.split("/").pop()!, f.code)}>
                    Download
                  </Button>
                </div>
                <CodeBlock code={f.code} label={f.path} maxHeight={420} />
              </div>
            ))}
          </TabsPanel>
        </Tabs>
      </section>

      {/* Designs drawer */}
      <Drawer open={designsOpen} onOpenChange={setDesignsOpen}>
        <DrawerContent title="Designs" description="Saved in this browser. Use Share to send a design to someone else.">
          <div className="b-designs">
            <Field label="Title">
              <Input value={designTitle} onChange={(e) => setDesignTitle(e.target.value)} placeholder={doc.name} />
            </Field>
            <div className="b-code__actions">
              {currentDesignId && (
                <Button size="sm" touch={false} leadingIcon={<Save strokeWidth={1.6} />} onClick={() => saveCurrent(false)}>
                  Save
                </Button>
              )}
              <Button size="sm" touch={false} variant={currentDesignId ? "secondary" : "primary"} leadingIcon={<Save strokeWidth={1.6} />} onClick={() => saveCurrent(true)} data-testid="save-design-as">
                Save as new
              </Button>
            </div>
            <h3 className="b-panel__title">Saved ({designs.length})</h3>
            {designs.length === 0 && <p className="muted small">No saved designs yet.</p>}
            <ul className="b-designs__list">
              {designs.map((d) => (
                <li key={d.id} className="b-designs__item" aria-current={d.id === currentDesignId ? "true" : undefined}>
                  <div>
                    <p className="b-designs__title">{d.title}</p>
                    <p className="muted tiny">
                      {d.doc.mode} · {countNodes(d.doc.root) - 1} blocks · {new Date(d.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="b-designs__actions">
                    <Button
                      size="sm"
                      touch={false}
                      variant="secondary"
                      onClick={() => {
                        setDoc(d.doc);
                        setCurrentDesignId(d.id);
                        setDesignTitle(d.title);
                        setSelectedId(null);
                        setDesignsOpen(false);
                        setNotice(`Opened "${d.title}". Undo restores what you had before.`);
                      }}
                    >
                      Open
                    </Button>
                    <AlertDialog
                      trigger={<IconButton label={`Delete design ${d.title}`} icon={<Trash2 strokeWidth={1.6} />} size="sm" touch={false} />}
                      tone="danger"
                      title={`Delete "${d.title}"?`}
                      description="This removes it from this browser. It can't be undone."
                      confirmLabel="Delete design"
                      onConfirm={() => {
                        deleteDesign(d.id);
                        if (d.id === currentDesignId) setCurrentDesignId(null);
                        refreshDesigns();
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent
          size="lg"
          title="Import code"
          description="Paste code generated by the Builder (restored exactly), or your own TSX that uses @heigin/ui (best effort)."
          footer={
            importResult && !importResult.exact && importResult.warnings.length ? (
              <Button onClick={() => setImportOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void runImport()} disabled={!importText.trim()} data-testid="run-import">
                  Import
                </Button>
              </>
            )
          }
        >
          {importResult && !importResult.exact && importResult.warnings.length ? (
            <div className="b-import-result">
              <p>
                Imported. {importResult.warnings.length} thing{importResult.warnings.length === 1 ? "" : "s"} weren&apos;t recognised:
              </p>
              <ul className="prose-list small">
                {importResult.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : (
            <Field label="Code" error={importError || undefined}>
              <Textarea rows={14} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'export default function LeadsPage() {\n  return <PageHeader title="Leads" />;\n}'} data-testid="import-text" />
            </Field>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
