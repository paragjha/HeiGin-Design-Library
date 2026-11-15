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
  // Check HeiGin manifests first
  const manifest = data.manifests.find((m) => m.name === args.name);
  if (manifest) {
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

  // Check Kokonut community components
  const kokonut = data.kokonut.find((k) => k.slug === args.name);
  if (kokonut) {
    const lines = [
      `# ${kokonut.title}`,
      "",
      kokonut.description,
      "",
      `**Category:** community (${kokonut.category})`,
      `**Author:** ${kokonut.author}`,
      `**Version:** ${kokonut.version}`,
      `**License:** MIT`,
      kokonut.modified ? `**Note:** Modified from upstream — uses ThinkingOrb from @heigin/ui` : "",
      "",
      "## Install",
      "```bash",
      `npx shadcn@latest add ${kokonut.registryUrl}`,
      "```",
      "",
      `**Export:** ${kokonut.exportName}`,
      "",
      "## API",
      "",
      kokonut.api,
      "",
      "## Dependencies",
      "",
      `**npm:** ${kokonut.dependencies.length > 0 ? kokonut.dependencies.join(", ") : "none"}`,
      `**Registry:** ${kokonut.registryDependencies.length > 0 ? kokonut.registryDependencies.join(", ") : "none"}`,
      "",
      `**Docs:** ${kokonut.docsUrl}`,
    ];

    return lines.filter(Boolean).join("\n");
  }

  const allNames = [
    ...data.manifests.map((m) => m.name),
    ...data.kokonut.map((k) => k.slug),
  ].join(", ");
  return `Component "${args.name}" not found. Available: ${allNames}`;
}
