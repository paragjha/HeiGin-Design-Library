import type { LoadedData } from "../data.js";

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

    for (const [name, token] of Object.entries(group)) {
      if (typeof token !== "object" || token === null || !("value" in token))
        continue;

      if (
        searchLower &&
        !name.toLowerCase().includes(searchLower) &&
        !token.description.toLowerCase().includes(searchLower) &&
        !token.value.toLowerCase().includes(searchLower)
      ) {
        continue;
      }

      const cssVar = `--hg-${cat}-${name}`;
      entries.push(
        `  ${cssVar}: ${token.value}\n    ${token.description} [${token.evidence}] (production: ${token.live})`,
      );
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
