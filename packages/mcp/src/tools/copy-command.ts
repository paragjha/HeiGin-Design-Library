import type { LoadedData } from "../data.js";

export function copyComponentCommand(
  data: LoadedData,
  args: { component: string; dest?: string },
): string {
  // Check HeiGin manifests first
  const manifest = data.manifests.find((m) => m.name === args.component);
  if (manifest) {
    const dest = args.dest ?? "<your-app>/components/heigin";
    const command = `node scripts/copy-component.mjs ${manifest.name} --dest ${dest}`;

    const lines = [
      `# Copy "${manifest.name}" into your project`,
      "",
      "```bash",
      command,
      "```",
      "",
      "## What gets copied",
      "",
      ...manifest.files.map((f) => `- ${f}`),
      "",
    ];

    if (manifest.internalDependencies.length > 0) {
      lines.push(
        `## Internal dependencies (copied automatically)`,
        "",
        ...manifest.internalDependencies.map((d) => `- ${d}`),
        "",
      );
    }

    if (manifest.install.length > 0) {
      lines.push(
        "## npm packages to install",
        "",
        "```bash",
        `npm install ${manifest.install.join(" ")}`,
        "```",
      );
    } else {
      lines.push("No additional npm packages needed.");
    }

    return lines.join("\n");
  }

  // Check Kokonut community components
  const kokonut = data.kokonut.find((k) => k.slug === args.component);
  if (kokonut) {
    const lines = [
      `# Install "${kokonut.title}" (community component)`,
      "",
      "```bash",
      `npx shadcn@latest add ${kokonut.registryUrl}`,
      "```",
      "",
      `**Author:** ${kokonut.author}  |  **License:** MIT`,
      "",
    ];

    if (kokonut.dependencies.length > 0) {
      lines.push(
        "## npm dependencies (installed automatically)",
        "",
        ...kokonut.dependencies.map((d) => `- ${d}`),
        "",
      );
    }

    if (kokonut.registryDependencies.length > 0) {
      lines.push(
        "## Registry dependencies (installed automatically)",
        "",
        ...kokonut.registryDependencies.map((d) => `- ${d}`),
        "",
      );
    }

    return lines.join("\n");
  }

  const allNames = [
    ...data.manifests.map((m) => m.name),
    ...data.kokonut.map((k) => k.slug),
  ].join(", ");
  return `Component "${args.component}" not found. Available: ${allNames}`;
}
