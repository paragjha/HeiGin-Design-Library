import type { PropValue } from "./model";

interface FieldDef {
  key: string;
  label: string;
  kind: "text" | "textarea" | "select" | "boolean" | "number" | "list" | "icon";
  options?: readonly string[];
  help?: string;
  min?: number;
  max?: number;
  columns?: { key: string; label: string; placeholder?: string; kind?: "text" | "icon" }[];
}

const s = (v: PropValue | undefined) => (v === undefined ? "" : String(v));

const LAYOUT_SPACE = ["0", "1", "2", "3", "4", "5", "6", "8", "10"] as const;
const WIDTHS = ["auto", "full", "1/2", "1/3", "2/3"] as const;
const WIDTH_MAP: Record<string, string> = { auto: "auto", full: "100%", "1/2": "50%", "1/3": "33.333%", "2/3": "66.666%" };
const ALIGNS = ["auto", "start", "center", "end", "stretch"] as const;

export const LAYOUT_FIELDS: FieldDef[] = [
  { key: "_mt", label: "Margin top", kind: "select", options: [...LAYOUT_SPACE] },
  { key: "_mb", label: "Margin bottom", kind: "select", options: [...LAYOUT_SPACE] },
  { key: "_pt", label: "Padding top", kind: "select", options: [...LAYOUT_SPACE] },
  { key: "_pb", label: "Padding bottom", kind: "select", options: [...LAYOUT_SPACE] },
  { key: "_px", label: "Padding horizontal", kind: "select", options: [...LAYOUT_SPACE] },
  { key: "_w", label: "Width", kind: "select", options: [...WIDTHS] },
  { key: "_align", label: "Align self", kind: "select", options: [...ALIGNS] },
];

function hasLayout(p: Record<string, PropValue>): boolean {
  const mt = s(p._mt); const mb = s(p._mb); const pt = s(p._pt); const pb = s(p._pb);
  const px = s(p._px); const w = s(p._w); const al = s(p._align);
  return (mt && mt !== "0") || (mb && mb !== "0") || (pt && pt !== "0") || (pb && pb !== "0") || (px && px !== "0") || (w && w !== "auto") || (al && al !== "auto") ? true : false;
}

function buildLayout(p: Record<string, PropValue>): Record<string, string> {
  const mt = s(p._mt); const mb = s(p._mb); const pt = s(p._pt); const pb = s(p._pb);
  const px = s(p._px); const w = s(p._w); const al = s(p._align);
  const out: Record<string, string> = {};
  if (mt && mt !== "0") out.marginTop = `var(--hg-space-${mt})`;
  if (mb && mb !== "0") out.marginBottom = `var(--hg-space-${mb})`;
  if (pt && pt !== "0") out.paddingTop = `var(--hg-space-${pt})`;
  if (pb && pb !== "0") out.paddingBottom = `var(--hg-space-${pb})`;
  if (px && px !== "0") { out.paddingLeft = `var(--hg-space-${px})`; out.paddingRight = `var(--hg-space-${px})`; }
  if (w && w !== "auto") out.width = WIDTH_MAP[w] ?? "auto";
  if (al && al !== "auto") out.alignSelf = al;
  return out;
}

export function layoutStyle(p: Record<string, PropValue>): Record<string, string> | undefined {
  if (!hasLayout(p)) return undefined;
  return buildLayout(p);
}

export function layoutStyleCode(p: Record<string, PropValue>): Record<string, string> | undefined {
  if (!hasLayout(p)) return undefined;
  return buildLayout(p);
}
