import type { LoadedData } from "../data.js";

export function listComponents(
  data: LoadedData,
  args: { category?: string },
): string {
  const cat = args.category ?? "all";
  const filtered =
    cat === "all"
      ? data.manifests
      : data.manifests.filter((m) => m.category === cat);

  if (filtered.length === 0) {
    return `No components found for category "${cat}". Valid categories: ui, crm, all.`;
  }

  const lines = filtered.map((m) => {
    const client = m.client ? "yes" : "no";
    const deps = m.internalDependencies.length;
    return `${m.name}  |  ${m.category}  |  client: ${client}  |  deps: ${deps}\n  ${m.description}`;
  });

  const header = `# ${filtered.length} component${filtered.length === 1 ? "" : "s"}${cat !== "all" ? ` (${cat})` : ""}\n`;
  return header + "\n" + lines.join("\n\n");
}
