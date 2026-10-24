import type { LoadedData, ManifestEntry } from "../data.js";

function getPropsForManifest(
  data: LoadedData,
  manifest: ManifestEntry,
): string {
  const sections: string[] = [];

  for (const exportName of manifest.exports) {
    const entry = data.props[exportName];
    if (!entry) continue;

    const propLines = entry.props.map((p) => {
      const req = p.required ? "(required)" : "(optional)";
      const def = p.defaultValue != null ? ` = ${p.defaultValue}` : "";
      const desc = p.description ? `  — ${p.description}` : "";
      return `  ${p.name}: ${p.type} ${req}${def}${desc}`;
    });

    sections.push(`### ${exportName}\n${propLines.join("\n")}`);
  }

  // Also check for sub-components (e.g. CardHeader, CardBody)
  for (const [key, entry] of Object.entries(data.props)) {
    if (manifest.exports.includes(key)) continue;
    const slug = manifest.name.replace(/-/g, "");
    if (key.toLowerCase().startsWith(slug)) {
      const propLines = entry.props.map((p) => {
        const req = p.required ? "(required)" : "(optional)";
        const def = p.defaultValue != null ? ` = ${p.defaultValue}` : "";
        const desc = p.description ? `  — ${p.description}` : "";
        return `  ${p.name}: ${p.type} ${req}${def}${desc}`;
      });
      sections.push(`### ${key}\n${propLines.join("\n")}`);
    }
  }

  return sections.length > 0 ? sections.join("\n\n") : "No props data available.";
}

export function getComponent(
  data: LoadedData,
  args: { name: string },
): string {
  const manifest = data.manifests.find((m) => m.name === args.name);
  if (!manifest) {
    const names = data.manifests.map((m) => m.name).join(", ");
    return `Component "${args.name}" not found. Available: ${names}`;
  }

  const importNames = manifest.exports.join(", ");
  const typeNames = manifest.types.join(", ");
  const installPkgs =
    manifest.install.length > 0
      ? `npm install ${manifest.install.join(" ")}`
      : "No additional packages needed.";

  const lines = [
    `# ${manifest.name}`,
    "",
    manifest.description,
    "",
    `**Category:** ${manifest.category}`,
    `**Needs "use client":** ${manifest.client ? "yes" : "no"}`,
    "",
    "## Import",
    "```tsx",
    `import { ${importNames} } from "@heigin/ui";`,
    "```",
    "",
    `**Exported types:** ${typeNames}`,
    "",
    "## Props",
    "",
    getPropsForManifest(data, manifest),
    "",
    "## Dependencies",
    "",
    `**Internal:** ${manifest.internalDependencies.length > 0 ? manifest.internalDependencies.join(", ") : "none"}`,
    `**Install:** ${installPkgs}`,
    "",
    "## Files",
    "",
    manifest.files.map((f) => `- ${f}`).join("\n"),
  ];

  return lines.join("\n");
}
