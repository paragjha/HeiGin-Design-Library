// Block registry: what can be placed in the builder, how it renders on the canvas (real @heigin/ui
// components), which props are editable, and the exact code it generates.
import * as React from "react";
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
  DealStage,
  DetailList,
  EmptyState,
  Field,
  FilterChip,
  FilterToolbar,
  IconButton,
  Input,
  MetricCard,
  MetricGroup,
  MoneyValue,
  NativeSelect,
  PageHeader,
  Pagination,
  RadioGroup,
  STATUS_REGISTRY,
  StatusBadge,
  Switch,
  Tab,
  Table,
  Tabs,
  TabsList,
  TaskRow,
  Textarea,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
  type StatusKey,
  type TableColumn,
} from "@heigin/ui";
import { el, indent, literal, raw, style, text, type CodeCtx, type NodeCodeFn } from "./codegen";
import { DATASETS, ICONS, ICON_NAMES, TIMELINE_ICONS, type ColumnSpec, type DatasetKey } from "./data";
import { lines, node, type BuilderNode, type PropValue } from "./model";

export type FieldKind = "text" | "textarea" | "select" | "boolean" | "number";
export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  help?: string;
  min?: number;
  max?: number;
}

export type BlockCategory = "Layout" | "Content" | "Actions" | "Forms" | "Data" | "CRM";

export interface BlockDef {
  type: string;
  label: string;
  category: BlockCategory;
  description: string;
  /** Can hold children. */
  container?: boolean;
  /** Restrict which child types are allowed. */
  accepts?: string[];
  /** Only valid as the document root. */
  rootOnly?: boolean;
  defaults: Record<string, PropValue>;
  fields: FieldDef[];
  defaultChildren?: () => BuilderNode[];
  render: (p: Record<string, PropValue>, children: React.ReactNode[]) => React.ReactNode;
  code: NodeCodeFn;
}

// ───────────── helpers
const s = (v: PropValue | undefined) => (v === undefined ? "" : String(v));
const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const SPACE = ["2", "3", "4", "5", "6", "8"] as const;
const gapVar = (v: PropValue | undefined) => `var(--hg-space-${s(v) || "4"})`;

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
  return {
    display: "grid",
    gap: gapVar(p.gap),
    gridTemplateColumns: p.responsive ? `repeat(auto-fit, minmax(${Number(p.minWidth) || 240}px, 1fr))` : `repeat(${cols}, minmax(0, 1fr))`,
    alignItems: "start",
  };
}
const PAGE_STYLE = { display: "grid", gap: "var(--hg-space-6)", maxWidth: "var(--hg-layout-content-max)", margin: "0 auto", padding: "var(--hg-space-6) var(--hg-space-4)" };
const SECTION_TITLE = { fontSize: "var(--hg-font-size-md)", fontWeight: 400, color: "var(--hg-color-muted)", margin: 0 };
const asCss = (o: Record<string, string | number | undefined>) => o as React.CSSProperties;

// ───────────── stateful canvas renderers (mirror the generated code)
function TableBlock({ p }: { p: Record<string, PropValue> }) {
  const ds = DATASETS[(s(p.dataset) as DatasetKey) || "leads"] ?? DATASETS.leads;
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const size = Number(p.pageSize) || 5;
  const rows = p.paginated ? ds.rows.slice((page - 1) * size, page * size) : ds.rows;
  const columns: TableColumn<Record<string, string | number>>[] = ds.columns.map((c) => runtimeColumn(c));
  const table = (
    <Table
      caption={s(p.caption) || ds.label}
      columns={columns}
      rows={rows}
      getRowId={(r) => String(r.id)}
      selectedIds={p.selectable ? selected : undefined}
      onSelectionChange={p.selectable ? setSelected : undefined}
      getRowLabel={(r) => `Select ${r.name}`}
    />
  );
  if (!p.paginated) return table;
  return (
    <div style={{ display: "grid", gap: "var(--hg-space-3)" }}>
      {table}
      <Pagination page={page} pageSize={size} totalItems={ds.rows.length} onPageChange={setPage} />
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
    const [title = "", context = "", dueRaw = ""] = line.split("|").map((x) => x.trim());
    const overdue = dueRaw.startsWith("!");
    return { id: `t${i + 1}`, title, context, due: overdue ? dueRaw.slice(1).trim() : dueRaw, overdue };
  });
}
function TaskListBlock({ p }: { p: Record<string, PropValue> }) {
  const [done, setDone] = React.useState<Set<string>>(new Set());
  return (
    <ul aria-label="Tasks" style={{ margin: 0, padding: 0, listStyle: "none" }}>
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

const parsePairs = (v: PropValue | undefined, sep: string) =>
  lines(v).map((l) => {
    const i = l.indexOf(sep);
    return i < 0 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + sep.length).trim()];
  });

const metric = (label: string, value: string, hint = "", icon = "none", tone = "default") => node("metric", { label, value, hint, icon, tone });

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
    defaults: { columns: 2, responsive: true, minWidth: 280, gap: "4" },
    fields: [
      { key: "columns", label: "Columns", kind: "number", min: 1, max: 6, help: "Used when Responsive is off." },
      { key: "responsive", label: "Responsive", kind: "boolean" },
      { key: "minWidth", label: "Min column width (px)", kind: "number", min: 120, max: 600 },
      { key: "gap", label: "Gap", kind: "select", options: SPACE },
    ],
    render: (p, c) => <div style={asCss(gridStyle(p))}>{c}</div>,
    code: (n, c) => el("div", { style: style(gridStyle(n.props)) }, c),
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
      { key: "icon", label: "Icon", kind: "select", options: ICON_NAMES },
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
      { key: "icon", label: "Icon", kind: "select", options: ICON_NAMES.filter((i) => i !== "none") },
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
  // Forms
  {
    type: "input",
    label: "Text field",
    category: "Forms",
    description: "Labelled input with helper text.",
    defaults: { label: "Company", placeholder: "Kaveri Textiles", description: "", required: false, type: "text" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      { key: "description", label: "Helper text", kind: "text" },
      { key: "type", label: "Type", kind: "select", options: ["text", "email", "tel", "number", "password"] },
      { key: "required", label: "Required", kind: "boolean" },
    ],
    render: (p) => (
      <Field label={s(p.label)} description={s(p.description) || undefined} required={Boolean(p.required)}>
        <Input placeholder={s(p.placeholder)} type={s(p.type) || "text"} />
      </Field>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("Input");
      const p = n.props;
      return el("Field", { label: s(p.label), description: s(p.description), required: Boolean(p.required) }, [
        el("Input", { placeholder: s(p.placeholder), type: p.type !== "text" ? s(p.type) : undefined }),
      ]);
    },
  },
  {
    type: "textarea",
    label: "Text area",
    category: "Forms",
    description: "Multi-line field.",
    defaults: { label: "Notes", placeholder: "", rows: 4 },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      { key: "rows", label: "Rows", kind: "number", min: 2, max: 12 },
    ],
    render: (p) => (
      <Field label={s(p.label)}>
        <Textarea placeholder={s(p.placeholder)} rows={Number(p.rows) || 4} />
      </Field>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("Textarea");
      return el("Field", { label: s(n.props.label) }, [el("Textarea", { placeholder: s(n.props.placeholder), rows: Number(n.props.rows) || 4 })]);
    },
  },
  {
    type: "nativeSelect",
    label: "Select",
    category: "Forms",
    description: "Native select with the input chrome (as production).",
    defaults: { label: "Owner", options: "Unassigned\nMeera S\nArjun K\nRitu P" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "options", label: "Options (one per line)", kind: "textarea" },
    ],
    render: (p) => (
      <Field label={s(p.label)}>
        <NativeSelect>
          {lines(p.options).map((o) => (
            <option key={o} value={slug(o)}>
              {o}
            </option>
          ))}
        </NativeSelect>
      </Field>
    ),
    code: (n, _c, ctx) => {
      ctx.use("Field");
      ctx.use("NativeSelect");
      return el("Field", { label: s(n.props.label) }, [
        el("NativeSelect", {}, lines(n.props.options).map((o) => el("option", { value: slug(o) }, [text(o)]))),
      ]);
    },
  },
  {
    type: "checkbox",
    label: "Checkbox",
    category: "Forms",
    description: "Labelled checkbox.",
    defaults: { label: "Send WhatsApp updates", description: "", defaultChecked: true },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "defaultChecked", label: "Checked by default", kind: "boolean" },
    ],
    render: (p) => <Checkbox label={s(p.label)} description={s(p.description) || undefined} defaultChecked={Boolean(p.defaultChecked)} />,
    code: (n, _c, ctx) => {
      ctx.use("Checkbox");
      return el("Checkbox", { label: s(n.props.label), description: s(n.props.description), defaultChecked: Boolean(n.props.defaultChecked) });
    },
  },
  {
    type: "switch",
    label: "Switch",
    category: "Forms",
    description: "Setting that applies immediately.",
    defaults: { label: "Auto-assign new leads", description: "", defaultChecked: true },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "description", label: "Description", kind: "text" },
      { key: "defaultChecked", label: "On by default", kind: "boolean" },
    ],
    render: (p) => <Switch label={s(p.label)} description={s(p.description) || undefined} defaultChecked={Boolean(p.defaultChecked)} />,
    code: (n, _c, ctx) => {
      ctx.use("Switch");
      return el("Switch", { label: s(n.props.label), description: s(n.props.description), defaultChecked: Boolean(n.props.defaultChecked) });
    },
  },
  {
    type: "radioGroup",
    label: "Radio group",
    category: "Forms",
    description: "Mutually exclusive options.",
    defaults: { label: "Preferred channel", options: "WhatsApp\nEmail\nPhone call", orientation: "vertical" },
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "options", label: "Options (one per line)", kind: "textarea" },
      { key: "orientation", label: "Orientation", kind: "select", options: ["vertical", "horizontal"] },
    ],
    render: (p) => {
      const opts = lines(p.options).map((o) => ({ value: slug(o), label: o }));
      return <RadioGroup label={s(p.label)} options={opts} defaultValue={opts[0]?.value} orientation={p.orientation === "horizontal" ? "horizontal" : "vertical"} />;
    },
    code: (n, _c, ctx) => {
      ctx.use("RadioGroup");
      const opts = lines(n.props.options).map((o) => ({ value: slug(o), label: o }));
      return el("RadioGroup", {
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
      { key: "tabs", label: "Tabs (one per line)", kind: "textarea" },
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
    description: "Leads or deals table with optional selection and pagination.",
    defaults: { dataset: "leads", caption: "Leads", selectable: true, paginated: true, pageSize: 5 },
    fields: [
      { key: "dataset", label: "Mock data", kind: "select", options: Object.keys(DATASETS) },
      { key: "caption", label: "Caption (accessible name)", kind: "text" },
      { key: "selectable", label: "Row selection", kind: "boolean" },
      { key: "paginated", label: "Pagination", kind: "boolean" },
      { key: "pageSize", label: "Rows per page", kind: "number", min: 2, max: 20 },
    ],
    render: (p) => <TableBlock p={p} />,
    code: (n, _c, ctx) => {
      const key = ((s(n.props.dataset) as DatasetKey) || "leads") in DATASETS ? (s(n.props.dataset) as DatasetKey) : "leads";
      const ds = DATASETS[key];
      ctx.client(); // column cell renderers are functions → Client Component
      ctx.use("Table");
      ctx.use("StatusBadge");
      ctx.use("MoneyValue");
      ctx.useType("TableColumn");
      ctx.useType("StatusKey");
      const rowType = ctx.name(ds.rowType);
      const rowsName = ctx.name(`${key}Rows`);
      const colsName = ctx.name(`${key}Columns`);
      ctx.hoist(ds.typeDecl.replace(`type ${ds.rowType}`, `type ${rowType}`));
      ctx.hoist(`const ${rowsName}: ${rowType}[] = ${literal(ds.rows)};`);
      ctx.hoist(`const ${colsName}: TableColumn<${rowType}>[] = [\n${indent(ds.columns.map(codeColumn).join(",\n"))},\n];`);
      const size = Number(n.props.pageSize) || 5;
      let rowsExpr = rowsName;
      const attrs: Record<string, ReturnType<typeof raw> | string | undefined> = {};
      if (n.props.selectable) {
        const sel = ctx.name("selected");
        const setSel = `set${sel[0]!.toUpperCase()}${sel.slice(1)}`;
        ctx.hook(`const [${sel}, ${setSel}] = useState<Set<string>>(new Set());`);
        attrs.selectedIds = raw(sel);
        attrs.onSelectionChange = raw(setSel);
        attrs.getRowLabel = raw("(row) => `Select ${row.name}`");
      }
      let pager = "";
      if (n.props.paginated) {
        const page = ctx.name("page");
        const setPage = `set${page[0]!.toUpperCase()}${page.slice(1)}`;
        ctx.hook(`const [${page}, ${setPage}] = useState(1);`);
        ctx.use("Pagination");
        rowsExpr = `${rowsName}.slice((${page} - 1) * ${size}, ${page} * ${size})`;
        pager = el("Pagination", { page: raw(page), pageSize: size, totalItems: raw(`${rowsName}.length`), onPageChange: raw(setPage) });
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
  // CRM
  {
    type: "pageHeader",
    label: "Page header",
    category: "CRM",
    description: "h1, description and actions. Drop buttons inside to make them actions.",
    container: true,
    accepts: ["button", "iconButton"],
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
      { key: "icon", label: "Icon", kind: "select", options: ICON_NAMES },
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
      { key: "chips", label: "Chips (one per line)", kind: "textarea" },
      { key: "scope", label: "Scope text", kind: "text" },
    ],
    render: (p) => <FilterToolbarBlock p={p} />,
    code: (n, _c, ctx) => {
      ctx.use("FilterToolbar");
      const q = ctx.name("query");
      const setQ = `set${q[0]!.toUpperCase()}${q.slice(1)}`;
      ctx.hook(`const [${q}, ${setQ}] = useState("");`);
      const chips = lines(n.props.chips);
      let chipsAttr;
      if (chips.length) {
        ctx.use("FilterChip");
        const a = ctx.name("activeFilter");
        const setA = `set${a[0]!.toUpperCase()}${a.slice(1)}`;
        ctx.hook(`const [${a}, ${setA}] = useState<string | null>(null);`);
        chipsAttr = raw(
          fragment(
            chips.map((c) =>
              el("FilterChip", { pressed: raw(`${a} === ${JSON.stringify(c)}`), onPressedChange: raw(`(on) => ${setA}(on ? ${JSON.stringify(c)} : null)`) }, [text(c)]),
            ),
          )!,
        );
      }
      const ph = s(n.props.placeholder) || "Search";
      return el("FilterToolbar", { query: raw(q), onQueryChange: raw(setQ), searchLabel: ph, searchPlaceholder: ph, chips: chipsAttr, scope: s(n.props.scope) });
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
    defaults: { items: "Call Asha about the revised quote | Kaveri Textiles | Today, 4:00 pm\nShare GST invoice copy | BluePeak Logistics | !Yesterday\nConfirm delivery date | Mehta Agro | Fri" },
    fields: [{ key: "items", label: "Tasks: title | context | due", kind: "textarea" }],
    render: (p) => <TaskListBlock p={p} />,
    code: (n, _c, ctx) => {
      ctx.use("TaskRow");
      const tasks = ctx.name("tasks");
      const done = ctx.name("doneTasks");
      const setDone = `set${done[0]!.toUpperCase()}${done.slice(1)}`;
      ctx.hoist(`const ${tasks} = ${literal(parseTasks(n.props.items))};`);
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
    type: "activityTimeline",
    label: "Activity timeline",
    category: "CRM",
    description: "Record history. One entry per line: text | time.",
    defaults: {
      items: "Asha Rao sent a WhatsApp message | 10:42 am\nMeera S logged a call | Yesterday\nStage moved to Proposal | Yesterday\nQuote Q-1042 sent | 8 Oct",
    },
    fields: [{ key: "items", label: "Entries: text | time", kind: "textarea" }],
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
    description: "Record facts. One per line: Label: value.",
    defaults: { items: "Stage: Proposal\nValue: ₹8,49,600\nAccount: Kaveri Textiles\nOwner: Meera S\nPipeline: Industrial Sales" },
    fields: [{ key: "items", label: "Items: Label: value", kind: "textarea" }],
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
      { key: "stages", label: "Stages (one per line)", kind: "textarea" },
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
export const codeFor = (type: string): NodeCodeFn => getBlock(type).code;

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
