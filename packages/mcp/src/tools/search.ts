import type { LoadedData } from "../data.js";

interface SearchResult {
  type: "component" | "community" | "token";
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

/**
 * Normalise a string for multi-word matching:
 *   - split camelCase / PascalCase (handle runs of capitals: "AILoadingState" → "ai loading state")
 *   - replace hyphens, underscores, dots, slashes with spaces
 *   - collapse whitespace and lowercase
 */
function normalise(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")        // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")      // acronym boundary: "AILoading" → "AI Loading"
    .replace(/[-_./]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Score whether ALL normalised query words appear in the normalised text.
 * Returns 0.5 if every word is found (lower than a direct substring hit),
 * 0 otherwise.
 */
function scoreAllWords(text: string | undefined, queryWords: string[]): number {
  if (!text || queryWords.length === 0) return 0;
  const norm = normalise(text);
  return queryWords.every((w) => norm.includes(w)) ? 0.5 : 0;
}

export function search(data: LoadedData, args: { query: string }): string {
  const q = args.query.toLowerCase().trim();
  if (!q) return "Please provide a search query.";

  const normQ = normalise(args.query);
  const queryWords = normQ.split(" ").filter(Boolean);
  const isMultiWord = queryWords.length > 1;

  const results: SearchResult[] = [];

  // Search components
  for (const m of data.manifests) {
    const nameScore = scoreMatch(m.name, q);
    const descScore = scoreMatch(m.description, q);
    const exportScore = Math.max(
      ...m.exports.map((e) => scoreMatch(e, q)),
      0,
    );
    let best = Math.max(nameScore, descScore, exportScore);

    // Multi-word fallback: check normalised all-words match
    if (best === 0 && isMultiWord) {
      best = Math.max(
        scoreAllWords(m.name, queryWords),
        scoreAllWords(m.description, queryWords),
        ...m.exports.map((e) => scoreAllWords(e, queryWords)),
      );
    }

    if (best > 0) {
      results.push({
        type: "component",
        name: m.name,
        detail: `[${m.category}] ${m.description}`,
        score: best + (nameScore > 0 ? 1 : 0),
      });
    }
  }

  // Search Kokonut community components
  for (const k of data.kokonut) {
    const slugScore = scoreMatch(k.slug, q);
    const titleScore = scoreMatch(k.title, q);
    const descScore = scoreMatch(k.description, q);
    const catScore = scoreMatch(k.category, q);
    let best = Math.max(slugScore, titleScore, descScore, catScore);

    if (best === 0 && isMultiWord) {
      best = Math.max(
        scoreAllWords(k.slug, queryWords),
        scoreAllWords(k.title, queryWords),
        scoreAllWords(k.description, queryWords),
      );
    }

    if (best > 0) {
      results.push({
        type: "community",
        name: k.slug,
        detail: `[community/${k.category}] ${k.description}`,
        score: best + (slugScore > 0 || titleScore > 0 ? 1 : 0),
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
      let best = Math.max(nameScore, descScore, valScore);

      if (best === 0 && isMultiWord) {
        best = Math.max(
          scoreAllWords(name, queryWords),
          scoreAllWords(token.description, queryWords),
        );
      }

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
      let best = propScore;

      if (best === 0 && isMultiWord) {
        best = scoreAllWords(prop.name, queryWords);
      }

      if (best > 0) {
        results.push({
          type: "component",
          name: `${compName}.${prop.name}`,
          detail: `prop: ${prop.type}${prop.required ? " (required)" : ""}`,
          score: best,
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
