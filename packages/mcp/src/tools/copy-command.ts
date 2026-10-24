import type { LoadedData } from "../data.js";

export function copyComponentCommand(
  data: LoadedData,
  args: { component: string; dest?: string },
): string {
  const manifest = data.manifests.find((m) => m.name === args.component);
  if (!manifest) {
    const names = data.manifests.map((m) => m.name).join(", ");
    return `Component "${args.component}" not found. Available: ${names}`;
  }

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
