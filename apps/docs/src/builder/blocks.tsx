// Block registry: what can be placed in the builder, how it renders on the canvas (real @heigin/ui
// components), which props are editable, and the exact code it generates.
import * as React from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import {
  ActivityItem,
  ActivityTimeline,
  ApprovalCard,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  ConversationListItem,
  DealStage,
  DetailList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  FilterChip,
  FilterToolbar,
  IconButton,
  Input,
  MetricCard,
  MetricGroup,
  MoneyValue,
  PageHeader,
  Pagination,
  RadioGroup,
  STATUS_REGISTRY,
  Select,
  SidebarNav,
  Skeleton,
  StatusBadge,
  Switch,
  Tab,
  Table,
  Tabs,
  TabsList,
  TaskRow,
  Textarea,
  useToast,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
  type Channel,
  type StatusKey,
  type SelectOption,
  type TableColumn,
  type ToastTone,
} from "@heigin/ui";
import { el, indent, literal, raw, style, text, type CodeBlockDef, type CodeCtx } from "./codegen";
import { DATASETS, ICONS, ICON_NAMES, TIMELINE_ICONS, type ColumnSpec, type DatasetKey } from "./data";
import { lines, node, type BuilderNode, type PropValue } from "./model";

export type FieldKind = "text" | "textarea" | "select" | "boolean" | "number" | "list" | "icon";
/** A list column: "icon" columns edit a Lucide icon name from a picker. */
export interface ListColumn {
  key: string;
  label: string;
  placeholder?: string;
  kind?: "text" | "icon";
}
export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  help?: string;
  min?: number;
  max?: number;
  /** For kind "list": the columns of each row (stored as one "a | b | c" line per row). */
  columns?: ListColumn[];
  /** For kind "list": separator between columns in the stored line. Default " | ". */
  separator?: string;
}

export type BlockCategory = "Layout" | "Content" | "Actions" | "Forms" | "Data" | "Overlays" | "CRM";

export interface BlockDef extends CodeBlockDef {
  type: string;
  label: string;
  category: BlockCategory;
  description: string;
  container?: boolean;
  accepts?: string[];
  rootOnly?: boolean;
  defaults: Record<string, PropValue>;
  fields: FieldDef[];
  defaultChildren?: () => BuilderNode[];
  render: (p: Record<string, PropValue>, children: React.ReactNode[], node: BuilderNode) => React.ReactNode;
}

// ───────────── canvas mode context (edit mode shows overlay contents inline so they can be edited)
export const CanvasModeContext = React.createContext<"edit" | "interact">("edit");

// ───────────── helpers
const s = (v: PropValue | undefined) => (v === undefined ? "" : String(v));
const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
export const camel = (v: string) => {
  const words = v.replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const out = words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase())).join("");
  return /^[a-z]/.test(out) ? out : `field${out}`;
};
const SPACE = ["2", "3", "4", "5", "6", "8"] as const;
const gapVar = (v: PropValue | undefined) => `var(--hg-space-${s(v) || "4"})`;
const setter = (name: string) => `set${name[0]!.toUpperCase()}${name.slice(1)}`;
const splitRow = (line: string, sep = "|") => line.split(sep).map((x) => x.trim());

function iconEl(name: PropValue | undefined): React.ReactNode {
  const Icon = ICONS[s(name)];
  return Icon ? <Icon strokeWidth={1.6} /> : undefined;
}
function iconCode(name: PropValue | undefined, ctx: CodeCtx) {
  const n = s(name);
  if (!ICONS[n]) return undefined;
  ctx.use(n, "lucide-react");
  return raw(`<${n} strokeWidth={1.6} />`);
}
/** Navigation rows: "label | link | icon | section". A non-blank section starts a new heading group; a blank one joins the current group. */
export interface NavEntry {
  label: string;
  href: string;
  icon: string;
  section: string;
}
export function navEntries(value: PropValue | undefined): NavEntry[] {
  return lines(value).map((l) => {
    const [label = "", href = "#", icon = "", section = ""] = splitRow(l);
    return { label, href, icon, section };
  });
}
function navGroups(value: PropValue | undefined) {
  const groups: { label?: string; items: NavEntry[] }[] = [];
  for (const e of navEntries(value)) {
    const last = groups[groups.length - 1];
    if (!last || (e.section && e.section !== last.label)) groups.push({ label: e.section || undefined, items: [e] });
    else last.items.push(e);
  }
  return groups;
}
const navRender = (value: PropValue | undefined) =>
  navGroups(value).map((g) => ({ label: g.label, items: g.items.map((i) => ({ label: i.label, href: i.href, icon: iconEl(i.icon) })) }));
function navCode(value: PropValue | undefined, ctx: CodeCtx) {
  const groups = navGroups(value).map((g) => {
    const items = g.items.map((i) => {
      const ic = iconCode(i.icon, ctx);
      return `{ label: ${JSON.stringify(i.label)}, href: ${JSON.stringify(i.href)}${ic ? `, icon: ${ic.code}` : ""} }`;
    });
    const label = g.label ? `label: ${JSON.stringify(g.label)}, ` : "";
    return `{ ${label}items: [\n${indent(items.join(",\n"), "  ")}\n] }`;
  });
  return raw(`[\n${indent(groups.join(",\n"), "  ")}\n]`);
}
const NAV_FIELDS: FieldDef[] = [
  { key: "brand", label: "Workspace name", kind: "text" },
  {
    key: "nav",
    label: "Navigation",
    kind: "list",
    columns: [
      { key: "label", label: "Label" },
      { key: "href", label: "Link", placeholder: "/path" },
      { key: "icon", label: "Icon", kind: "icon" },
      { key: "section", label: "Section", placeholder: "Heading (optional)" },
    ],
  },
  { key: "current", label: "Current link", kind: "text" },
];
const SIDEBAR_NAV = "Today | /today | CalendarCheck\nLeads | /leads | Users | Sales\nPipeline | /pipeline | Layers |\nQuotes | /quotes | FileText |\nSettings | /settings | Settings | Workspace";
const SIDEBAR_STYLE = { padding: "var(--hg-space-4) 10px", background: "var(--hg-color-sidebar)", borderRight: "1px solid var(--hg-color-border)" };

const fragment = (children: string[]) => (children.length ? `<>\n${indent(children.join("\n"))}\n</>` : undefined);

const TEXT_STYLES = {
  title: { fontSize: "var(--hg-font-size-5xl)", fontWeight: 500, letterSpacing: "-0.02em", margin: 0 },
  heading: { fontSize: "var(--hg-font-size-2xl)", fontWeight: 500, margin: 0 },
  label: { fontSize: "var(--hg-font-size-md)", color: "var(--hg-color-muted)", margin: 0 },
  body: { fontSize: "var(--hg-font-size-lg)", lineHeight: 1.6, margin: 0 },
  muted: { fontSize: "var(--hg-font-size-md)", color: "var(--hg-color-muted)", margin: 0 },
} as const;
const TEXT_TAG = { title: "h1", heading: "h2", label: "h3", body: "p", muted: "p" } as const;

function stackStyle(p: Record<string, PropValue>) {
  const row = p.direction === "row";
  return {
    display: "flex",
    flexDirection: row ? "row" : "column",
    gap: gapVar(p.gap),
    alignItems: p.align && p.align !== "stretch" ? s(p.align) : undefined,
    justifyContent: p.justify && p.justify !== "start" ? (p.justify === "between" ? "space-between" : s(p.justify)) : undefined,
    flexWrap: row && p.wrap ? "wrap" : undefined,
  } as Record<string, string | undefined>;
}
function gridStyle(p: Record<string, PropValue>) {
  const cols = Number(p.columns) || 2;
  const custom = s(p.columnWidths)?.trim();
  return {
    display: "grid",
    gap: gapVar(p.gap),
    gridTemplateColumns: custom || (p.responsive ? `repeat(auto-fit, minmax(${Number(p.minWidth) || 240}px, 1fr))` : `repeat(${cols}, minmax(0, 1fr))`),
    alignItems: "start",
  };
}
/** Grid children can cover several columns: "Column span" in the inspector (1 = default). */
export const SPAN_FIELD: FieldDef = { key: "span", label: "Column span", kind: "number", min: 1, max: 6, help: "How many grid columns this item covers (inside a Grid)." };
const spanOf = (n?: BuilderNode) => Math.min(6, Math.round(Number(n?.props.span)) || 1);
function spanWrap(n: BuilderNode | undefined, child: React.ReactNode) {
  const sp = n ? spanOf(n) : 1;
  return sp > 1 ? <div key={n!.id} style={{ gridColumn: `span ${sp}`, minWidth: 0 }}>{child}</div> : child;
}
function spanCode(n: BuilderNode | undefined, child: string) {
  const sp = n ? spanOf(n) : 1;
  return sp > 1 ? el("div", { style: style({ gridColumn: `span ${sp}`, minWidth: 0 }) }, [child]) : child;
}
export { LAYOUT_FIELDS, layoutStyle, layoutStyleCode } from "./layout";

const PAGE_STYLE = { display: "grid", gap: "var(--hg-space-6)", maxWidth: "var(--hg-layout-content-max)", margin: "0 auto", padding: "var(--hg-space-6) var(--hg-space-4)" };
const SECTION_TITLE = { fontSize: "var(--hg-font-size-md)", fontWeight: 400, color: "var(--hg-color-muted)", margin: 0 };
const FORM_STYLE = { display: "grid", gap: "var(--hg-space-4)" };
const FORM_ACTIONS = { display: "flex", justifyContent: "flex-end", gap: "var(--hg-space-2)" };
const LIST_STYLE = { margin: 0, padding: 0, listStyle: "none" };
const asCss = (o: Record<string, string | number | undefined>) => o as React.CSSProperties;

// ───────────── validation (shared by canvas and generated code)
export const VALIDATIONS = {
  none: null,
  email: { re: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message: "Enter a valid email address" },
  "phone-in": { re: "^[6-9]\\d{9}$", message: "Enter a 10-digit Indian mobile number" },
  gstin: { re: "^\\d{2}[A-Z]{5}\\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", message: "Enter a valid 15-character GSTIN" },
  pincode: { re: "^\\d{6}$", message: "Enter a 6-digit PIN code" },
  number: { re: "^\\d+(\\.\\d+)?$", message: "Enter a number" },
  "min-3": { re: "^[\\s\\S]{3,}$", message: "Use at least 3 characters" },
} as const;
export type ValidationKey = keyof typeof VALIDATIONS;
const FIELD_TYPES = ["input", "textarea", "select", "checkbox", "switch", "radioGroup"];

interface Rule {
  name: string;
  label: string;
  required: boolean;
  validate: ValidationKey;
}
const fieldName = (p: Record<string, PropValue>) => s(p.name) || camel(s(p.label) || "field");
function ruleOf(n: BuilderNode): Rule | null {
  if (!FIELD_TYPES.includes(n.type)) return null;
  return { name: fieldName(n.props), label: s(n.props.label), required: Boolean(n.props.required), validate: (s(n.props.validate) || "none") as ValidationKey };
}
function collectRules(n: BuilderNode): Rule[] {
  return n.children.flatMap((c) => [ruleOf(c), ...collectRules(c)].filter((r): r is Rule => !!r && (r.required || r.validate !== "none")));
}
export function validate(rules: Rule[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const r of rules) {
    const v = (values[r.name] ?? "").trim();
    if (r.required && !v) errors[r.name] = `Enter ${r.label.toLowerCase() || "a value"}`;
    else if (v && r.validate !== "none" && !new RegExp(VALIDATIONS[r.validate]!.re).test(v)) errors[r.name] = VALIDATIONS[r.validate]!.message;
  }
  return errors;
}

/** Form context for the canvas: fields read their error from the nearest form. */
const FormErrorsContext = React.createContext<Record<string, string> | null>(null);
function FieldError({ name, children }: { name: string; children: (error: string | undefined) => React.ReactNode }) {
  const errors = React.useContext(FormErrorsContext);
  return <>{children(errors?.[name])}</>;
}

/** Inside a form: returns the error expression for a field and registers nothing else (rules are collected by the form). */
function formErrorExpr(ctx: CodeCtx, n: BuilderNode) {
  const form = ctx.ancestors.find((a) => a.type === "form");
  if (!form) return undefined;
  const errorsVar = ctx.scope.get(form.id)?.errors as string;
  return raw(`${errorsVar}.${fieldName(n.props)}`);
}

// ───────────── stateful canvas renderers (mirror the generated code)
function TableBlock({ p }: { p: Record<string, PropValue> }) {
  const ds = DATASETS[(s(p.dataset) as DatasetKey) || "leads"] ?? DATASETS.leads;
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const size = Number(p.pageSize) || 5;
  const state = s(p.state) || "data";
  const all = state === "data" ? ds.rows : [];
  const rows = p.paginated ? all.slice((page - 1) * size, page * size) : all;
  const columns: TableColumn<Record<string, string | number>>[] = ds.columns.map((c) => runtimeColumn(c));
  const bulkItems = lines(String(p.bulkItems ?? ""));
  const rowItems = lines(String(p.rowItems ?? ""));
  const table = (
    <Table
      caption={s(p.caption) || ds.label}
      columns={columns}
      rows={rows}
      getRowId={(r) => String(r.id)}
      loading={state === "loading"}
      empty={<EmptyState title={s(p.emptyTitle) || `No ${ds.label.toLowerCase()} yet`} description={s(p.emptyDescription) || undefined} />}
      selectedIds={p.selectable ? selected : undefined}
      onSelectionChange={p.selectable ? setSelected : undefined}
      getRowLabel={(r) => `Select ${r.name}`}
      bulkActions={p.bulkActions && p.selectable ? (count, clear) => (
        <>
          {bulkItems.map((label) => (
            <Button key={label} size="sm" variant="secondary">{label} {count}</Button>
          ))}
          <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
        </>
      ) : undefined}
      rowActions={p.rowActions ? (row) => (
        <>
          {rowItems.map((label) => (
            <IconButton key={label} label={`${label} ${(row as Record<string, unknown>).name ?? ""}`} icon={<span style={{ fontSize: 14 }}>{label.charAt(0)}</span>} size="sm" />
          ))}
        </>
      ) : undefined}
    />
  );
  if (!p.paginated || state !== "data") return table;
  return (
    <div style={{ display: "grid", gap: "var(--hg-space-3)" }}>
      {table}
      <Pagination page={page} pageSize={size} totalItems={all.length} onPageChange={setPage} />
    </div>
  );
}
function runtimeColumn(c: ColumnSpec): TableColumn<Record<string, string | number>> {
  if (c.kind === "person")
    return {
      id: c.id,
      header: c.header,
      cell: (r) => (
        <span style={{ display: "grid" }}>
          <span style={{ fontWeight: 500 }}>{r[c.id]}</span>
          <span style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>{r[c.sub ?? ""]}</span>
        </span>
      ),
    };
  if (c.kind === "status") return { id: c.id, header: c.header, cell: (r) => <StatusBadge status={r[c.id] as StatusKey} /> };
  if (c.kind === "money") return { id: c.id, header: c.header, align: "end", numeric: true, cell: (r) => <MoneyValue amount={Number(r[c.id])} /> };
  return { id: c.id, header: c.header, hideOnMobile: c.hideOnMobile };
}
function codeColumn(c: ColumnSpec): string {
  if (c.kind === "person")
    return `{
  id: "${c.id}",
  header: "${c.header}",
  cell: (row) => (
    <span style={{ display: "grid" }}>
      <span style={{ fontWeight: 500 }}>{row.${c.id}}</span>
      <span style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>{row.${c.sub}}</span>
    </span>
  ),
}`;
  if (c.kind === "status") return `{ id: "${c.id}", header: "${c.header}", cell: (row) => <StatusBadge status={row.${c.id}} /> }`;
  if (c.kind === "money") return `{ id: "${c.id}", header: "${c.header}", align: "end", numeric: true, cell: (row) => <MoneyValue amount={row.${c.id}} /> }`;
  return `{ id: "${c.id}", header: "${c.header}"${c.hideOnMobile ? ", hideOnMobile: true" : ""} }`;
}

function FilterToolbarBlock({ p }: { p: Record<string, PropValue> }) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <FilterToolbar
      query={query}
      onQueryChange={setQuery}
      searchLabel={s(p.placeholder) || "Search"}
      searchPlaceholder={s(p.placeholder)}
      scope={s(p.scope) || undefined}
      chips={lines(p.chips).map((c) => (
        <FilterChip key={c} pressed={active === c} onPressedChange={(on) => setActive(on ? c : null)}>
          {c}
        </FilterChip>
      ))}
    />
  );
}

function parseTasks(v: PropValue | undefined) {
  return lines(v).map((line, i) => {
    const [title = "", context = "", dueRaw = ""] = splitRow(line);
    const overdue = dueRaw.startsWith("!");
    return { id: `t${i + 1}`, title, context, due: overdue ? dueRaw.slice(1).trim() : dueRaw, overdue };
  });
}
function TaskListBlock({ p }: { p: Record<string, PropValue> }) {
  const [done, setDone] = React.useState<Set<string>>(new Set());
  return (
    <ul aria-label="Tasks" style={LIST_STYLE}>
      {parseTasks(p.items).map((t) => (
        <TaskRow
          key={t.id}
          title={t.title}
          context={t.context || undefined}
          due={t.due || undefined}
          overdue={t.overdue}
          done={done.has(t.id)}
          onDoneChange={(isDone) =>
            setDone((prev) => {
              const next = new Set(prev);
              if (isDone) next.add(t.id);
              else next.delete(t.id);
              return next;
            })
          }
        />
      ))}
    </ul>
  );
}

function FormBlock({ p, node: n, children }: { p: Record<string, PropValue>; node: BuilderNode; children: React.ReactNode[] }) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState(false);
  return (
    <FormErrorsContext.Provider value={errors}>
      <form
        noValidate
        style={asCss(FORM_STYLE)}
        onSubmit={(e) => {
          e.preventDefault();
          const values = Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
          const next = validate(collectRules(n), values);
          setErrors(next);
          setSaved(Object.keys(next).length === 0);
        }}
        onReset={() => {
          setErrors({});
          setSaved(false);
        }}
      >
        {children}
        <div style={asCss(FORM_ACTIONS)}>
          {saved && (
            <span role="status" style={{ alignSelf: "center", marginRight: "auto", fontSize: 13, color: "var(--hg-color-success-ink)" }}>
              {s(p.successMessage) || "Saved"} (demo)
            </span>
          )}
          {p.cancelLabel && (
            <Button type="reset" variant="secondary">
              {s(p.cancelLabel)}
            </Button>
          )}
          <Button type="submit">{s(p.submitLabel) || "Save"}</Button>
        </div>
      </form>
    </FormErrorsContext.Provider>
  );
}

function ToastButtonBlock({ p }: { p: Record<string, PropValue> }) {
  const { toast } = useToast();
  return (
    <Button
      variant={(s(p.variant) || "secondary") as ButtonVariant}
      onClick={() => toast({ title: s(p.title), description: s(p.description) || undefined, tone: (s(p.tone) || "success") as ToastTone })}
    >
      {s(p.label)}
    </Button>
  );
}

/** Dialog / drawer: in edit mode the content renders inline (so it can be selected and edited). */
function OverlayBlock({ p, kind, children }: { p: Record<string, PropValue>; kind: "dialog" | "drawer"; children: React.ReactNode[] }) {
  const mode = React.useContext(CanvasModeContext);
  const trigger = <Button variant={(s(p.triggerVariant) || "secondary") as ButtonVariant}>{s(p.triggerLabel) || "Open"}</Button>;
  const footer = (
    <>
      {p.cancelLabel &&
        (kind === "dialog" ? (
          <DialogClose render={<Button variant="secondary" />}>{s(p.cancelLabel)}</DialogClose>
        ) : (
          <DrawerClose render={<Button variant="secondary" />}>{s(p.cancelLabel)}</DrawerClose>
        ))}
      {p.confirmLabel && <Button>{s(p.confirmLabel)}</Button>}
    </>
  );
  if (mode === "edit") {
    return (
      <div className="b-overlay-preview">
        {trigger}
        <div className="b-overlay-preview__panel" data-kind={kind}>
          <p className="b-overlay-preview__note">
            {kind === "dialog" ? "Dialog" : `Drawer (${s(p.side) || "right"})`} content — opens from the button. Switch to Interact mode to try it.
          </p>
          <p className="b-overlay-preview__title">{s(p.title)}</p>
          {p.description && <p className="b-overlay-preview__desc">{s(p.description)}</p>}
          <div style={{ display: "grid", gap: 12 }}>{children}</div>
          {(p.cancelLabel || p.confirmLabel) && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {p.cancelLabel && <Button variant="secondary">{s(p.cancelLabel)}</Button>}
              {p.confirmLabel && <Button>{s(p.confirmLabel)}</Button>}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (kind === "dialog")
    return (
      <Dialog>
        <DialogTrigger render={trigger} />
        <DialogContent title={s(p.title)} description={s(p.description) || undefined} footer={p.cancelLabel || p.confirmLabel ? footer : undefined}>
          <div style={{ display: "grid", gap: 12 }}>{children}</div>
        </DialogContent>
      </Dialog>
    );
  return (
    <Drawer>
      <DrawerTrigger render={trigger} />
      <DrawerContent
        side={(s(p.side) || "right") as "right" | "left" | "bottom"}
        title={s(p.title)}
        description={s(p.description) || undefined}
        footer={p.cancelLabel || p.confirmLabel ? footer : undefined}
      >
        <div style={{ display: "grid", gap: 12 }}>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
function overlayCode(kind: "dialog" | "drawer", n: BuilderNode, c: string[], ctx: CodeCtx) {
  const p = n.props;
  const [Root, Trigger, Content, Close] = kind === "dialog" ? ["Dialog", "DialogTrigger", "DialogContent", "DialogClose"] : ["Drawer", "DrawerTrigger", "DrawerContent", "DrawerClose"];
  [Root, Trigger, Content].forEach((x) => ctx.use(x!));
  ctx.use("Button");
  const footerParts: string[] = [];
  if (p.cancelLabel) {
    ctx.use(Close!);
    footerParts.push(el(Close!, { render: raw(`<Button variant="secondary" />`) }, [text(s(p.cancelLabel))]));
  }
  if (p.confirmLabel) footerParts.push(el("Button", {}, [text(s(p.confirmLabel))]));
  const variant = s(p.triggerVariant) || "secondary";
  return el(Root!, {}, [
    el(Trigger!, { render: raw(`<Button${variant !== "primary" ? ` variant="${variant}"` : ""} />`) }, [text(s(p.triggerLabel) || "Open")]),
    el(
      Content!,
      {
        side: kind === "drawer" && p.side && p.side !== "right" ? s(p.side) : undefined,
        title: s(p.title),
        description: s(p.description),
        footer: footerParts.length ? raw(fragment(footerParts)!) : undefined,
      },
      c.length ? [el("div", { style: style({ display: "grid", gap: "var(--hg-space-3)" }) }, c)] : [],
    ),
  ]);
}

const parsePairs = (v: PropValue | undefined, sep: string) =>
  lines(v).map((l) => {
    const i = l.indexOf(sep);
    return i < 0 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + sep.length).trim()];
  });

function parseConversations(v: PropValue | undefined) {
  const channels: Channel[] = ["whatsapp", "email", "sms", "call", "missed_call", "web_form", "indiamart", "in_person"];
  return lines(v).map((line, i) => {
    const [name = "", preview = "", channel = "whatsapp", time = "", unread = "0"] = splitRow(line);
    return {
      id: `c${i + 1}`,
      name,
      preview,
      channel: (channels.includes(channel as Channel) ? channel : "whatsapp") as Channel,
      time,
      unread: Number(unread) || 0,
    };
  });
}

function skeletonLines(variant: string, count: number) {
  return Array.from({ length: Math.max(1, Math.min(count, 12)) }, (_, i) => i);
}

const metric = (label: string, value: string, hint = "", icon = "none", tone = "default") => node("metric", { label, value, hint, icon, tone });
const field = (label: string, extra: Record<string, PropValue> = {}) =>
  node("input", { label, placeholder: "", description: "", required: false, type: "text", name: "", validate: "none", ...extra });

const VALIDATE_FIELD: FieldDef = { key: "validate", label: "Validation", kind: "select", options: Object.keys(VALIDATIONS), help: "Checked on submit inside a Form." };
const NAME_FIELD: FieldDef = { key: "name", label: "Field name", kind: "text", help: "Form key. Defaults to the label in camelCase." };

// ───────────── registry
export const BLOCKS: BlockDef[] = [
  // Layout
  {
    type: "page",
    label: "Page",
    category: "Layout",
    description: "Page container: 1180px max width, 24px vertical rhythm.",
    container: true,
    rootOnly: true,
    defaults: {},
    fields: [],
    render: (_p, c) => <div style={asCss(PAGE_STYLE)}>{c}</div>,
    code: (_n, c) => el("div", { style: style(PAGE_STYLE) }, c),
  },
  {
    type: "appShell",
    label: "App layout",
    category: "Layout",
    description: "Sidebar navigation + main content, like the HeiGin CRM shell.",
    container: true,
    rootOnly: true,
    defaults: {
      brand: "Northwind",
      nav: "Today | /today | CalendarCheck\nLeads | /leads | Users\nPipeline | /pipeline | Layers\nQuotes | /quotes | FileText\nSettings | /settings | Settings",
      current: "/leads",
    },
    fields: NAV_FIELDS,
    render: (p, c) => (
      <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", minHeight: 560 }}>
        <aside style={SIDEBAR_STYLE}>
          <p style={{ margin: "0 8px 16px", fontWeight: 600, fontSize: 14 }}>{s(p.brand)}</p>
          <SidebarNav currentHref={s(p.current)} groups={navRender(p.nav)} />
        </aside>
        <main style={asCss(PAGE_STYLE)}>{c}</main>
      </div>
    ),
    code: (n, c, ctx) => {
      ctx.use("SidebarNav");
      return el("div", { style: style({ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", minHeight: "100dvh" }) }, [
        el("aside", { style: style(SIDEBAR_STYLE) }, [
          el("p", { style: style({ margin: "0 8px 16px", fontWeight: 600, fontSize: 14 }) }, [text(s(n.props.brand))]),
          el("SidebarNav", { currentHref: s(n.props.current), groups: navCode(n.props.nav, ctx) }),
        ]),
        el("main", { style: style(PAGE_STYLE) }, c),
      ]);
    },
  },
  {
    type: "sidebar",
    label: "Sidebar",
    category: "Layout",
    description: "Navigation sidebar only: brand, grouped links with icons, current page.",
    defaults: { brand: "Northwind", nav: SIDEBAR_NAV, current: "/leads" },
    fields: NAV_FIELDS,
    render: (p) => (
      <aside style={{ ...SIDEBAR_STYLE, width: 240, boxSizing: "border-box", minHeight: 560 }}>
        <p style={{ margin: "0 8px 16px", fontWeight: 600, fontSize: 14 }}>{s(p.brand)}</p>
        <SidebarNav currentHref={s(p.current)} groups={navRender(p.nav)} />
      </aside>
    ),
    code: (n, _c, ctx) => {
      ctx.use("SidebarNav");
      return el("aside", { style: style({ ...SIDEBAR_STYLE, width: "240px", boxSizing: "border-box", minHeight: "100dvh" }) }, [
        el("p", { style: style({ margin: "0 8px 16px", fontWeight: 600, fontSize: 14 }) }, [text(s(n.props.brand))]),
        el("SidebarNav", { currentHref: s(n.props.current), groups: navCode(n.props.nav, ctx) }),
      ]);
    },
  },
  {
    type: "fragment",
    label: "Component",
    category: "Layout",
    description: "Single-component root.",
    container: true,
    rootOnly: true,
    defaults: {},
    fields: [],
    render: (_p, c) => <div style={{ display: "grid", gap: 16, alignItems: "start", justifyItems: "start" }}>{c}</div>,
    code: (_n, c) => (c.length === 1 ? c[0]! : (fragment(c) ?? "null")),
  },
  {
    type: "section",
    label: "Section",
    category: "Layout",
    description: "Group with an optional small heading (production card/section title style).",
    container: true,
    defaults: { title: "Section", gap: "4" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "gap", label: "Gap", kind: "select", options: SPACE },
    ],
    render: (p, c) => (
      <section style={{ display: "grid", gap: gapVar(p.gap) }}>
        {p.title && <h2 style={asCss(SECTION_TITLE)}>{s(p.title)}</h2>}
        {c}
      </section>
    ),
    code: (n, c) =>
      el("section", { style: style({ display: "grid", gap: gapVar(n.props.gap) }) }, [
        n.props.title ? el("h2", { style: style(SECTION_TITLE) }, [text(s(n.props.title))]) : "",
        ...c,
      ]),
  },
  {
    type: "stack",
    label: "Stack",
    category: "Layout",
    description: "Vertical or horizontal flex group.",
    container: true,
    defaults: { direction: "column", gap: "3", align: "stretch", justify: "start", wrap: false },
    fields: [
      { key: "direction", label: "Direction", kind: "select", options: ["column", "row"] },
      { key: "gap", label: "Gap", kind: "select", options: SPACE },
      { key: "align", label: "Align", kind: "select", options: ["stretch", "start", "center", "end"] },
      { key: "justify", label: "Justify", kind: "select", options: ["start", "center", "end", "between"] },
      { key: "wrap", label: "Wrap (row)", kind: "boolean" },
    ],
    render: (p, c) => <div style={asCss(stackStyle(p))}>{c}</div>,
    code: (n, c) => el("div", { style: style(stackStyle(n.props)) }, c),
  },
  {
    type: "grid",
    label: "Grid",
    category: "Layout",
    description: "Columns. Responsive mode wraps columns on narrow screens.",
    container: true,
    defaults: { columns: 2, responsive: true, minWidth: 280, gap: "4", columnWidths: "" },
    fields: [
      { key: "columns", label: "Columns", kind: "number", min: 1, max: 6, help: "Used when Responsive is off and Column widths is empty." },
      { key: "responsive", label: "Responsive", kind: "boolean" },
      { key: "minWidth", label: "Min column width (px)", kind: "number", min: 120, max: 600 },
      { key: "gap", label: "Gap", kind: "select", options: SPACE },
      { key: "columnWidths", label: "Column widths", kind: "text", help: "Custom grid-template-columns, e.g. \"1fr 2fr\" or \"200px 1fr auto\". Overrides Columns/Responsive when set." },
    ],
    render: (p, c, n) => <div style={asCss(gridStyle(p))}>{c.map((child, i) => spanWrap(n?.children[i], child))}</div>,
    code: (n, c) => el("div", { style: style(gridStyle(n.props)) }, c.map((child, i) => spanCode(n.children[i], child))),
  },
  {
    type: "card",
    label: "Card",
    category: "Layout",
    description: "Bordered surface with optional header.",
    container: true,
    defaults: { title: "Card title", description: "", padding: "md" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "padding", label: "Padding", kind: "select", options: ["none", "sm", "md", "lg"] },
    ],
    render: (p, c) => (
      <Card padding={(s(p.padding) || "md") as "none" | "sm" | "md" | "lg"}>
        {p.title && <CardHeader title={s(p.title)} description={s(p.description) || undefined} />}
        {c}
      </Card>
    ),
    code: (n, c, ctx) => {
      ctx.use("Card");
      const head = n.props.title ? (ctx.use("CardHeader"), el("CardHeader", { title: s(n.props.title), description: s(n.props.description) })) : "";
      return el("Card", { padding: n.props.padding !== "md" ? s(n.props.padding) : undefined }, [head, ...c]);
    },
  },
  // Content
  {
    type: "text",
    label: "Text",
    category: "Content",
    description: "Heading or paragraph.",
    defaults: { variant: "body", text: "Write something useful here." },
    fields: [
      { key: "variant", label: "Style", kind: "select", options: ["title", "heading", "label", "body", "muted"] },
      { key: "text", label: "Text", kind: "textarea" },
    ],
    render: (p) => {
      const v = (s(p.variant) || "body") as keyof typeof TEXT_STYLES;
      const Tag = TEXT_TAG[v];
      return <Tag style={asCss(TEXT_STYLES[v])}>{s(p.text)}</Tag>;
    },
    code: (n) => {
      const v = (s(n.props.variant) || "body") as keyof typeof TEXT_STYLES;
      return el(TEXT_TAG[v], { style: style(TEXT_STYLES[v]) }, [text(s(n.props.text))]);
    },
  },
  {
    type: "divider",
    label: "Divider",
    category: "Content",
    description: "Hairline separator.",
    defaults: {},
    fields: [],
    render: () => <hr style={{ border: 0, borderTop: "1px solid var(--hg-color-border)", margin: 0 }} />,
    code: () => el("hr", { style: style({ border: 0, borderTop: "1px solid var(--hg-color-border)", margin: 0 }) }),
  },
  {
    type: "emptyState",
    label: "Empty state",
    category: "Content",
    description: "Explains an empty view and offers the next step.",
    defaults: { title: "No leads yet", description: "New enquiries will appear here.", actionLabel: "Add lead" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "actionLabel", label: "Action label (blank = none)", kind: "text" },
    ],
    render: (p) => (
      <EmptyState title={s(p.title)} description={s(p.description) || undefined} action={p.actionLabel ? <Button size="sm">{s(p.actionLabel)}</Button> : undefined} />
    ),
    code: (n, _c, ctx) => {
      ctx.use("EmptyState");
      const action = n.props.actionLabel ? (ctx.use("Button"), raw(el("Button", { size: "sm" }, [text(s(n.props.actionLabel))]))) : undefined;
      return el("EmptyState", { title: s(n.props.title), description: s(n.props.description), action });
    },
  },
  {
    type: "loadingState",
    label: "Loading state",
    category: "Content",
    description: "Skeleton placeholder for a list, cards or a page while data loads.",
    defaults: { variant: "list", count: 4, label: "Loading leads" },
    fields: [
      { key: "variant", label: "Shape", kind: "select", options: ["list", "cards", "page"] },
      { key: "count", label: "Items", kind: "number", min: 1, max: 12 },
      { key: "label", label: "Accessible label", kind: "text" },
    ],
    render: (p) => {
      const v = s(p.variant) || "list";
      const items = skeletonLines(v, Number(p.count) || 4);
      if (v === "cards")
        return (
          <div aria-busy="true" aria-label={s(p.label)} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {items.map((i) => (
              <Card key={i}>
                <div style={{ display: "grid", gap: 8 }}>
                  <Skeleton shape="text" width="40%" />
                  <Skeleton height={24} width="60%" />
                  <Skeleton shape="text" width="80%" />
                </div>
              </Card>
            ))}
          </div>
        );
      if (v === "page")
        return (
          <div aria-busy="true" aria-label={s(p.label)} style={{ display: "grid", gap: 16 }}>
            <Skeleton height={28} width="30%" />
            <Skeleton shape="text" width="50%" />
            <Skeleton height={120} />
            {items.map((i) => (
              <Skeleton key={i} height={40} />
            ))}
          </div>
        );
      return (
        <div aria-busy="true" aria-label={s(p.label)} style={{ display: "grid", gap: 12 }}>
          {items.map((i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Skeleton shape="circle" />
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                <Skeleton shape="text" width="45%" />
                <Skeleton shape="text" width="70%" />
              </div>
            </div>
          ))}
        </div>
      );
    },
    code: (n, _c, ctx) => {
      ctx.use("Skeleton");
      const v = s(n.props.variant) || "list";
      const count = Math.max(1, Math.min(Number(n.props.count) || 4, 12));
      const busy = { "aria-busy": raw("true"), "aria-label": s(n.props.label) };
      if (v === "cards") {
        ctx.use("Card");
        return el("div", { ...busy, style: style({ display: "grid", gap: "var(--hg-space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }) }, [
          `{Array.from({ length: ${count} }, (_, i) => (\n  <Card key={i}>\n    <div style={{ display: "grid", gap: 8 }}>\n      <Skeleton shape="text" width="40%" />\n      <Skeleton height={24} width="60%" />\n      <Skeleton shape="text" width="80%" />\n    </div>\n  </Card>\n))}`,
        ]);
      }
      if (v === "page")
        return el("div", { ...busy, style: style({ display: "grid", gap: "var(--hg-space-4)" }) }, [
          `<Skeleton height={28} width="30%" />`,
          `<Skeleton shape="text" width="50%" />`,
          `<Skeleton height={120} />`,
          `{Array.from({ length: ${count} }, (_, i) => (\n  <Skeleton key={i} height={40} />\n))}`,
        ]);
      return el("div", { ...busy, style: style({ display: "grid", gap: "var(--hg-space-3)" }) }, [
        `{Array.from({ length: ${count} }, (_, i) => (\n  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>\n    <Skeleton shape="circle" />\n    <div style={{ flex: 1, display: "grid", gap: 6 }}>\n      <Skeleton shape="text" width="45%" />\n      <Skeleton shape="text" width="70%" />\n    </div>\n  </div>\n))}`,
      ]);
    },
  },
  {
    type: "errorState",
    label: "Error state",
    category: "Content",
    description: "Something failed to load, with a retry action.",
    defaults: { title: "Couldn't load leads", description: "Check your connection and try again.", retryLabel: "Try again" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "retryLabel", label: "Retry label (blank = none)", kind: "text" },
    ],
    render: (p) => (
      <EmptyState
        role="alert"
        icon={<TriangleAlert strokeWidth={1.6} />}
        title={s(p.title)}
        description={s(p.description) || undefined}
        action={p.retryLabel ? <Button size="sm" variant="secondary">{s(p.retryLabel)}</Button> : undefined}
      />
    ),
    code: (n, _c, ctx) => {
      ctx.use("EmptyState");
      ctx.use("TriangleAlert", "lucide-react");
      const action = n.props.retryLabel ? (ctx.use("Button"), raw(el("Button", { size: "sm", variant: "secondary" }, [text(s(n.props.retryLabel))]))) : undefined;
      return el("EmptyState", { role: "alert", icon: raw(`<TriangleAlert strokeWidth={1.6} />`), title: s(n.props.title), description: s(n.props.description), action });
    },
  },
  // Actions
  {
    type: "button",
    label: "Button",
    category: "Actions",
    description: "Primary, secondary, ghost, danger or link action.",
    defaults: { label: "New lead", variant: "primary", size: "md", icon: "Plus", iconPosition: "leading", disabled: false, fullWidth: false },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "variant", label: "Variant", kind: "select", options: ["primary", "secondary", "ghost", "danger", "link"] },
      { key: "size", label: "Size", kind: "select", options: ["sm", "md", "lg"] },
      { key: "icon", label: "Icon", kind: "icon" },
      { key: "iconPosition", label: "Icon position", kind: "select", options: ["leading", "trailing"] },
      { key: "disabled", label: "Disabled", kind: "boolean" },
      { key: "fullWidth", label: "Full width", kind: "boolean" },
    ],
    render: (p) => {
      const icon = iconEl(p.icon);
      return (
        <Button
          variant={(s(p.variant) || "primary") as ButtonVariant}
          size={(s(p.size) || "md") as ButtonSize}
          disabled={Boolean(p.disabled)}
          fullWidth={Boolean(p.fullWidth)}
          leadingIcon={p.iconPosition !== "trailing" ? icon : undefined}
          trailingIcon={p.iconPosition === "trailing" ? icon : undefined}
        >
          {s(p.label)}
        </Button>
      );
    },
    code: (n, _c, ctx) => {
      ctx.use("Button");
      const p = n.props;
      const icon = iconCode(p.icon, ctx);
      return el(
        "Button",
        {
          variant: p.variant !== "primary" ? s(p.variant) : undefined,
          size: p.size !== "md" ? s(p.size) : undefined,
          leadingIcon: p.iconPosition !== "trailing" ? icon : undefined,
          trailingIcon: p.iconPosition === "trailing" ? icon : undefined,
          disabled: Boolean(p.disabled),
          fullWidth: Boolean(p.fullWidth),
        },
        [text(s(p.label))],
      );
    },
  },
  {
    type: "iconButton",
    label: "Icon button",
    category: "Actions",
    description: "Square icon-only button with a required label.",
    defaults: { label: "Edit", icon: "Pencil", variant: "ghost", size: "md" },
    fields: [
      { key: "label", label: "Accessible label", kind: "text" },
      { key: "icon", label: "Icon", kind: "icon" },
      { key: "variant", label: "Variant", kind: "select", options: ["ghost", "secondary", "primary", "danger"] },
      { key: "size", label: "Size", kind: "select", options: ["sm", "md", "lg"] },
    ],
    render: (p) => (
      <IconButton label={s(p.label)} icon={iconEl(p.icon) ?? iconEl("Pencil")} variant={s(p.variant) as ButtonVariant} size={s(p.size) as ButtonSize} />
    ),
    code: (n, _c, ctx) => {
      ctx.use("IconButton");
      return el("IconButton", {
        label: s(n.props.label),
        icon: iconCode(n.props.icon, ctx) ?? iconCode("Pencil", ctx),
        variant: n.props.variant !== "ghost" ? s(n.props.variant) : undefined,
        size: n.props.size !== "md" ? s(n.props.size) : undefined,
      });
    },
  },
  {
    type: "dropdownMenu",
    label: "Dropdown menu",
    category: "Actions",
    description: "Button that opens a list of actions. Prefix an item with ! for a destructive action.",
    defaults: { triggerLabel: "Actions", items: "Edit\nAssign owner\nDuplicate\n!Delete" },
    fields: [
      { key: "triggerLabel", label: "Button label", kind: "text" },
      { key: "items", label: "Items", kind: "list", columns: [{ key: "label", label: "Item (prefix ! for danger)" }] },
    ],
    render: (p) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" trailingIcon={<ChevronDown strokeWidth={1.6} />} />}>{s(p.triggerLabel)}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {lines(p.items).map((item) => (
            <DropdownMenuItem key={item} tone={item.startsWith("!") ? "danger" : "default"}>
              {item.replace(/^!\s*/, "")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    code: (n, _c, ctx) => {
      ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem", "Button"].forEach((x) => ctx.use(x));
      ctx.use("ChevronDown", "lucide-react");
      return el("DropdownMenu", {}, [
        el("DropdownMenuTrigger", { render: raw(`<Button variant="secondary" trailingIcon={<ChevronDown strokeWidth={1.6} />} />`) }, [text(s(n.props.triggerLabel))]),
        el(
          "DropdownMenuContent",
          {},
          lines(n.props.items).map((item) => el("DropdownMenuItem", { tone: item.startsWith("!") ? "danger" : undefined }, [text(item.replace(/^!\s*/, ""))])),
        ),
      ]);
    },
  },
  {
    type: "toastButton",
    label: "Toast button",
    category: "Actions",
    description: "Button that shows a toast. Needs <ToastProvider> near your app root.",
    defaults: { label: "Save", variant: "primary", title: "Lead saved", description: "Asha Rao was added to New.", tone: "success" },
    fields: [
      { key: "label", label: "Button label", kind: "text" },
      { key: "variant", label: "Variant", kind: "select", options: ["primary", "secondary", "ghost"] },
      { key: "title", label: "Toast title", kind: "text" },
      { key: "description", label: "Toast description", kind: "text" },
      { key: "tone", label: "Toast tone", kind: "select", options: ["neutral", "success", "warning", "danger", "info"] },
    ],
    render: (p) => <ToastButtonBlock p={p} />,
    code: (n, _c, ctx) => {
      ctx.use("Button");
      ctx.use("useToast");
      if (!ctx.scope.has("__toast")) {
        ctx.scope.set("__toast", {});
        ctx.hook(`const { toast } = useToast(); // requires <ToastProvider> near your app root`);
      }
      const p = n.props;
      const opts = literal({ title: s(p.title), ...(p.description ? { description: s(p.description) } : {}), tone: s(p.tone) || "success" });
      return el("Button", { variant: p.variant !== "primary" ? s(p.variant) : undefined, onClick: raw(`() => toast(${opts})`) }, [text(s(p.label))]);
    },
  },
  // Forms
  {
    type: "form",
    label: "Form",
    category: "Forms",
    description: "Validated form: fields inside are checked on submit (required + validation rules).",
    container: true,
    accepts: ["input", "textarea", "select", "checkbox", "switch", "radioGroup", "grid", "stack", "text", "divider"],
    defaults: { submitLabel: "Save", cancelLabel: "Cancel", successMessage: "Saved" },
    fields: [
      { key: "submitLabel", label: "Submit label", kind: "text" },
      { key: "cancelLabel", label: "Cancel label (blank = none)", kind: "text" },
      { key: "successMessage", label: "Success message (canvas)", kind: "text" },
    ],
    defaultChildren: () => [
      field("Name", { required: true, placeholder: "Asha Rao" }),
      field("Mobile", { required: true, validate: "phone-in", placeholder: "98765 43210", description: "Used for WhatsApp updates" }),
      field("Email", { validate: "email", type: "email" }),
    ],
    render: (p, c, n) => (
      <FormBlock p={p} node={n}>
        {c}
      </FormBlock>
    ),
    enter: (n, ctx) => {
      ctx.scope.set(n.id, { errors: ctx.name("errors") });
    },
    code: (n, c, ctx) => {
      ctx.use("Button");
      ctx.use("type FormEvent", "react");
      const errors = ctx.scope.get(n.id)!.errors as string;
      const setErrors = setter(errors);
      const onSubmit = ctx.prop("onSubmit", "(values: Record<string, string>) => void | Promise<void>", { optional: true, kind: "callback" });
      const handler = ctx.name("handleSubmit");
      const checks = collectRules(n).map((r) => {
        const v = `values.${r.name}`;
        const parts: string[] = [];
        if (r.required) parts.push(`if (!${v}?.trim()) next.${r.name} = ${JSON.stringify(`Enter ${r.label.toLowerCase() || "a value"}`)};`);
        const rule = r.validate !== "none" ? VALIDATIONS[r.validate] : null;
        if (rule) parts.push(`${r.required ? "else " : ""}if (${v} && !/${rule.re}/.test(${v})) next.${r.name} = ${JSON.stringify(rule.message)};`);
        return parts.join("\n");
      });
      ctx.hook(`const [${errors}, ${setErrors}] = useState<Record<string, string>>({});`);
      ctx.hook(
        [
          `const ${handler} = (event: FormEvent<HTMLFormElement>) => {`,
          `  event.preventDefault();`,
          `  const values = Object.fromEntries([...new FormData(event.currentTarget).entries()].map(([k, v]) => [k, String(v)]));`,
          `  const next: Record<string, string> = {};`,
          ...checks.map((x) => indent(x)),
          `  ${setErrors}(next);`,
          `  if (Object.keys(next).length === 0) void ${onSubmit}?.(values);`,
          `};`,
        ].join("\n"),
      );
      const actions: string[] = [];
      if (n.props.cancelLabel) actions.push(el("Button", { type: "reset", variant: "secondary" }, [text(s(n.props.cancelLabel))]));
      actions.push(el("Button", { type: "submit" }, [text(s(n.props.submitLabel) || "Save")]));
      return el("form", { noValidate: true, onSubmit: raw(handler), onReset: raw(`() => ${setErrors}({})`), style: style(FORM_STYLE) }, [
        ...c,
        el("div", { style: style(FORM_ACTIONS) }, actions),
      ]);
    },
  },
  {
    type: "input",
    label: "Text field",
    category: "Forms",
    description: "Labelled input with helper text and validation.",
    defaults: { label: "Company", placeholder: "Kaveri Textiles", description: "", required: false, type: "text", name: "", validate: "none" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      { key: "description", label: "Helper text", kind: "text" },
      { key: "type", label: "Type", kind: "select", options: ["text", "email", "tel", "number", "password"] },
      { key: "required", label: "Required", kind: "boolean" },
      VALIDATE_FIELD,
      NAME_FIELD,
    ],
    render: (p) => (
      <FieldError name={fieldName(p)}>
        {(error) => (
          <Field label={s(p.label)} description={s(p.description) || undefined} required={Boolean(p.required)} error={error}>
            <Input name={fieldName(p)} placeholder={s(p.placeholder)} type={s(p.type) || "text"} />
          </Field>
        )}
      </FieldError>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("Input");
      const p = n.props;
      return el("Field", { label: s(p.label), description: s(p.description), required: Boolean(p.required), error: formErrorExpr(ctx, n) }, [
        el("Input", { name: fieldName(p), placeholder: s(p.placeholder), type: p.type !== "text" ? s(p.type) : undefined }),
      ]);
    },
  },
  {
    type: "textarea",
    label: "Text area",
    category: "Forms",
    description: "Multi-line field.",
    defaults: { label: "Notes", placeholder: "", rows: 4, required: false, name: "", validate: "none" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      { key: "rows", label: "Rows", kind: "number", min: 2, max: 12 },
      { key: "required", label: "Required", kind: "boolean" },
      VALIDATE_FIELD,
      NAME_FIELD,
    ],
    render: (p) => (
      <FieldError name={fieldName(p)}>
        {(error) => (
          <Field label={s(p.label)} required={Boolean(p.required)} error={error}>
            <Textarea name={fieldName(p)} placeholder={s(p.placeholder)} rows={Number(p.rows) || 4} />
          </Field>
        )}
      </FieldError>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("Textarea");
      const p = n.props;
      return el("Field", { label: s(p.label), required: Boolean(p.required), error: formErrorExpr(ctx, n) }, [
        el("Textarea", { name: fieldName(p), placeholder: s(p.placeholder), rows: Number(p.rows) || 4 }),
      ]);
    },
  },
  {
    type: "select",
    label: "Select",
    category: "Forms",
    description: "Single-value picker with a custom listbox, built on Base UI Select.",
    defaults: { label: "Owner", options: "Unassigned\nMeera S\nArjun K\nRitu P", required: false, name: "", placeholder: "Select…" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      { key: "options", label: "Options", kind: "list", columns: [{ key: "label", label: "Option" }] },
      { key: "required", label: "Required", kind: "boolean" },
      NAME_FIELD,
    ],
    render: (p) => (
      <FieldError name={fieldName(p)}>
        {(error) => (
          <Field label={s(p.label)} required={Boolean(p.required)} error={error}>
            <Select
              name={fieldName(p)}
              placeholder={s(p.placeholder) || "Select…"}
              options={lines(p.options).map((o) => ({ value: slug(o), label: o }))}
            />
          </Field>
        )}
      </FieldError>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("Select");
      ctx.useType("SelectOption");
      const p = n.props;
      const optionsName = ctx.name(`${camel(s(p.label))}Options`);
      const optionsArr = lines(p.options).map((o) => `{ value: "${slug(o)}", label: "${text(o)}" }`);
      ctx.hoist(`const ${optionsName}: SelectOption[] = [\n${indent(optionsArr.join(",\n"))},\n];`);
      return el("Field", { label: s(p.label), required: Boolean(p.required), error: formErrorExpr(ctx, n) }, [
        el("Select", { name: fieldName(p), placeholder: s(p.placeholder) || undefined, options: raw(optionsName) }),
      ]);
    },
  },
  {
    type: "checkbox",
    label: "Checkbox",
    category: "Forms",
    description: "Labelled checkbox.",
    defaults: { label: "Send WhatsApp updates", description: "", defaultChecked: true, name: "" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "defaultChecked", label: "Checked by default", kind: "boolean" },
      NAME_FIELD,
    ],
    render: (p) => <Checkbox name={fieldName(p)} label={s(p.label)} description={s(p.description) || undefined} defaultChecked={Boolean(p.defaultChecked)} />,
    code: (n, _c, ctx) => {
      ctx.use("Checkbox");
      const p = n.props;
      return el("Checkbox", { name: fieldName(p), label: s(p.label), description: s(p.description), defaultChecked: Boolean(p.defaultChecked) });
    },
  },
  {
    type: "switch",
    label: "Switch",
    category: "Forms",
    description: "Setting that applies immediately.",
    defaults: { label: "Auto-assign new leads", description: "", defaultChecked: true, name: "" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "defaultChecked", label: "On by default", kind: "boolean" },
      NAME_FIELD,
    ],
    render: (p) => <Switch name={fieldName(p)} label={s(p.label)} description={s(p.description) || undefined} defaultChecked={Boolean(p.defaultChecked)} />,
    code: (n, _c, ctx) => {
      ctx.use("Switch");
      const p = n.props;
      return el("Switch", { name: fieldName(p), label: s(p.label), description: s(p.description), defaultChecked: Boolean(p.defaultChecked) });
    },
  },
  {
    type: "radioGroup",
    label: "Radio group",
    category: "Forms",
    description: "Mutually exclusive options.",
    defaults: { label: "Preferred channel", options: "WhatsApp\nEmail\nPhone call", orientation: "vertical", name: "" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "options", label: "Options", kind: "list", columns: [{ key: "label", label: "Option" }] },
      { key: "orientation", label: "Orientation", kind: "select", options: ["vertical", "horizontal"] },
      NAME_FIELD,
    ],
    render: (p) => {
      const opts = lines(p.options).map((o) => ({ value: slug(o), label: o }));
      return (
        <RadioGroup
          name={fieldName(p)}
          label={s(p.label)}
          options={opts}
          defaultValue={opts[0]?.value}
          orientation={p.orientation === "horizontal" ? "horizontal" : "vertical"}
        />
      );
    },
    code: (n, _c, ctx) => {
      ctx.use("RadioGroup");
      const opts = lines(n.props.options).map((o) => ({ value: slug(o), label: o }));
      return el("RadioGroup", {
        name: fieldName(n.props),
        label: s(n.props.label),
        options: raw(literal(opts)),
        defaultValue: opts[0]?.value,
        orientation: n.props.orientation === "horizontal" ? "horizontal" : undefined,
      });
    },
  },
  // Data
  {
    type: "tabs",
    label: "Tabs",
    category: "Data",
    description: "Pill tabs or filters (production style).",
    defaults: { tabs: "Overview\nActivity\nQuotes", variant: "pill" },
    fields: [
      { key: "tabs", label: "Tabs", kind: "list", columns: [{ key: "label", label: "Tab" }] },
      { key: "variant", label: "Variant", kind: "select", options: ["pill", "underline"] },
    ],
    render: (p) => {
      const tabs = lines(p.tabs);
      return (
        <Tabs defaultValue={slug(tabs[0] ?? "tab")}>
          <TabsList variant={p.variant === "underline" ? "underline" : "pill"} aria-label="Sections">
            {tabs.map((t) => (
              <Tab key={t} value={slug(t)}>
                {t}
              </Tab>
            ))}
          </TabsList>
        </Tabs>
      );
    },
    code: (n, _c, ctx) => {
      ctx.use("Tabs");
      ctx.use("TabsList");
      ctx.use("Tab");
      const tabs = lines(n.props.tabs);
      return el("Tabs", { defaultValue: slug(tabs[0] ?? "tab") }, [
        el(
          "TabsList",
          { variant: n.props.variant === "underline" ? "underline" : undefined, "aria-label": "Sections" },
          tabs.map((t) => el("Tab", { value: slug(t) }, [text(t)])),
        ),
      ]);
    },
  },
  {
    type: "table",
    label: "Data table",
    category: "Data",
    description: "Leads or deals table with selection, pagination, loading/empty states and data binding.",
    defaults: { dataset: "leads", caption: "Leads", selectable: true, paginated: true, pageSize: 5, state: "data", dataSource: "mock", emptyTitle: "", emptyDescription: "", bulkActions: true, rowActions: true, bulkItems: "Email\nDelete", rowItems: "Edit\nEmail" },
    fields: [
      { key: "dataset", label: "Columns / sample data", kind: "select", options: Object.keys(DATASETS) },
      { key: "dataSource", label: "Data source", kind: "select", options: ["mock", "props"], help: "props: the generated component takes the rows as a typed prop." },
      { key: "state", label: "State", kind: "select", options: ["data", "loading", "empty"] },
      { key: "caption", label: "Caption (accessible name)", kind: "text" },
      { key: "selectable", label: "Row selection", kind: "boolean" },
      { key: "paginated", label: "Pagination", kind: "boolean" },
      { key: "pageSize", label: "Rows per page", kind: "number", min: 2, max: 20 },
      { key: "bulkActions", label: "Bulk actions bar", kind: "boolean" },
      { key: "bulkItems", label: "Bulk action buttons", kind: "list", columns: [{ key: "label", label: "Action" }] },
      { key: "rowActions", label: "Per-row actions", kind: "boolean" },
      { key: "rowItems", label: "Row action buttons", kind: "list", columns: [{ key: "label", label: "Action" }] },
      { key: "emptyTitle", label: "Empty title", kind: "text" },
      { key: "emptyDescription", label: "Empty description", kind: "text" },
    ],
    render: (p) => <TableBlock p={p} />,
    code: (n, _c, ctx) => {
      const key = (s(n.props.dataset) in DATASETS ? s(n.props.dataset) : "leads") as DatasetKey;
      const ds = DATASETS[key];
      const state = s(n.props.state) || "data";
      ctx.client(); // column cell renderers are functions → Client Component
      ctx.use("Table");
      ctx.use("StatusBadge");
      ctx.use("MoneyValue");
      ctx.useType("TableColumn");
      ctx.useType("StatusKey");
      const rowType = ctx.name(ds.rowType);
      const typeDecl = ds.typeDecl.replace(`type ${ds.rowType}`, `type ${rowType}`);
      const colsName = ctx.name(`${key}Columns`);
      let rowsName: string;
      if (n.props.dataSource === "props") {
        ctx.exportType(typeDecl);
        rowsName = ctx.prop(`${key}Rows`, `${rowType}[]`);
      } else {
        ctx.hoist(typeDecl);
        rowsName = ctx.name(`${key}Rows`);
        ctx.hoist(`const ${rowsName}: ${rowType}[] = ${literal(ds.rows)};`);
      }
      ctx.hoist(`const ${colsName}: TableColumn<${rowType}>[] = [\n${indent(ds.columns.map(codeColumn).join(",\n"))},\n];`);
      const size = Number(n.props.pageSize) || 5;
      let rowsExpr = state === "data" ? rowsName : "[]";
      const attrs: Record<string, ReturnType<typeof raw> | string | boolean | undefined> = {};
      if (state === "loading") attrs.loading = true;
      if (state !== "loading") {
        ctx.use("EmptyState");
        attrs.empty = raw(el("EmptyState", { title: s(n.props.emptyTitle) || `No ${ds.label.toLowerCase()} yet`, description: s(n.props.emptyDescription) }));
      }
      if (n.props.selectable) {
        const sel = ctx.name("selected");
        ctx.hook(`const [${sel}, ${setter(sel)}] = useState<Set<string>>(new Set());`);
        attrs.selectedIds = raw(sel);
        attrs.onSelectionChange = raw(setter(sel));
        attrs.getRowLabel = raw("(row) => `Select ${row.name}`");
      }
      let pager = "";
      if (n.props.paginated && state === "data") {
        const page = ctx.name("page");
        ctx.hook(`const [${page}, ${setter(page)}] = useState(1);`);
        ctx.use("Pagination");
        rowsExpr = `${rowsName}.slice((${page} - 1) * ${size}, ${page} * ${size})`;
        pager = el("Pagination", { page: raw(page), pageSize: size, totalItems: raw(`${rowsName}.length`), onPageChange: raw(setter(page)) });
      }
      if (n.props.bulkActions && n.props.selectable) {
        ctx.use("Button");
        const bulkItems = lines(String(n.props.bulkItems ?? ""));
        const bulkBody = bulkItems.map((label) => el("Button", { size: "sm", variant: "secondary" }, [text(`${label} \${count}`)])).join("\n          ");
        const clearBtn = el("Button", { size: "sm", variant: "ghost", onClick: raw("clear") }, [text("Clear")]);
        attrs.bulkActions = raw(`(count, clear) => (\n        <>\n          ${bulkBody}\n          ${clearBtn}\n        </>\n      )`);
      }
      if (n.props.rowActions) {
        ctx.use("IconButton");
        ctx.use("Pencil", "lucide-react");
        const rowItems = lines(String(n.props.rowItems ?? ""));
        const rowBody = rowItems.map((label) => el("IconButton", { label: `${label}`, icon: raw("<Pencil strokeWidth={1.6} />"), size: "sm" })).join("\n          ");
        attrs.rowActions = raw(`(row) => (\n        <>\n          ${rowBody}\n        </>\n      )`);
      }
      const table = el("Table", {
        caption: s(n.props.caption) || ds.label,
        columns: raw(colsName),
        rows: raw(rowsExpr),
        getRowId: raw("(row) => row.id"),
        ...attrs,
      });
      return pager ? el("div", { style: style({ display: "grid", gap: "var(--hg-space-3)" }) }, [table, pager]) : table;
    },
  },
  {
    type: "badge",
    label: "Badge",
    category: "Data",
    description: "Small label for status or category.",
    defaults: { label: "Qualified", tone: "success", dot: true },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "tone", label: "Tone", kind: "select", options: ["neutral", "info", "success", "warning", "danger", "outline"] },
      { key: "dot", label: "Dot", kind: "boolean" },
    ],
    render: (p) => (
      <Badge tone={s(p.tone) as BadgeTone} dot={Boolean(p.dot)}>
        {s(p.label)}
      </Badge>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Badge");
      return el("Badge", { tone: n.props.tone !== "neutral" ? s(n.props.tone) : undefined, dot: Boolean(n.props.dot) }, [text(s(n.props.label))]);
    },
  },
  {
    type: "statusBadge",
    label: "Status badge",
    category: "Data",
    description: "Named status from the shared registry.",
    defaults: { status: "awaiting_approval" },
    fields: [{ key: "status", label: "Status", kind: "select", options: Object.keys(STATUS_REGISTRY) }],
    render: (p) => <StatusBadge status={s(p.status) as StatusKey} />,
    code: (n, _c, ctx) => {
      ctx.use("StatusBadge");
      return el("StatusBadge", { status: s(n.props.status) });
    },
  },
  {
    type: "avatar",
    label: "Avatar",
    category: "Data",
    description: "Initials avatar.",
    defaults: { name: "Asha Rao", size: "md" },
    fields: [
      { key: "name", label: "Name", kind: "text" },
      { key: "size", label: "Size", kind: "select", options: ["xs", "sm", "md", "lg"] },
    ],
    render: (p) => <Avatar name={s(p.name)} size={s(p.size) as "xs" | "sm" | "md" | "lg"} />,
    code: (n, _c, ctx) => {
      ctx.use("Avatar");
      return el("Avatar", { name: s(n.props.name), size: n.props.size !== "md" ? s(n.props.size) : undefined });
    },
  },
  // Overlays
  {
    type: "dialog",
    label: "Dialog",
    category: "Overlays",
    description: "Button that opens a modal. Put form fields or content inside.",
    container: true,
    defaults: { triggerLabel: "New lead", triggerVariant: "primary", title: "Create lead", description: "", cancelLabel: "Cancel", confirmLabel: "Create lead" },
    fields: [
      { key: "triggerLabel", label: "Button label", kind: "text" },
      { key: "triggerVariant", label: "Button variant", kind: "select", options: ["primary", "secondary", "ghost", "danger"] },
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "cancelLabel", label: "Cancel label (blank = none)", kind: "text" },
      { key: "confirmLabel", label: "Confirm label (blank = none)", kind: "text" },
    ],
    defaultChildren: () => [field("Name", { placeholder: "Asha Rao" })],
    render: (p, c) => <OverlayBlock p={p} kind="dialog">{c}</OverlayBlock>,
    code: (n, c, ctx) => overlayCode("dialog", n, c, ctx),
  },
  {
    type: "drawer",
    label: "Drawer",
    category: "Overlays",
    description: "Button that opens a side panel (record details, filters).",
    container: true,
    defaults: { triggerLabel: "Open details", triggerVariant: "secondary", title: "Asha Rao", description: "Kaveri Textiles", side: "right", cancelLabel: "Close", confirmLabel: "" },
    fields: [
      { key: "triggerLabel", label: "Button label", kind: "text" },
      { key: "triggerVariant", label: "Button variant", kind: "select", options: ["primary", "secondary", "ghost"] },
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "side", label: "Side", kind: "select", options: ["right", "left", "bottom"] },
      { key: "cancelLabel", label: "Close label (blank = none)", kind: "text" },
      { key: "confirmLabel", label: "Confirm label (blank = none)", kind: "text" },
    ],
    defaultChildren: () => [node("detailList", { items: "Stage: Qualified\nValue: ₹8,49,600\nOwner: Meera S" })],
    render: (p, c) => <OverlayBlock p={p} kind="drawer">{c}</OverlayBlock>,
    code: (n, c, ctx) => overlayCode("drawer", n, c, ctx),
  },
  // CRM
  {
    type: "pageHeader",
    label: "Page header",
    category: "CRM",
    description: "h1, description and actions. Drop buttons inside to make them actions.",
    container: true,
    accepts: ["button", "iconButton", "dropdownMenu", "toastButton", "dialog", "drawer"],
    defaults: { title: "Leads", description: "Track and convert incoming leads." },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
    ],
    defaultChildren: () => [node("button", { label: "New lead", variant: "primary", size: "sm", icon: "Plus", iconPosition: "leading", disabled: false, fullWidth: false })],
    render: (p, c) => <PageHeader title={s(p.title)} description={s(p.description) || undefined} actions={c.length ? <>{c}</> : undefined} />,
    code: (n, c, ctx) => {
      ctx.use("PageHeader");
      return el("PageHeader", { title: s(n.props.title), description: s(n.props.description), actions: c.length ? raw(fragment(c)!) : undefined });
    },
  },
  {
    type: "metricGroup",
    label: "Metric strip",
    category: "CRM",
    description: "Dashboard KPI strip. Holds metrics.",
    container: true,
    accepts: ["metric"],
    defaults: { label: "Summary", columns: 4 },
    fields: [
      { key: "label", label: "Accessible label", kind: "text" },
      { key: "columns", label: "Columns (desktop)", kind: "number", min: 2, max: 6 },
    ],
    defaultChildren: () => [
      metric("Open pipeline", "₹23.1L", "18 open deals", "IndianRupee"),
      metric("Win rate", "64.0%", "16 won · 9 lost", "Target"),
      metric("New leads", "342", "This month", "Inbox"),
      metric("Overdue tasks", "5", "Needs follow-up", "AlarmClock", "danger"),
    ],
    render: (p, c) => (
      <MetricGroup label={s(p.label) || undefined} columns={Number(p.columns) || 4}>
        {c}
      </MetricGroup>
    ),
    code: (n, c, ctx) => {
      ctx.use("MetricGroup");
      return el("MetricGroup", { label: s(n.props.label), columns: Number(n.props.columns) || 4 }, c);
    },
  },
  {
    type: "metric",
    label: "Metric",
    category: "CRM",
    description: "One KPI (place inside a metric strip, or alone).",
    defaults: { label: "Open pipeline", value: "₹23.1L", hint: "18 open deals", icon: "IndianRupee", tone: "default" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "value", label: "Value", kind: "text" },
      { key: "hint", label: "Hint", kind: "text" },
      { key: "icon", label: "Icon", kind: "icon" },
      { key: "tone", label: "Tone", kind: "select", options: ["default", "danger", "warning", "success"] },
    ],
    render: (p) => (
      <MetricCard
        label={s(p.label)}
        value={s(p.value)}
        hint={s(p.hint) || undefined}
        icon={iconEl(p.icon)}
        tone={(s(p.tone) || "default") as "default" | "danger" | "warning" | "success"}
      />
    ),
    code: (n, _c, ctx) => {
      ctx.use("MetricCard");
      const p = n.props;
      return el("MetricCard", {
        label: s(p.label),
        value: s(p.value),
        hint: s(p.hint),
        icon: iconCode(p.icon, ctx),
        tone: p.tone && p.tone !== "default" ? s(p.tone) : undefined,
      });
    },
  },
  {
    type: "filterToolbar",
    label: "Filter toolbar",
    category: "CRM",
    description: "Search, quick-filter chips and scope line.",
    defaults: { placeholder: "Search leads", chips: "Hot\nUnassigned", scope: "Showing 8 of 61" },
    fields: [
      { key: "placeholder", label: "Search placeholder", kind: "text" },
      { key: "chips", label: "Chips", kind: "list", columns: [{ key: "label", label: "Chip" }] },
      { key: "scope", label: "Scope text", kind: "text" },
    ],
    render: (p) => <FilterToolbarBlock p={p} />,
    code: (n, _c, ctx) => {
      ctx.use("FilterToolbar");
      const q = ctx.name("query");
      ctx.hook(`const [${q}, ${setter(q)}] = useState("");`);
      const chips = lines(n.props.chips);
      let chipsAttr;
      if (chips.length) {
        ctx.use("FilterChip");
        const a = ctx.name("activeFilter");
        ctx.hook(`const [${a}, ${setter(a)}] = useState<string | null>(null);`);
        chipsAttr = raw(
          fragment(
            chips.map((c) =>
              el("FilterChip", { pressed: raw(`${a} === ${JSON.stringify(c)}`), onPressedChange: raw(`(on) => ${setter(a)}(on ? ${JSON.stringify(c)} : null)`) }, [text(c)]),
            ),
          )!,
        );
      }
      const ph = s(n.props.placeholder) || "Search";
      return el("FilterToolbar", { query: raw(q), onQueryChange: raw(setter(q)), searchLabel: ph, searchPlaceholder: ph, chips: chipsAttr, scope: s(n.props.scope) });
    },
  },
  {
    type: "approvalCard",
    label: "Approval card",
    category: "CRM",
    description: "Approve / reject request with outcome and undo.",
    defaults: { title: "Apply 12% discount to Q-1042", reason: "Repeat buyer above ₹10L annual spend.", requestedBy: "Meera S", undoable: true, approveLabel: "Approve" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "reason", label: "Reason", kind: "textarea" },
      { key: "requestedBy", label: "Requested by", kind: "text" },
      { key: "approveLabel", label: "Approve label", kind: "text" },
      { key: "undoable", label: "Undoable", kind: "boolean" },
    ],
    render: (p) => (
      <ApprovalCard
        title={s(p.title)}
        reason={s(p.reason)}
        requestedBy={s(p.requestedBy)}
        approveLabel={s(p.approveLabel) || "Approve"}
        undoable={Boolean(p.undoable)}
        onApprove={() => {}}
        onReject={() => {}}
        onUndo={() => {}}
      />
    ),
    code: (n, _c, ctx) => {
      ctx.use("ApprovalCard");
      ctx.client();
      const p = n.props;
      return el("ApprovalCard", {
        title: s(p.title),
        reason: s(p.reason),
        requestedBy: s(p.requestedBy),
        approveLabel: p.approveLabel && p.approveLabel !== "Approve" ? s(p.approveLabel) : undefined,
        undoable: p.undoable ? undefined : raw("false"),
        onApprove: raw("() => { /* TODO: approve */ }"),
        onReject: raw("() => { /* TODO: reject */ }"),
        onUndo: p.undoable ? raw("() => { /* TODO: undo */ }") : undefined,
      });
    },
  },
  {
    type: "taskList",
    label: "Task list",
    category: "CRM",
    description: "Tasks with completion checkboxes. Prefix a due date with ! for overdue.",
    defaults: {
      items: "Call Asha about the revised quote | Kaveri Textiles | Today, 4:00 pm\nShare GST invoice copy | BluePeak Logistics | !Yesterday\nConfirm delivery date | Mehta Agro | Fri",
      dataSource: "mock",
    },
    fields: [
      {
        key: "items",
        label: "Tasks",
        kind: "list",
        columns: [
          { key: "title", label: "Title" },
          { key: "context", label: "Related to" },
          { key: "due", label: "Due (! = overdue)" },
        ],
      },
      { key: "dataSource", label: "Data source", kind: "select", options: ["mock", "props"] },
    ],
    render: (p) => <TaskListBlock p={p} />,
    code: (n, _c, ctx) => {
      ctx.use("TaskRow");
      let tasks: string;
      if (n.props.dataSource === "props") {
        const t = ctx.name("Task");
        ctx.exportType(`type ${t} = { id: string; title: string; context: string; due: string; overdue: boolean };`);
        tasks = ctx.prop("tasks", `${t}[]`);
      } else {
        tasks = ctx.name("tasks");
        ctx.hoist(`const ${tasks} = ${literal(parseTasks(n.props.items))};`);
      }
      const done = ctx.name("doneTasks");
      const setDone = setter(done);
      ctx.hook(`const [${done}, ${setDone}] = useState<Set<string>>(new Set());`);
      return `<ul aria-label="Tasks" style={{ margin: 0, padding: 0, listStyle: "none" }}>
  {${tasks}.map((task) => (
    <TaskRow
      key={task.id}
      title={task.title}
      context={task.context || undefined}
      due={task.due || undefined}
      overdue={task.overdue}
      done={${done}.has(task.id)}
      onDoneChange={(isDone) =>
        ${setDone}((prev) => {
          const next = new Set(prev);
          if (isDone) next.add(task.id);
          else next.delete(task.id);
          return next;
        })
      }
    />
  ))}
</ul>`;
    },
  },
  {
    type: "conversationList",
    label: "Conversation list",
    category: "CRM",
    description: "Inbox threads with channel, time and unread count.",
    defaults: {
      items:
        "Asha Rao | Can you share the GST invoice for last month? | whatsapp | 10:42 am | 2\nVikram Iyer | Please call me after 3 pm. | missed_call | 9:15 am | 1\nNeha Kapoor | Thanks, the revised quote looks good. | email | Yesterday | 0",
    },
    fields: [
      {
        key: "items",
        label: "Threads",
        kind: "list",
        columns: [
          { key: "name", label: "Name" },
          { key: "preview", label: "Last message" },
          { key: "channel", label: "Channel", placeholder: "whatsapp / email / sms / call" },
          { key: "time", label: "Time" },
          { key: "unread", label: "Unread" },
        ],
      },
    ],
    render: (p) => (
      <ul aria-label="Conversations" style={LIST_STYLE}>
        {parseConversations(p.items).map((c) => (
          <ConversationListItem key={c.id} name={c.name} preview={c.preview} channel={c.channel} timeLabel={c.time} dateTime="2026-10-11" unreadCount={c.unread} href="#" />
        ))}
      </ul>
    ),
    code: (n, _c, ctx) => {
      ctx.use("ConversationListItem");
      return el(
        "ul",
        { "aria-label": "Conversations", style: style(LIST_STYLE) },
        parseConversations(n.props.items).map((c) =>
          el("ConversationListItem", {
            name: c.name,
            preview: c.preview,
            channel: c.channel,
            timeLabel: c.time,
            dateTime: "2026-10-11",
            unreadCount: c.unread || undefined,
            href: `/inbox/${c.id}`,
          }),
        ),
      );
    },
  },
  {
    type: "activityTimeline",
    label: "Activity timeline",
    category: "CRM",
    description: "Record history: one entry per row.",
    defaults: {
      items: "Asha Rao sent a WhatsApp message | 10:42 am\nMeera S logged a call | Yesterday\nStage moved to Proposal | Yesterday\nQuote Q-1042 sent | 8 Oct",
    },
    fields: [
      {
        key: "items",
        label: "Entries",
        kind: "list",
        columns: [
          { key: "text", label: "What happened" },
          { key: "time", label: "When" },
        ],
      },
    ],
    render: (p) => (
      <ActivityTimeline label="Activity">
        {parsePairs(p.items, "|").map(([t, time], i) => (
          <ActivityItem key={`${t}-${i}`} icon={iconEl(TIMELINE_ICONS[i % TIMELINE_ICONS.length])} dateTime="2026-10-11" timeLabel={time || "Today"}>
            {t}
          </ActivityItem>
        ))}
      </ActivityTimeline>
    ),
    code: (n, _c, ctx) => {
      ctx.use("ActivityTimeline");
      ctx.use("ActivityItem");
      return el(
        "ActivityTimeline",
        { label: "Activity" },
        parsePairs(n.props.items, "|").map(([t, time], i) =>
          el("ActivityItem", { icon: iconCode(TIMELINE_ICONS[i % TIMELINE_ICONS.length], ctx), dateTime: "2026-10-11", timeLabel: time || "Today" }, [text(t ?? "")]),
        ),
      );
    },
  },
  {
    type: "detailList",
    label: "Detail list",
    category: "CRM",
    description: "Record facts as label / value rows.",
    defaults: { items: "Stage: Proposal\nValue: ₹8,49,600\nAccount: Kaveri Textiles\nOwner: Meera S\nPipeline: Industrial Sales" },
    fields: [
      {
        key: "items",
        label: "Facts",
        kind: "list",
        separator: ": ",
        columns: [
          { key: "label", label: "Label" },
          { key: "value", label: "Value" },
        ],
      },
    ],
    render: (p) => <DetailList items={parsePairs(p.items, ":").map(([label, value]) => ({ label: label ?? "", value: value ?? "" }))} />,
    code: (n, _c, ctx) => {
      ctx.use("DetailList");
      const items = parsePairs(n.props.items, ":").map(([label, value]) => ({ label, value }));
      return el("DetailList", { items: raw(literal(items)) });
    },
  },
  {
    type: "dealStage",
    label: "Deal stage",
    category: "CRM",
    description: "Pipeline progress bars.",
    defaults: { stages: "New\nQualified\nProposal\nNegotiation\nWon", current: "Proposal", lost: false, compact: false },
    fields: [
      { key: "stages", label: "Stages", kind: "list", columns: [{ key: "label", label: "Stage" }] },
      { key: "current", label: "Current stage", kind: "text" },
      { key: "lost", label: "Lost", kind: "boolean" },
      { key: "compact", label: "Compact", kind: "boolean" },
    ],
    render: (p) => <DealStage stages={lines(p.stages)} current={s(p.current)} lost={Boolean(p.lost)} compact={Boolean(p.compact)} />,
    code: (n, _c, ctx) => {
      ctx.use("DealStage");
      return el("DealStage", { stages: raw(JSON.stringify(lines(n.props.stages))), current: s(n.props.current), lost: Boolean(n.props.lost), compact: Boolean(n.props.compact) });
    },
  },
];

export const BLOCK_MAP = new Map(BLOCKS.map((b) => [b.type, b]));
export const getBlock = (type: string): BlockDef => {
  const b = BLOCK_MAP.get(type);
  if (!b) throw new Error(`Unknown block type ${type}`);
  return b;
};
/** Kept for callers that only need the code side of a block. */
export const codeFor = getBlock;

/** New node with defaults (and default children) for a block type. */
export function createNode(type: string): BuilderNode {
  const b = getBlock(type);
  return node(type, { ...b.defaults }, b.defaultChildren?.() ?? []);
}

export function canAccept(parentType: string, childType: string): boolean {
  const parent = getBlock(parentType);
  if (!parent.container) return false;
  if (getBlock(childType).rootOnly) return false;
  if (parent.accepts && !parent.accepts.includes(childType)) return false;
  return true;
}
