import type { LoadedData } from "../data.js";

interface Leaf {
  /** Dotted name within the category, e.g. "size-md" or "family-sans". */
  name: string;
  value: string;
  description?: string;
  evidence?: string;
  /** Production CSS variable mapping, when the token has one. */
  live?: string;
}

/** Walks a token group recursively and yields every leaf — an object with a string `value`. */
function* walk(node: unknown, path: string[] = []): Generator<Leaf> {
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (typeof n.value === "string") {
    yield {
      name: path.join("-"),
      value: n.value,
      description: typeof n.description === "string" ? n.description : undefined,
      evidence: typeof n.evidence === "string" ? n.evidence : undefined,
      live: typeof n.live === "string" ? n.live : undefined,
    };
    return;
  }
  for (const [key, child] of Object.entries(n)) {
    if (key.startsWith("$")) continue; // skip $meta / $extensions and similar
    yield* walk(child, [...path, key]);
  }
}

export function getTokens(
  data: LoadedData,
  args: { category?: string; search?: string },
): string {
  const results: string[] = [];

  const categories =
    args.category && args.category !== "all"
      ? [args.category]
      : data.tokenCategories;

  const searchLower = args.search?.toLowerCase();

  for (const cat of categories) {
    const group = data.tokens[cat];
    if (!group) continue;

    const entries: string[] = [];

    for (const leaf of walk(group)) {
      if (
        searchLower &&
        !leaf.name.toLowerCase().includes(searchLower) &&
        !(leaf.description ?? "").toLowerCase().includes(searchLower) &&
        !leaf.value.toLowerCase().includes(searchLower)
      ) {
        continue;
      }

      const cssVar = `--hg-${cat}-${leaf.name}`;
      const meta: string[] = [];
      if (leaf.description) meta.push(leaf.description);
      if (leaf.evidence) meta.push(`[${leaf.evidence}]`);
      if (leaf.live) meta.push(`(production: ${leaf.live})`);
      const suffix = meta.length ? `\n    ${meta.join(" ")}` : "";
      entries.push(`  ${cssVar}: ${leaf.value}${suffix}`);
    }

    if (entries.length > 0) {
      results.push(`## ${cat} (${entries.length} tokens)\n\n${entries.join("\n\n")}`);
    }
  }

  if (results.length === 0) {
    if (args.search) {
      return `No tokens matching "${args.search}". Categories: ${data.tokenCategories.join(", ")}`;
    }
    return `No tokens found for category "${args.category}". Valid: ${data.tokenCategories.join(", ")}`;
  }

  return results.join("\n\n");
}
