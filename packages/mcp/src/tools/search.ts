import type { LoadedData } from "../data.js";

interface SearchResult {
  type: "component" | "token";
  name: string;
  detail: string;
  score: number;
}

function scoreMatch(text: string | undefined, query: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower === query) return 3;
  if (lower.startsWith(query)) return 2;
  if (lower.includes(query)) return 1;
  return 0;
}

export function search(data: LoadedData, args: { query: string }): string {
  const q = args.query.toLowerCase().trim();
  if (!q) return "Please provide a search query.";

  const results: SearchResult[] = [];

  // Search components
  for (const m of data.manifests) {
    const nameScore = scoreMatch(m.name, q);
    const descScore = scoreMatch(m.description, q);
    const exportScore = Math.max(
      ...m.exports.map((e) => scoreMatch(e, q)),
      0,
    );
    const best = Math.max(nameScore, descScore, exportScore);

    if (best > 0) {
      results.push({
        type: "component",
        name: m.name,
        detail: `[${m.category}] ${m.description}`,
        score: best + (nameScore > 0 ? 1 : 0),
      });
    }
  }

  // Search tokens
  for (const [cat, group] of Object.entries(data.tokens)) {
    for (const [name, token] of Object.entries(group)) {
      if (typeof token !== "object" || token === null || !("value" in token))
        continue;

      const nameScore = scoreMatch(name, q);
      const descScore = scoreMatch(token.description, q);
      const valScore = scoreMatch(token.value, q);
      const best = Math.max(nameScore, descScore, valScore);

      if (best > 0) {
        results.push({
          type: "token",
          name: `--hg-${cat}-${name}`,
          detail: `${token.value} — ${token.description}`,
          score: best,
        });
      }
    }
  }

  // Search props
  for (const [compName, entry] of Object.entries(data.props)) {
    for (const prop of entry.props) {
      const propScore = scoreMatch(prop.name, q);
      if (propScore > 0) {
        results.push({
          type: "component",
          name: `${compName}.${prop.name}`,
          detail: `prop: ${prop.type}${prop.required ? " (required)" : ""}`,
          score: propScore,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 20);

  if (top.length === 0) {
    return `No results for "${args.query}".`;
  }

  const lines = top.map(
    (r) => `[${r.type}] ${r.name}\n  ${r.detail}`,
  );

  return `# ${results.length} result${results.length === 1 ? "" : "s"} for "${args.query}" (showing top ${top.length})\n\n${lines.join("\n\n")}`;
}
