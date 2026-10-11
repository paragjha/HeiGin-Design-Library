import type { PlaygroundDef } from "../components/Playground";

export type Evidence = "observed" | "inferred" | "proposed";

export interface ExampleRef {
  /** File name inside src/examples/<slug>/ without extension. */
  file: string;
  title: string;
  description?: string;
}

export interface ComponentDocEntry {
  slug: string;
  title: string;
  group: "Actions" | "Forms" | "Navigation" | "Data display" | "Overlays" | "CRM patterns";
  /** Manifest name in source/manifests (usually equal to slug). */
  manifest: string;
  /** Exported component names whose props are documented. */
  propsFor: string[];
  description: string;
  evidence: Evidence;
  /** Where in the live CRM this was seen, or why it is proposed. */
  evidenceNote: string;
  /** States this component supports (documented explicitly per the brief). */
  states: string[];
  playground?: PlaygroundDef;
  examples: ExampleRef[];
  a11y: string[];
  responsive?: string;
}
