// Raw source and generated manifests, bundled at build time from the real files.
import propsJson from "../generated/props.json";

const rawSources = import.meta.glob("../../../../packages/ui/src/**/*.{ts,tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const rawManifests = import.meta.glob("../../../../source/manifests/*.json", { import: "default", eager: true }) as Record<string, unknown>;

const SRC_PREFIX = "../../../../packages/ui/src/";

export interface ComponentManifest {
  name: string;
  category: "ui" | "crm";
  entry: string;
  description: string;
  exports: string[];
  types: string[];
  client: boolean;
  files: string[];
  styles: string[];
  internalDependencies: string[];
  npmDependencies: Record<string, string>;
  install: string[];
  copyCommand: string;
}

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export const PACKAGE_NAME = "@heigin/ui";

/** Source text for a path relative to packages/ui/src (or prefixed with packages/ui/src/). */
export function getSource(path: string): string | undefined {
  const rel = path.replace(/^packages\/ui\/src\//, "");
  return rawSources[SRC_PREFIX + rel];
}

export function getManifest(name: string): ComponentManifest | undefined {
  return Object.entries(rawManifests).find(([key]) => key.endsWith(`/${name}.json`))?.[1] as ComponentManifest | undefined;
}

export function listManifests(): ComponentManifest[] {
  return Object.entries(rawManifests)
    .filter(([key]) => !key.endsWith("/index.json"))
    .map(([, m]) => m as ComponentManifest)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getProps(componentName: string): { description: string; props: PropDoc[]; extends: string[] } | undefined {
  return (propsJson as Record<string, { description: string; props: PropDoc[]; extends: string[] }>)[componentName];
}

export const tokensCss = getSource("styles/tokens.css") ?? "";
export const tailwindCss = getSource("styles/tailwind.css") ?? "";
