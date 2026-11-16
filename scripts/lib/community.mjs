// Community (Kokonut UI, MIT) components vendored in apps/docs/src/components/kokonutui.
// Shared by copy-component.mjs and build-registry.mjs so both hand out the same files.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./graph.mjs";

const docsSrc = join(repoRoot, "apps/docs/src");
const communityDir = join(docsSrc, "components/kokonutui");
const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g;

const ORB_IMPORT = 'import { ThinkingOrb } from "@heigin/ui";';
const ORB_LOCAL = "components/ui/thinking-orb.tsx";

export const communitySlugs = () =>
  readdirSync(communityDir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.slice(0, -4))
    .sort();

export const communityMeta = () => JSON.parse(readFileSync(join(docsSrc, "kokonut/meta.json"), "utf8"));

const packageOf = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/**
 * Every file a community component needs, keyed by its path under the consumer's "@/" root,
 * plus the npm packages those files import.
 *
 * Three components use HeiGin's ThinkingOrb. Rather than require the @heigin/ui package, the
 * orb's one self-contained file ships alongside and the import points at it.
 */
export function collectCommunity(slug) {
  const files = new Map();
  const packages = new Set();
  const visit = (file, source = join(docsSrc, file)) => {
    if (files.has(file)) return;
    let code = readFileSync(source, "utf8");
    if (code.includes(ORB_IMPORT)) {
      code = code.replace(ORB_IMPORT, 'import { ThinkingOrb } from "@/components/ui/thinking-orb";');
      files.set(file, code);
      visit(ORB_LOCAL, join(repoRoot, "packages/ui/src", ORB_LOCAL));
    } else {
      files.set(file, code);
    }
    for (const [, spec] of code.matchAll(IMPORT_RE)) {
      if (spec.startsWith("@/")) {
        const hit = [".tsx", ".ts"].map((ext) => spec.slice(2) + ext).find((f) => files.has(f) || existsSync(join(docsSrc, f)));
        if (!hit) throw new Error(`${file} imports ${spec}, which is not in apps/docs/src`);
        visit(hit);
      } else if (!spec.startsWith(".")) {
        if (packageOf(spec) === "@heigin/ui") throw new Error(`${file} imports ${spec}; only ThinkingOrb is bundled for community components`);
        packages.add(packageOf(spec));
      }
    }
  };
  visit(`components/kokonutui/${slug}.tsx`);
  packages.delete("react");
  packages.delete("react-dom");
  return { files, packages: [...packages].sort() };
}

export function communityVersion(pkg) {
  const read = (path) => JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
  for (const path of ["apps/docs/package.json", "packages/ui/package.json"]) {
    const json = read(path);
    const version = json.dependencies?.[pkg] ?? json.devDependencies?.[pkg];
    if (version) return version;
  }
  return "latest";
}

/**
 * A shadcn registry item for one community component. Files shadcn already provides (lib/utils and
 * its own ui primitives) become registryDependencies instead of being shipped, as upstream does.
 */
export function communityRegistryItem(meta) {
  const { files, packages } = collectCommunity(meta.slug);
  const shipped = [...files].filter(([path]) => path !== "lib/utils.ts" && !(path.startsWith("components/ui/") && path !== ORB_LOCAL));
  const type = (path) => (path.startsWith("hooks/") ? "registry:hook" : path.startsWith("components/ui/") ? "registry:ui" : "registry:component");
  // Packages imported only by files shadcn supplies are installed by shadcn with those files.
  const shippedPackages = packages.filter((pkg) => shipped.some(([, code]) => [...code.matchAll(IMPORT_RE)].some(([, spec]) => packageOf(spec) === pkg)));
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `community-${meta.slug}`,
    type: "registry:component",
    title: meta.title,
    description: meta.description,
    author: `${meta.author} (Kokonut UI, MIT) <${meta.docsUrl}>`,
    dependencies: shippedPackages,
    registryDependencies: ["utils", ...meta.registryDependencies],
    files: shipped.map(([path, content]) => ({ path, type: type(path), target: path, content })),
  };
}
