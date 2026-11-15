// Community components vendored from Kokonut UI (MIT). meta.json and the sources under
// components/kokonutui/ are written by scripts/sync-kokonut.mjs; do not edit meta.json by hand.
import meta from "./meta.json";

export type KokonutCategory = "ai" | "cards" | "navigation" | "media";

export interface KokonutItem {
  slug: string;
  category: KokonutCategory;
  title: string;
  description: string;
  /** Markdown for the props tables, taken from the upstream docs page. */
  api: string;
  author: string;
  version: string;
  exportName: string;
  dependencies: string[];
  registryDependencies: string[];
  /** True when the vendored file differs from upstream (the header comment says how). */
  modified: boolean;
  docsUrl: string;
  registryUrl: string;
}

export const kokonutItems = meta as KokonutItem[];

export const kokonutGroups: ReadonlyArray<{ id: KokonutCategory; label: string }> = [
  { id: "ai", label: "AI" },
  { id: "cards", label: "Cards" },
  { id: "navigation", label: "Navigation" },
  { id: "media", label: "Media" },
];

export const kokonutPath = (slug: string) => `/components/${slug}`;

export const kokonutPreviewUrl = (slug: string, theme: "light" | "dark") => `/kokonut-preview.html?c=${slug}&theme=${theme}`;

const sources = import.meta.glob("../components/kokonutui/*.tsx", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;

/** The vendored source, loaded on demand so 22 files of text stay out of the main bundle. */
export function loadKokonutSource(slug: string): Promise<string> {
  const load = sources[`../components/kokonutui/${slug}.tsx`];
  return load ? load() : Promise.resolve("");
}
