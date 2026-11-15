import type { LoadedData } from "../data.js";

export function listComponents(
  data: LoadedData,
  args: { category?: string },
): string {
  const cat = args.category ?? "all";

  const heiginFiltered =
    cat === "all" || cat === "ui" || cat === "crm"
      ? cat === "all"
        ? data.manifests
        : data.manifests.filter((m) => m.category === cat)
      : [];

  const kokonutFiltered =
    cat === "all" || cat === "community" ? data.kokonut : [];

  const totalCount = heiginFiltered.length + kokonutFiltered.length;

  if (totalCount === 0) {
    return `No components found for category "${cat}". Valid categories: ui, crm, community, all.`;
  }

  const heiginLines = heiginFiltered.map((m) => {
    const client = m.client ? "yes" : "no";
    const deps = m.internalDependencies.length;
    return `${m.name}  |  ${m.category}  |  client: ${client}  |  deps: ${deps}\n  ${m.description}`;
  });

  const kokonutLines = kokonutFiltered.map((k) => {
    const deps = k.dependencies.length;
    return `${k.slug}  |  community  |  client: yes  |  deps: ${deps}\n  ${k.description}`;
  });

  const lines = [...heiginLines, ...kokonutLines];
  const header = `# ${totalCount} component${totalCount === 1 ? "" : "s"}${cat !== "all" ? ` (${cat})` : ""}\n`;
  return header + "\n" + lines.join("\n\n");
}
