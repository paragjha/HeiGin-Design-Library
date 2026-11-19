import type { LoadedData } from "../data.js";

export function copyComponentCommand(
  data: LoadedData,
  args: { component: string; dest?: string },
): string {
  // Check HeiGin manifests first
  const manifest = data.manifests.find((m) => m.name === args.component);
  if (manifest) {
    const dest = args.dest ?? "<your-app>/components/heigin";

    const lines = [
      `# Add "${manifest.name}" to your project`,
      "",
      "With the shadcn CLI, from the HeiGin registry (works in any project):",
      "",
      "```bash",
      `npx shadcn@latest add https://ui.heigin.com/r/${manifest.name}.json`,
      "```",
      "",
      "Or, from a clone of the heigin-design-system repo:",
      "",
      "```bash",
      `node scripts/copy-component.mjs ${manifest.name} --dest "${dest}"`,
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
      "With the shadcn CLI, from the HeiGin registry (needs a shadcn project with Tailwind CSS v4):",
      "",
      "```bash",
      `npx shadcn@latest add https://ui.heigin.com/r/community-${kokonut.slug}.json`,
      "```",
      "",
      "Or from a clone of the HeiGin UI repository (copies the file and what it imports into your `@/` root):",
      "",
      "```bash",
      `node scripts/copy-component.mjs community/${kokonut.slug} --dest "${args.dest ?? "<your-app>/src"}"`,
      "```",
      "",
      "Kokonut UI's original is at:",
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
        "## npm dependencies",
        "",
        ...kokonut.dependencies.map((d) => `- ${d}`),
        "",
      );
    }

    if (kokonut.registryDependencies.length > 0) {
      lines.push(
        "## shadcn registry dependencies",
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
