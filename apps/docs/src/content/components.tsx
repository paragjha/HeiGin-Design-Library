import { Pencil, Plus } from "lucide-react";
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  IconButton,
  Input,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  SearchInput,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Tab,
  Table,
  Tabs,
  TabsList,
  TabsPanel,
  Textarea,
  ToastProvider,
  Tooltip,
  TooltipProvider,
  useToast,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
  type ToastTone,
} from "@heigin/ui";
import { definePlayground } from "../components/Playground";
import type { ComponentDocEntry } from "./types";

const q = (s: string) => JSON.stringify(s);

// ─── helpers for complex playgrounds ────────────────────────────────────────

function ToastDemo({ tone, title, description }: { tone: string; title: string; description: string }) {
  const { toast } = useToast();
  return (
    <Button variant="secondary" size="sm" onClick={() => toast({ title, description: description || undefined, tone: tone as ToastTone })}>
      Show toast
    </Button>
  );
}

const TABLE_ROWS = [
  { id: "1", name: "Asha Rao", status: "Qualified", value: "₹8,49,600" },
  { id: "2", name: "Vikram Iyer", status: "New", value: "₹2,10,000" },
  { id: "3", name: "Neha Kapoor", status: "Contacted", value: "₹5,35,000" },
];
const TABLE_COLS = [
  { id: "name", header: "Name", cell: (r: (typeof TABLE_ROWS)[0]) => r.name },
  { id: "status", header: "Status", cell: (r: (typeof TABLE_ROWS)[0]) => r.status },
  { id: "value", header: "Value", cell: (r: (typeof TABLE_ROWS)[0]) => r.value, align: "end" as const },
];

// ─── docs ───────────────────────────────────────────────────────────────────

export const componentDocs: ComponentDocEntry[] = [
  // ───────────── Actions
  {
    slug: "button",
    title: "Button",
    group: "Actions",
    manifest: "button",
    propsFor: ["Button"],
    description: "Triggers an action. Primary is HeiGin's near-black accent; there is one primary action per view.",
    evidence: "observed",
    evidenceNote: "Login page and app chrome: 13px/500 label, 6px radius, #1f1f1f fill with #3a3a3a hover, 32px tall from 768px and 44px below it, 150ms colour transition, disabled at 50% opacity.",
    states: ["default", "hover", "focus-visible", "active", "disabled", "loading"],
    playground: definePlayground({
      controls: {
        variant: { type: "select", label: "Variant", options: ["primary", "secondary", "ghost", "danger", "link"], default: "primary" },
        size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
        label: { type: "text", label: "Label", default: "Create lead" },
        icon: { type: "boolean", label: "Leading icon", default: false },
        disabled: { type: "boolean", label: "Disabled", default: false },
        loading: { type: "boolean", label: "Loading", default: false },
      },
      render: (v) => (
        <Button
          variant={v.variant as ButtonVariant}
          size={v.size as ButtonSize}
          disabled={v.disabled}
          loading={v.loading}
          leadingIcon={v.icon ? <Plus strokeWidth={1.6} /> : undefined}
        >
          {v.label}
        </Button>
      ),
      code: (v) =>
        `${v.icon ? 'import { Plus } from "lucide-react";\n' : ""}import { Button } from "@heigin/ui";\n\n<Button${v.variant !== "primary" ? ` variant=${q(v.variant)}` : ""}${v.size !== "md" ? ` size=${q(v.size)}` : ""}${v.icon ? " leadingIcon={<Plus strokeWidth={1.6} />}" : ""}${v.disabled ? " disabled" : ""}${v.loading ? " loading" : ""}>\n  ${v.label}\n</Button>`,
    }),
    examples: [
      { file: "variants", title: "Variants" },
      { file: "states", title: "Icons, sizes and loading", description: "Loading keeps focus and width, sets aria-busy and ignores clicks." },
    ],
    a11y: [
      "Renders a native <button> with type=\"button\" so it never submits forms by accident; pass type=\"submit\" explicitly.",
      "Focus-visible outline: 2px #3b82f6 at 1px offset, matching production.",
      "Loading uses aria-busy and aria-disabled (not the disabled attribute), so keyboard focus is not lost mid-action.",
      "Icon-only actions must use IconButton, which requires an accessible label.",
    ],
    responsive: "Grows to the 44px touch target below 768px (opt out with touch={false} for dense toolbars).",
  },
  {
    slug: "icon-button",
    title: "Icon button",
    group: "Actions",
    manifest: "icon-button",
    propsFor: ["IconButton"],
    description: "Square, icon-only button for row actions and toolbars. The label is required and becomes the accessible name.",
    evidence: "observed",
    evidenceNote: "Record actions (\"More actions\"), dialog close, sidebar collapse: 28px square ghost buttons (44px on mobile) in muted ink, hover #f2f2f2.",
    states: ["default", "hover", "focus-visible", "active", "disabled", "loading"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Edit" },
        variant: { type: "select", label: "Variant", options: ["ghost", "secondary", "primary", "danger"], default: "ghost" },
        size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <IconButton
          label={v.label}
          icon={<Pencil strokeWidth={1.6} />}
          variant={v.variant as ButtonVariant}
          size={v.size as ButtonSize}
          disabled={v.disabled}
        />
      ),
      code: (v) =>
        `import { Pencil } from "lucide-react";\nimport { IconButton } from "@heigin/ui";\n\n<IconButton\n  label=${q(v.label)}\n  icon={<Pencil strokeWidth={1.6} />}${v.variant !== "ghost" ? `\n  variant=${q(v.variant)}` : ""}${v.size !== "md" ? `\n  size=${q(v.size)}` : ""}${v.disabled ? "\n  disabled" : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Icon buttons" }],
    a11y: ["`label` is required: it sets aria-label and a native title tooltip.", "Use strokeWidth={1.6} on Lucide icons to match production."],
  },

  // ───────────── Forms
  {
    slug: "field",
    title: "Field",
    group: "Forms",
    manifest: "field",
    propsFor: ["Field"],
    description: "Wraps one control with a label, helper text and a validation message, and wires the ids and ARIA attributes automatically.",
    evidence: "observed",
    evidenceNote: "Settings and New Task forms: labels 12.5px/400 muted with 6px gap, helper text 12.5px muted, required shown as \"Title *\". Error styling was not triggered (no form was submitted) and is proposed.",
    states: ["default", "required", "error", "disabled"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Email address" },
        description: { type: "text", label: "Helper text", default: "We'll never share your email." },
        error: { type: "text", label: "Error", default: "" },
        required: { type: "boolean", label: "Required", default: false },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <div style={{ width: 300 }}>
          <Field label={v.label} description={v.description || undefined} error={v.error || undefined} required={v.required} disabled={v.disabled}>
            <Input placeholder="you@example.com" />
          </Field>
        </div>
      ),
      code: (v) =>
        `import { Field, Input } from "@heigin/ui";\n\n<Field label=${q(v.label)}${v.description ? ` description=${q(v.description)}` : ""}${v.error ? ` error=${q(v.error)}` : ""}${v.required ? " required" : ""}${v.disabled ? " disabled" : ""}>\n  <Input placeholder="you@example.com" />\n</Field>`,
    }),
    examples: [{ file: "validation", title: "Form validation", description: "Validates on submit; errors are announced through role=\"alert\" and linked with aria-describedby." }],
    a11y: [
      "The label is a real <label for>.",
      "The description and error are joined into aria-describedby.",
      "When error is set, the control gets aria-invalid and the message has role=\"alert\".",
      "The required asterisk is aria-hidden; required state is conveyed by the required attribute.",
    ],
  },
  {
    slug: "input",
    title: "Input",
    group: "Forms",
    manifest: "input",
    propsFor: ["Input"],
    description: "Single-line text input. Works inside a Field or standalone with aria-label.",
    evidence: "observed",
    evidenceNote: "Login email and password inputs: 32px tall with 13px text from 768px, 44px tall with 16px text on mobile (16px prevents iOS zoom), 10px horizontal padding, #ebebeb border, card shadow. On focus the border changes to #dcdcdc and a 3px rgb(0 0 0 / 5%) ring appears.",
    states: ["default", "hover", "focus", "error", "disabled", "read-only"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Company" },
        placeholder: { type: "text", label: "Placeholder", default: "Northwind Industrial" },
        description: { type: "text", label: "Helper text", default: "" },
        error: { type: "text", label: "Error", default: "" },
        disabled: { type: "boolean", label: "Disabled", default: false },
        required: { type: "boolean", label: "Required", default: false },
      },
      render: (v) => (
        <div style={{ width: 300 }}>
          <Field label={v.label} description={v.description || undefined} error={v.error || undefined} disabled={v.disabled} required={v.required}>
            <Input placeholder={v.placeholder} />
          </Field>
        </div>
      ),
      code: (v) =>
        `import { Field, Input } from "@heigin/ui";\n\n<Field label=${q(v.label)}${v.description ? ` description=${q(v.description)}` : ""}${v.error ? ` error=${q(v.error)}` : ""}${v.disabled ? " disabled" : ""}${v.required ? " required" : ""}>\n  <Input placeholder=${q(v.placeholder)} />\n</Field>`,
    }),
    examples: [{ file: "states", title: "States" }],
    a11y: [
      "Production's focus border (#dcdcdc, 1.37:1) is too faint to see. HeiGin UI uses #737373 (4.6:1) with the same soft ring; the design audit records this as an intentional deviation.",
      "Invalid inputs get a red border, aria-invalid and a linked text message, so meaning never relies on colour alone.",
    ],
    responsive: "44px tall with 16px text below 768px; 32px tall with 13px text at 768px and above.",
  },
  {
    slug: "textarea",
    title: "Textarea",
    group: "Forms",
    manifest: "textarea",
    propsFor: ["Textarea"],
    description: "Multi-line text input with the same chrome as Input. Resizes vertically.",
    evidence: "observed",
    evidenceNote: "Settings (registered address) and New Task (notes) use a textarea with the shared input chrome.",
    states: ["default", "focus", "error", "disabled", "read-only"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Notes" },
        placeholder: { type: "text", label: "Placeholder", default: "Add notes about this lead…" },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <div style={{ width: 360 }}>
          <Field label={v.label} disabled={v.disabled}>
            <Textarea placeholder={v.placeholder} />
          </Field>
        </div>
      ),
      code: (v) =>
        `import { Field, Textarea } from "@heigin/ui";\n\n<Field label=${q(v.label)}${v.disabled ? " disabled" : ""}>\n  <Textarea placeholder=${q(v.placeholder)} />\n</Field>`,
    }),
    examples: [{ file: "basic", title: "Character limit" }],
    a11y: ["Put a live character count in the Field description so it is announced with the control."],
  },
  {
    slug: "search-input",
    title: "Search input",
    group: "Forms",
    manifest: "search-input",
    propsFor: ["SearchInput"],
    description: "Controlled search field with a leading icon and a clear button. Escape clears; Enter calls onSearch.",
    evidence: "inferred",
    evidenceNote: "Leads and Inbox search boxes use the plain input chrome with a placeholder (\"Search leads…\") and no leading icon. The icon and clear button here are an extension.",
    states: ["empty", "filled", "focus", "disabled"],
    playground: definePlayground({
      controls: {
        placeholder: { type: "text", label: "Placeholder", default: "Search leads…" },
        size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <div style={{ width: 300 }}>
          <SearchInput value="" onValueChange={() => {}} placeholder={v.placeholder} size={v.size as "sm" | "md" | "lg"} disabled={v.disabled} />
        </div>
      ),
      code: (v) =>
        `import { SearchInput } from "@heigin/ui";\n\n<SearchInput\n  value={query}\n  onValueChange={setQuery}\n  placeholder=${q(v.placeholder)}${v.size !== "md" ? `\n  size=${q(v.size)}` : ""}${v.disabled ? "\n  disabled" : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Filtering a list" }],
    a11y: ["Uses type=\"search\" (role searchbox).", "The clear button has an accessible name and returns focus to the input.", "Announce result counts in a role=\"status\" region."],
  },
  {
    slug: "select",
    title: "Select",
    group: "Forms",
    manifest: "select",
    propsFor: ["Select"],
    description: "Single-value picker with a custom listbox, built on Base UI Select. Renders a hidden input when `name` is set.",
    evidence: "inferred",
    evidenceNote: "Production uses native <select> elements styled like inputs. This Base UI Select is the design-system select component.",
    states: ["placeholder", "selected", "open", "highlighted option", "disabled option", "error", "disabled"],
    playground: definePlayground({
      controls: {
        placeholder: { type: "text", label: "Placeholder", default: "Select stage…" },
        size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <div style={{ width: 240 }}>
          <Select
            options={[
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "qualified", label: "Qualified" },
              { value: "proposal", label: "Proposal" },
            ]}
            placeholder={v.placeholder}
            size={v.size as "sm" | "md" | "lg"}
            disabled={v.disabled}
          />
        </div>
      ),
      code: (v) =>
        `import { Select } from "@heigin/ui";\n\n<Select\n  options={stages}\n  value={stage}\n  onValueChange={setStage}\n  placeholder=${q(v.placeholder)}${v.size !== "md" ? `\n  size=${q(v.size)}` : ""}${v.disabled ? "\n  disabled" : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Deal stage" }],
    a11y: ["Exposed as a combobox with a listbox popup; arrow keys, Home/End and type-ahead work.", "Disabled options stay visible but cannot be selected."],
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Forms",
    manifest: "checkbox",
    propsFor: ["Checkbox"],
    description: "Binary or mixed choice. Supports indeterminate for select-all patterns.",
    evidence: "inferred",
    evidenceNote: "Used for table row selection. Styled from the accent and border tokens.",
    states: ["unchecked", "checked", "indeterminate", "hover", "focus-visible", "disabled", "invalid"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Send WhatsApp updates" },
        checked: { type: "boolean", label: "Checked", default: true },
        indeterminate: { type: "boolean", label: "Indeterminate", default: false },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => <Checkbox label={v.label} checked={v.checked} indeterminate={v.indeterminate} disabled={v.disabled} />,
      code: (v) =>
        `import { Checkbox } from "@heigin/ui";\n\n<Checkbox label=${q(v.label)}${v.checked ? " checked" : ""}${v.indeterminate ? " indeterminate" : ""}${v.disabled ? " disabled" : ""} onCheckedChange={setChecked} />`,
    }),
    examples: [{ file: "basic", title: "Select all" }],
    a11y: ["role=\"checkbox\" with aria-checked true, false or mixed.", "Space toggles it.", "The visible label is wrapped in <label>, so clicking the text toggles too."],
  },
  {
    slug: "radio-group",
    title: "Radio group",
    group: "Forms",
    manifest: "radio-group",
    propsFor: ["RadioGroup"],
    description: "A labelled set of mutually exclusive options.",
    evidence: "proposed",
    evidenceNote: "Not yet observed in production. Provided for settings forms; review before use.",
    states: ["unselected", "selected", "focus-visible", "disabled"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Group label", default: "Preferred channel" },
        orientation: { type: "select", label: "Orientation", options: ["vertical", "horizontal"], default: "vertical" },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => (
        <RadioGroup
          label={v.label}
          options={[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
          ]}
          defaultValue="whatsapp"
          orientation={v.orientation as "vertical" | "horizontal"}
          disabled={v.disabled}
        />
      ),
      code: (v) =>
        `import { RadioGroup } from "@heigin/ui";\n\nconst channels = [\n  { value: "whatsapp", label: "WhatsApp" },\n  { value: "email", label: "Email" },\n  { value: "sms", label: "SMS" },\n];\n\n<RadioGroup\n  label=${q(v.label)}\n  options={channels}\n  value={channel}\n  onValueChange={setChannel}${v.orientation !== "vertical" ? `\n  orientation=${q(v.orientation)}` : ""}${v.disabled ? "\n  disabled" : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Preferred channel" }],
    a11y: ["role=\"radiogroup\" labelled by the group label.", "Arrow keys move the selection; Tab enters and leaves the group."],
  },
  {
    slug: "switch",
    title: "Switch",
    group: "Forms",
    manifest: "switch",
    propsFor: ["Switch"],
    description: "On/off toggle for settings that take effect immediately (no Save button).",
    evidence: "inferred",
    evidenceNote: "Settings toggles are expected; exact production styling is pending authenticated inspection.",
    states: ["off", "on", "focus-visible", "disabled"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Auto-assign new leads" },
        checked: { type: "boolean", label: "On", default: true },
        disabled: { type: "boolean", label: "Disabled", default: false },
      },
      render: (v) => <Switch label={v.label} checked={v.checked} disabled={v.disabled} />,
      code: (v) => `import { Switch } from "@heigin/ui";\n\n<Switch label=${q(v.label)}${v.checked ? " checked" : ""}${v.disabled ? " disabled" : ""} onCheckedChange={setOn} />`,
    }),
    examples: [{ file: "basic", title: "Settings" }],
    a11y: ["role=\"switch\" with aria-checked.", "Use a Checkbox instead when the change only applies after a form is submitted."],
  },

  // ───────────── Navigation
  {
    slug: "tabs",
    title: "Tabs",
    group: "Navigation",
    manifest: "tabs",
    propsFor: ["Tabs", "TabsList", "Tab", "TabsPanel"],
    description: "Switches between related views. The `underline` variant sits on a divider; `pill` is a segmented control.",
    evidence: "observed",
    evidenceNote: "Deal detail (Overview / Activity) and Inbox filters (All / Needs reply / Hot): flat pills, 28px tall, 13.5px, active fill #ebebeb, inactive muted, faint tabular counts. Production renders them as plain buttons without tab roles; this component adds the ARIA tab pattern. The underline variant is proposed.",
    states: ["default", "hover", "active", "focus-visible", "disabled", "with count"],
    playground: definePlayground({
      controls: {
        variant: { type: "select", label: "Variant", options: ["pill", "underline"], default: "pill" },
      },
      render: (v) => (
        <Tabs defaultValue="overview">
          <TabsList variant={v.variant as "pill" | "underline"}>
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="notes" count={3}>Notes</Tab>
          </TabsList>
          <TabsPanel value="overview"><p style={{ padding: "var(--hg-space-3) 0", color: "var(--hg-color-muted)" }}>Overview content</p></TabsPanel>
          <TabsPanel value="activity"><p style={{ padding: "var(--hg-space-3) 0", color: "var(--hg-color-muted)" }}>Activity feed</p></TabsPanel>
          <TabsPanel value="notes"><p style={{ padding: "var(--hg-space-3) 0", color: "var(--hg-color-muted)" }}>3 notes</p></TabsPanel>
        </Tabs>
      ),
      code: (v) =>
        `import { Tabs, TabsList, Tab, TabsPanel } from "@heigin/ui";\n\n<Tabs defaultValue="overview">\n  <TabsList${v.variant !== "pill" ? ` variant=${q(v.variant)}` : ""}>\n    <Tab value="overview">Overview</Tab>\n    <Tab value="activity">Activity</Tab>\n    <Tab value="notes" count={3}>Notes</Tab>\n  </TabsList>\n  <TabsPanel value="overview">…</TabsPanel>\n  <TabsPanel value="activity">…</TabsPanel>\n  <TabsPanel value="notes">…</TabsPanel>\n</Tabs>`,
    }),
    examples: [{ file: "basic", title: "Underline and pill" }],
    a11y: [
      "role=\"tablist\", role=\"tab\" and role=\"tabpanel\", with aria-selected and aria-controls.",
      "Arrow keys move between tabs; Home and End jump to the ends.",
      "Disabled tabs are skipped.",
    ],
    responsive: "The tab list scrolls horizontally on narrow screens instead of wrapping.",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    group: "Navigation",
    manifest: "dropdown-menu",
    propsFor: ["DropdownMenuContent", "DropdownMenuItem", "DropdownMenuGroup"],
    description: "A list of actions opened from a button. Items can carry an icon, a shortcut hint or a danger tone.",
    evidence: "inferred",
    evidenceNote: "Uses the production popover surface: white, 8px radius, --shadow-popover, popIn 120ms with a 6px rise. Items hover with #f2f2f2.",
    states: ["closed", "open", "highlighted item", "disabled item", "danger item"],
    playground: definePlayground({
      controls: {
        align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "start" },
        hasDanger: { type: "boolean", label: "Danger item", default: true },
      },
      render: (v) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>Actions</DropdownMenuTrigger>
          <DropdownMenuContent align={v.align as "start" | "center" | "end"}>
            <DropdownMenuItem icon={<Pencil strokeWidth={1.6} />}>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            {v.hasDanger && <DropdownMenuSeparator />}
            {v.hasDanger && <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      code: (v) =>
        `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem${v.hasDanger ? ", DropdownMenuSeparator" : ""} } from "@heigin/ui";\n\n<DropdownMenu>\n  <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>\n    Actions\n  </DropdownMenuTrigger>\n  <DropdownMenuContent${v.align !== "start" ? ` align=${q(v.align)}` : ""}>\n    <DropdownMenuItem>Edit</DropdownMenuItem>\n    <DropdownMenuItem>Duplicate</DropdownMenuItem>${v.hasDanger ? "\n    <DropdownMenuSeparator />\n    <DropdownMenuItem tone=\"danger\">Delete</DropdownMenuItem>" : ""}\n  </DropdownMenuContent>\n</DropdownMenu>`,
    }),
    examples: [{ file: "basic", title: "Row actions" }],
    a11y: [
      "role=\"menu\" and role=\"menuitem\".",
      "ArrowDown or Enter on the trigger opens the menu and focuses the first item.",
      "Escape closes it and returns focus to the trigger; type-ahead is supported.",
    ],
    responsive: "Items grow to 44px tall below 768px.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    group: "Navigation",
    manifest: "pagination",
    propsFor: ["Pagination"],
    description: "Previous/next pager with an Indian-grouped range label (1–25 of 1,342).",
    evidence: "proposed",
    evidenceNote: "Production list pagination has not been inspected yet. This compact pager is a proposal.",
    states: ["first page", "middle", "last page"],
    playground: definePlayground({
      controls: {
        page: { type: "select", label: "Page", options: ["1", "2", "3", "4", "5"], default: "1" },
        pageSize: { type: "select", label: "Page size", options: ["10", "25", "50"], default: "25" },
      },
      render: (v) => (
        <Pagination page={Number(v.page)} pageSize={Number(v.pageSize)} totalItems={112} onPageChange={() => {}} />
      ),
      code: (v) =>
        `import { Pagination } from "@heigin/ui";\n\n<Pagination\n  page={page}\n  pageSize={${v.pageSize}}\n  totalItems={totalItems}\n  onPageChange={setPage}\n/>`,
    }),
    examples: [{ file: "basic", title: "Pager" }],
    a11y: ["Wrapped in <nav aria-label=\"Pagination\">.", "The range label is a polite live region.", "Buttons at the ends are disabled, not hidden."],
  },

  // ───────────── Data display
  {
    slug: "table",
    title: "Table",
    group: "Data display",
    manifest: "table",
    propsFor: ["Table"],
    description:
      "Generic data table with configurable columns, skeleton loading, an empty slot, row selection, controlled sorting, bulk actions and per-row actions. It never fetches or reorders data itself.",
    evidence: "observed",
    evidenceNote: "Leads list: table in its own bordered surface (8px radius, no shadow); header cells 36px, 12.5px/400 muted, 14px padding; rows 40px, 13px, hover #f2f2f2, pointer cursor.",
    states: ["populated", "loading", "empty", "selected rows", "sorted", "hover", "bulk actions", "row actions"],
    playground: definePlayground({
      controls: {
        loading: { type: "boolean", label: "Loading", default: false },
        bordered: { type: "boolean", label: "Bordered", default: true },
        density: { type: "select", label: "Density", options: ["default", "compact"], default: "default" },
        selectable: { type: "boolean", label: "Selection", default: false },
      },
      render: (v) => (
        <Table
          caption="Leads"
          columns={TABLE_COLS}
          rows={v.loading ? [] : TABLE_ROWS}
          getRowId={(r) => r.id}
          loading={v.loading}
          bordered={v.bordered}
          density={v.density as "default" | "compact"}
          selectedIds={v.selectable ? new Set<string>() : undefined}
          onSelectionChange={v.selectable ? () => {} : undefined}
        />
      ),
      code: (v) =>
        `import { Table } from "@heigin/ui";\n\n<Table\n  caption="Leads"\n  columns={columns}\n  rows={leads}\n  getRowId={(r) => r.id}${v.loading ? "\n  loading" : ""}${!v.bordered ? "\n  bordered={false}" : ""}${v.density !== "default" ? `\n  density=${q(v.density)}` : ""}${v.selectable ? "\n  selectedIds={selected}\n  onSelectionChange={setSelected}" : ""}\n/>`,
    }),
    examples: [{ file: "states", title: "Populated, loading and empty", description: "Selection, sorting, pagination, bulk actions and per-row actions are controlled by the example; the table only renders." }],
    a11y: [
      "A real <table> with a caption (visually hidden by default) and scope=\"col\" headers.",
      "Sortable headers are buttons, and aria-sort reflects the current direction.",
      "While loading the table sets aria-busy, and the skeletons are aria-hidden.",
      "onRowClick is mouse sugar only; keep a link or button in the row for keyboard users.",
    ],
    responsive: "The table scrolls horizontally inside its container. Mark secondary columns hideOnMobile.",
  },
  {
    slug: "badge",
    title: "Badge",
    group: "Data display",
    manifest: "badge",
    propsFor: ["Badge"],
    description: "Compact status or category label. Status is always tint + ink + word (and optionally a dot or icon), never colour alone.",
    evidence: "observed",
    evidenceNote: "Leads, Today and deal detail: 20px tall, 11.5px/500, 6px padding, 4px radius. Neutral = #f2f2f2 with muted text; info = #eef4ff with #2563eb; danger = #fef2f2 with #dc2626 (HeiGin UI uses the darker proposed danger-ink for contrast).",
    states: ["neutral", "info", "success", "warning", "danger", "outline"],
    playground: definePlayground({
      controls: {
        tone: { type: "select", label: "Tone", options: ["neutral", "info", "success", "warning", "danger", "outline"], default: "success" },
        label: { type: "text", label: "Label", default: "Qualified" },
        dot: { type: "boolean", label: "Dot", default: true },
        size: { type: "select", label: "Size", options: ["sm", "md"], default: "md" },
      },
      render: (v) => (
        <Badge tone={v.tone as BadgeTone} dot={v.dot} size={v.size as "sm" | "md"}>
          {v.label}
        </Badge>
      ),
      code: (v) =>
        `import { Badge } from "@heigin/ui";\n\n<Badge tone=${q(v.tone)}${v.dot ? " dot" : ""}${v.size !== "md" ? ` size=${q(v.size)}` : ""}>${v.label}</Badge>`,
    }),
    examples: [{ file: "tones", title: "Tones" }],
    a11y: ["All tone/ink pairs meet 4.5:1 (success and danger use the proposed darker inks).", "Dots and icons are decorative; the text carries the meaning."],
  },
  {
    slug: "avatar",
    title: "Avatar",
    group: "Data display",
    manifest: "avatar",
    propsFor: ["Avatar"],
    description: "A person or company image, falling back to initials (also used when the image fails to load).",
    evidence: "observed",
    evidenceNote: "Sidebar account footer and Dashboard top reps: circular initials avatars on a neutral fill.",
    states: ["initials", "image", "image error fallback", "decorative"],
    playground: definePlayground({
      controls: {
        name: { type: "text", label: "Name", default: "Asha Rao" },
        size: { type: "select", label: "Size", options: ["xs", "sm", "md", "lg"], default: "md" },
      },
      render: (v) => <Avatar name={v.name} size={v.size as "xs" | "sm" | "md" | "lg"} />,
      code: (v) => `import { Avatar } from "@heigin/ui";\n\n<Avatar name=${q(v.name)}${v.size !== "md" ? ` size=${q(v.size)}` : ""} />`,
    }),
    examples: [{ file: "sizes", title: "Sizes and fallback" }],
    a11y: ["role=\"img\" named after the person.", "Pass decorative when the name is printed next to the avatar, to avoid it being read twice."],
  },
  {
    slug: "card",
    title: "Card",
    group: "Data display",
    manifest: "card",
    propsFor: ["Card", "CardHeader"],
    description: "White surface with a hairline border, 8px radius and the card shadow. Server-component safe.",
    evidence: "observed",
    evidenceNote: "Dashboard panels and pipeline deal cards: 1px #ebebeb border, 8px radius, white, no shadow, 16px (20px from 768px) padding; card titles 13px muted with a 12.5px blue link on the right; interactive cards darken the border on hover.",
    states: ["default", "interactive hover"],
    playground: definePlayground({
      controls: {
        padding: { type: "select", label: "Padding", options: ["none", "sm", "md", "lg"], default: "md" },
        interactive: { type: "boolean", label: "Interactive", default: false },
      },
      render: (v) => (
        <Card padding={v.padding as "none" | "sm" | "md" | "lg"} interactive={v.interactive} style={{ maxWidth: 360 }}>
          <CardHeader title="Pipeline summary" description="Last 30 days" />
          <p style={{ margin: 0, fontSize: 13, color: "var(--hg-color-muted)" }}>18 open deals worth ₹23.1L</p>
        </Card>
      ),
      code: (v) =>
        `import { Card, CardHeader } from "@heigin/ui";\n\n<Card${v.padding !== "md" ? ` padding=${q(v.padding)}` : ""}${v.interactive ? " interactive" : ""}>\n  <CardHeader title="Pipeline summary" description="Last 30 days" />\n  <p>18 open deals worth ₹23.1L</p>\n</Card>`,
    }),
    examples: [{ file: "basic", title: "Cards" }],
    a11y: ["CardHeader renders a real heading (h3 by default; set level to fit the page outline)."],
  },
  {
    slug: "empty-state",
    title: "Empty state",
    group: "Data display",
    manifest: "empty-state",
    propsFor: ["EmptyState"],
    description: "Explains why a view is empty and offers the next step.",
    evidence: "observed",
    evidenceNote: "Inbox: text-only empty states — title 13.5px ink, description 13px muted, centred with generous padding. The optional icon and action are extensions.",
    states: ["inline", "page"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "No open leads" },
        description: { type: "text", label: "Description", default: "New enquiries will appear here." },
        action: { type: "boolean", label: "Action", default: true },
      },
      render: (v) => <EmptyState title={v.title} description={v.description} action={v.action ? <Button size="sm">Add lead</Button> : undefined} />,
      code: (v) =>
        `import { Button, EmptyState } from "@heigin/ui";\n\n<EmptyState\n  title=${q(v.title)}\n  description=${q(v.description)}${v.action ? `\n  action={<Button size="sm">Add lead</Button>}` : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Approvals inbox" }],
    a11y: ["Plain text, no live region; when results disappear because of a filter, announce the count separately."],
  },
  {
    slug: "skeleton",
    title: "Skeleton and spinner",
    group: "Data display",
    manifest: "skeleton",
    propsFor: ["Skeleton", "Spinner"],
    description: "Skeleton placeholders keep the layout steady while content loads; the spinner shows indeterminate progress.",
    evidence: "observed",
    evidenceNote: "Production CSS uses pulse 1.4s ease-in-out infinite on #f2f2f2 fills, and a 1s linear spin.",
    states: ["loading", "reduced motion"],
    playground: definePlayground({
      controls: {
        shape: { type: "select", label: "Shape", options: ["rect", "text", "circle"], default: "text" },
        showSpinner: { type: "boolean", label: "Show spinner", default: false },
      },
      render: (v) => (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {v.shape === "circle" ? (
            <Skeleton shape="circle" width={40} height={40} />
          ) : v.shape === "text" ? (
            <div style={{ display: "grid", gap: 8, width: 200 }}>
              <Skeleton shape="text" width="80%" />
              <Skeleton shape="text" width="60%" />
              <Skeleton shape="text" width="90%" />
            </div>
          ) : (
            <Skeleton shape="rect" width={200} height={80} />
          )}
          {v.showSpinner && <Spinner size="md" />}
        </div>
      ),
      code: (v) =>
        `import { ${v.showSpinner ? "Skeleton, Spinner" : "Skeleton"} } from "@heigin/ui";\n\n${v.shape === "circle" ? '<Skeleton shape="circle" width={40} height={40} />' : v.shape === "text" ? '<Skeleton shape="text" width="80%" />\n<Skeleton shape="text" width="60%" />' : '<Skeleton shape="rect" width={200} height={80} />'}${v.showSpinner ? '\n<Spinner size="md" />' : ""}`,
    }),
    examples: [{ file: "loading", title: "Loading" }],
    a11y: [
      "Skeletons are aria-hidden; mark the container aria-busy instead.",
      "Spinner announces role=\"status\" with a label; pass label={null} when it sits inside a labelled control.",
      "Pulse stops under prefers-reduced-motion.",
    ],
  },

  // ───────────── Overlays
  {
    slug: "dialog",
    title: "Dialog",
    group: "Overlays",
    manifest: "dialog",
    propsFor: ["DialogContent"],
    description: "Modal window for focused tasks such as short forms. Prefer a Drawer for record details.",
    evidence: "observed",
    evidenceNote: "New Task dialog: 480px, 1px border, 10px radius, popover shadow, scrim rgb(0 0 0 / .2), header 48px with 14px/500 title and bottom border, 28px close button, body gap 16px, right-aligned footer without divider; bottom sheet below 768px. Focus moves to the first field; Escape closes and returns focus.",
    states: ["closed", "open", "with form", "scrolling body"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Create lead" },
        description: { type: "text", label: "Description", default: "Leads are assigned by your round-robin rule." },
        size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
      },
      render: (v) => (
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" size="sm" />}>Open dialog</DialogTrigger>
          <DialogContent
            title={v.title}
            description={v.description || undefined}
            size={v.size as "sm" | "md" | "lg"}
            footer={<><DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose><Button>Confirm</Button></>}
          >
            <p style={{ margin: 0, fontSize: 13, color: "var(--hg-color-muted)" }}>Dialog body content goes here.</p>
          </DialogContent>
        </Dialog>
      ),
      code: (v) =>
        `import { Button, Dialog, DialogClose, DialogContent, DialogTrigger } from "@heigin/ui";\n\n<Dialog>\n  <DialogTrigger render={<Button />}>Open</DialogTrigger>\n  <DialogContent\n    title=${q(v.title)}${v.description ? `\n    description=${q(v.description)}` : ""}${v.size !== "md" ? `\n    size=${q(v.size)}` : ""}\n    footer={<>\n      <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>\n      <Button>Confirm</Button>\n    </>}\n  >\n    …\n  </DialogContent>\n</Dialog>`,
    }),
    examples: [{ file: "form", title: "Create lead form", description: "The footer submit button is linked to the form with the form attribute." }],
    a11y: [
      "role=\"dialog\" with aria-modal, labelled by the title and described by the description.",
      "Focus moves inside and is trapped.",
      "Escape and backdrop click close it; focus returns to the trigger.",
      "Page scroll is locked while open.",
    ],
    responsive: "Width is min(480px, 100vw − 32px). Footer buttons stretch below 768px.",
  },
  {
    slug: "alert-dialog",
    title: "Alert dialog",
    group: "Overlays",
    manifest: "alert-dialog",
    propsFor: ["AlertDialog"],
    description: "Confirmation for destructive or consequential actions. Supports async confirm with a loading state.",
    evidence: "inferred",
    evidenceNote: "Destructive confirmations are needed for quotes and records. Built from the observed dialog surface and danger tokens.",
    states: ["closed", "open", "confirming (loading)", "danger"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Delete this lead?" },
        description: { type: "text", label: "Description", default: "This action cannot be undone." },
        tone: { type: "select", label: "Tone", options: ["default", "danger"], default: "danger" },
      },
      render: (v) => (
        <AlertDialog
          trigger={<Button variant="danger" size="sm">Delete</Button>}
          title={v.title}
          description={v.description}
          tone={v.tone as "default" | "danger"}
          onConfirm={() => {}}
        />
      ),
      code: (v) =>
        `import { AlertDialog, Button } from "@heigin/ui";\n\n<AlertDialog\n  trigger={<Button variant="danger" size="sm">Delete</Button>}\n  title=${q(v.title)}\n  description=${q(v.description)}${v.tone !== "default" ? `\n  tone=${q(v.tone)}` : ""}\n  onConfirm={handleDelete}\n/>`,
    }),
    examples: [{ file: "basic", title: "Cancel a quote", description: "Demo only — nothing is sent." }],
    a11y: [
      "role=\"alertdialog\".",
      "Initial focus goes to Cancel, so Enter never confirms by accident.",
      "Clicking outside does not dismiss it.",
      "Cancel is disabled while the confirm action runs.",
    ],
  },
  {
    slug: "drawer",
    title: "Drawer",
    group: "Overlays",
    manifest: "drawer",
    propsFor: ["DrawerContent"],
    description: "Edge-anchored modal panel: right for record details, left for mobile navigation, bottom for mobile sheets.",
    evidence: "observed",
    evidenceNote: "Production keyframes: drawerIn (220ms, cubic-bezier(.2,.8,.2,1)) at width min(360px, 100vw − 48px); navDrawerIn (200ms) at min(300px, 85vw); sheetIn (200ms) with 10px top radius.",
    states: ["closed", "open right", "open left", "open bottom"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Lead details" },
        side: { type: "select", label: "Side", options: ["right", "left", "bottom"], default: "right" },
      },
      render: (v) => (
        <Drawer>
          <DrawerTrigger render={<Button variant="secondary" size="sm" />}>Open drawer</DrawerTrigger>
          <DrawerContent title={v.title} side={v.side as "right" | "left" | "bottom"}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--hg-color-muted)" }}>Drawer body content goes here.</p>
          </DrawerContent>
        </Drawer>
      ),
      code: (v) =>
        `import { Button, Drawer, DrawerContent, DrawerTrigger } from "@heigin/ui";\n\n<Drawer>\n  <DrawerTrigger render={<Button />}>Open</DrawerTrigger>\n  <DrawerContent title=${q(v.title)}${v.side !== "right" ? ` side=${q(v.side)}` : ""}>\n    …\n  </DrawerContent>\n</Drawer>`,
    }),
    examples: [{ file: "basic", title: "Lead details and bottom sheet" }],
    a11y: ["Same focus management as Dialog.", "The title is required as the accessible name."],
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Overlays",
    manifest: "popover",
    propsFor: ["PopoverContent"],
    description: "Non-modal floating panel for small interactive content such as filters.",
    evidence: "inferred",
    evidenceNote: "Shares the production popover surface and motion.",
    states: ["closed", "open"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Filters" },
        side: { type: "select", label: "Side", options: ["top", "bottom", "left", "right"], default: "bottom" },
        align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "start" },
      },
      render: (v) => (
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>Open popover</PopoverTrigger>
          <PopoverContent title={v.title} side={v.side as "top" | "bottom" | "left" | "right"} align={v.align as "start" | "center" | "end"}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--hg-color-muted)" }}>Popover content goes here.</p>
          </PopoverContent>
        </Popover>
      ),
      code: (v) =>
        `import { Button, Popover, PopoverContent, PopoverTrigger } from "@heigin/ui";\n\n<Popover>\n  <PopoverTrigger render={<Button />}>Filters</PopoverTrigger>\n  <PopoverContent${v.title ? ` title=${q(v.title)}` : ""}${v.side !== "bottom" ? ` side=${q(v.side)}` : ""}${v.align !== "start" ? ` align=${q(v.align)}` : ""}>\n    …\n  </PopoverContent>\n</Popover>`,
    }),
    examples: [{ file: "basic", title: "Filters" }],
    a11y: ["Labelled by its title.", "Focus moves in on open; Escape closes it and returns focus to the trigger."],
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Overlays",
    manifest: "tooltip",
    propsFor: ["Tooltip"],
    description: "Short supplementary label on hover and focus. Never put essential or interactive content in a tooltip.",
    evidence: "proposed",
    evidenceNote: "No custom tooltips seen yet; production may rely on native title attributes. Dark tooltip styling is a proposal.",
    states: ["hidden", "visible"],
    playground: definePlayground({
      controls: {
        content: { type: "text", label: "Content", default: "Edit this record" },
        side: { type: "select", label: "Side", options: ["top", "bottom", "left", "right"], default: "top" },
      },
      render: (v) => (
        <TooltipProvider>
          <Tooltip content={v.content} side={v.side as "top" | "bottom" | "left" | "right"}>
            <IconButton label="Edit" icon={<Pencil strokeWidth={1.6} />} />
          </Tooltip>
        </TooltipProvider>
      ),
      code: (v) =>
        `import { Tooltip, TooltipProvider, IconButton } from "@heigin/ui";\n\n<TooltipProvider>\n  <Tooltip content=${q(v.content)}${v.side !== "top" ? ` side=${q(v.side)}` : ""}>\n    <IconButton label="Edit" icon={<Pencil />} />\n  </Tooltip>\n</TooltipProvider>`,
    }),
    examples: [{ file: "basic", title: "Icon hints" }],
    a11y: ["Shown on keyboard focus as well as hover; Escape dismisses it.", "Not a substitute for an accessible name — IconButton still needs its label."],
  },
  {
    slug: "toast",
    title: "Toast",
    group: "Overlays",
    manifest: "toast",
    propsFor: ["ToastProvider"],
    description: "Brief, non-blocking feedback after an action, with an optional single action such as Undo.",
    evidence: "inferred",
    evidenceNote: "Production toast stack is fixed bottom-right (20px inset) at z-index 200 with 8px gaps; no toast was triggered during inspection.",
    states: ["neutral", "success", "warning", "danger", "with action", "persistent"],
    playground: definePlayground({
      controls: {
        tone: { type: "select", label: "Tone", options: ["neutral", "success", "warning", "danger", "info"], default: "success" },
        title: { type: "text", label: "Title", default: "Lead created" },
        description: { type: "text", label: "Description", default: "Asha Rao was added to New." },
      },
      render: (v) => (
        <ToastProvider>
          <ToastDemo tone={v.tone} title={v.title} description={v.description} />
        </ToastProvider>
      ),
      code: (v) =>
        `import { useToast } from "@heigin/ui";\n\nconst { toast } = useToast();\n\ntoast({\n  title: ${q(v.title)},${v.description ? `\n  description: ${q(v.description)},` : ""}\n  tone: ${q(v.tone)},\n});`,
    }),
    examples: [{ file: "basic", title: "Feedback" }],
    a11y: [
      "Danger toasts are announced assertively; the rest politely.",
      "Toasts pause while hovered or focused.",
      "F6 moves focus to the toast region.",
      "Persistent errors should use timeout 0.",
    ],
    responsive: "Bottom-right on desktop; bottom-centre and full width (minus 32px) on mobile.",
  },
];

export const findComponentDoc = (slug: string) => componentDocs.find((d) => d.slug === slug);
