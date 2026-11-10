// Pure manifest → shadcn-registry-item mapping. Unit-testable; no I/O here.

/**
 * Map a repo file path (e.g. "packages/ui/src/components/ui/button.tsx") to
 * the shadcn-CLI destination path a consumer app will see
 * ("components/ui/button.tsx") and the shadcn file type.
 *
 * Decisions:
 *   - Strip the packages/ui/src prefix so `components/ui/button.tsx` lands at
 *     shadcn's default alias `@/components/ui/button.tsx`.
 *   - `lib/cn.ts` and other helpers under `lib/` use the `registry:lib` type.
 *   - `styles/*.css` (tokens.css) uses `registry:style`; stylesheets co-located
 *     with a component use `registry:ui` so they travel with the .tsx.
 */
export function mapFile(repoPath) {
  const stripped = repoPath.replace(/^packages\/ui\/src\//, "");
  let type;
  if (stripped.startsWith("styles/")) type = "registry:style";
  else if (stripped.startsWith("lib/")) type = "registry:lib";
  else type = "registry:ui";
  return { path: stripped, type };
}

/**
 * Build a shadcn-compatible registry item from a HeiGin manifest, the resolved
 * file bodies (map of repoPath → content), the resolved license tier, and the
 * @heigin/ui package version at generate-time.
 *
 * `access` is derived from the tier: "free" → "public", any paid tier → "gated".
 * Gated items replace every file body with a short error stub so a public JSON
 * leak never reveals paid source.
 */
export function buildItem({ manifest, fileBodies, tier, version }) {
  const access = tier === "free" ? "public" : "gated";

  const inputFiles = [...manifest.files];
  // tokens.css travels with every item via the shared @heigin/tokens
  // registryDependency (see generator). Exclude it from this item's files[].
  const filesWithoutTokens = inputFiles.filter((p) => !/\/styles\/tokens\.css$/.test(p));

  const files = filesWithoutTokens.map((repoPath) => {
    const mapped = mapFile(repoPath);
    const content =
      access === "public"
        ? fileBodies.get(repoPath)
        : `// @heigin/${manifest.name} requires a HeiGin ${tier[0].toUpperCase() + tier.slice(1)} license.\n// Visit https://heigin.com/pricing to buy; set HEIGIN_LICENSE in your env, then re-run.\nthrow new Error("@heigin/${manifest.name}: ${tier} license required.");\n`;
    if (content === undefined) throw new Error(`Missing file body for ${repoPath} (item ${manifest.name})`);
    return { path: mapped.path, type: mapped.type, content };
  });

  // dependencies = npm packages the consumer must install.
  // registryDependencies = other @heigin/* items shadcn should fetch.
  // We DROP react from `dependencies` — every consumer app already has it.
  const npmDeps = new Set(manifest.install ?? []);
  for (const k of Object.keys(manifest.npmDependencies ?? {})) {
    if (k !== "react") npmDeps.add(k);
  }

  const registryDeps = [
    ...(manifest.internalDependencies ?? []),
    "@heigin/tokens",
  ];

  return {
    $schema: "https://heigin.com/schemas/registry-item.json",
    name: manifest.name,
    type: "registry:ui",
    title: toTitle(manifest.name),
    description: stripMarkdown(manifest.description ?? ""),
    category: manifest.category,
    version,
    license: tier,
    access,
    framework: ["react+next", "react+vite", "react-router-v7"],
    dependencies: [...npmDeps].sort(),
    devDependencies: [],
    registryDependencies: dedupe(registryDeps),
    files,
    tailwind: {},
    cssVars: {},
  };
}

/**
 * The shared @heigin/tokens item that every other item depends on. Carries the
 * single tokens.css file and nothing else.
 */
export function buildTokensItem({ tokensCss, version }) {
  return {
    $schema: "https://heigin.com/schemas/registry-item.json",
    name: "tokens",
    type: "registry:style",
    title: "HeiGin tokens",
    description: "HeiGin design tokens as CSS variables. Imported once in your app root so every HeiGin component picks them up.",
    category: "ui",
    version,
    license: "free",
    access: "public",
    framework: ["react+next", "react+vite", "react-router-v7"],
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    files: [{ path: "styles/heigin-tokens.css", type: "registry:style", content: tokensCss }],
    tailwind: {},
    cssVars: {},
  };
}

function toTitle(slug) {
  return slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function stripMarkdown(s) {
  return s.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
}

function dedupe(a) {
  return [...new Set(a)];
}
