export function getSetupGuide(args: {
  framework?: string;
}): string {
  const fw = args.framework ?? "general";

  const common = `## Install

\`\`\`bash
npm install @heigin/ui
\`\`\`

## Package exports

| Import path              | What it provides                    |
|--------------------------|-------------------------------------|
| \`@heigin/ui\`             | All React components                |
| \`@heigin/ui/tokens\`      | Token values as TS constants        |
| \`@heigin/ui/styles.css\`  | Component styles + tokens (all CSS) |
| \`@heigin/ui/tokens.css\`  | Token CSS custom properties only    |
| \`@heigin/ui/tailwind.css\`| Tailwind v4 @theme mapping          |
| \`@heigin/ui/base.css\`    | Optional global reset               |
`;

  const copySource = `## Copy-source alternative (shadcn-style)

Instead of the npm package, copy individual components into your project:

\`\`\`bash
node scripts/copy-component.mjs button --dest ./components/heigin
\`\`\`

This copies the component, its CSS module, and all transitive dependencies.
`;

  if (fw === "nextjs") {
    return `# Setup: Next.js (App Router)

${common}

## CSS import

In your root layout (\`app/layout.tsx\`):

\`\`\`tsx
import "@heigin/ui/styles.css";
\`\`\`

## Server vs Client components

Components marked \`client: true\` need the \`"use client"\` directive — the library handles this automatically. Server Components can render non-client components directly.

## Tailwind v4 integration (optional)

If using Tailwind, import the theme mapping in your CSS:

\`\`\`css
@import "@heigin/ui/tailwind.css";
\`\`\`

This maps HeiGin tokens to Tailwind utilities (e.g. \`bg-surface\`, \`text-ink\`, \`rounded-md\`).

${copySource}`;
  }

  if (fw === "vite") {
    return `# Setup: Vite + React

${common}

## CSS import

In your entry file (\`main.tsx\` or \`App.tsx\`):

\`\`\`tsx
import "@heigin/ui/styles.css";
\`\`\`

## Tailwind v4 integration (optional)

\`\`\`css
@import "@heigin/ui/tailwind.css";
\`\`\`

${copySource}`;
  }

  if (fw === "remix") {
    return `# Setup: Remix

${common}

## CSS import

In your root route (\`app/root.tsx\`):

\`\`\`tsx
import heiginStyles from "@heigin/ui/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: heiginStyles }];
\`\`\`

${copySource}`;
  }

  // General
  return `# Setup: @heigin/ui

${common}

## CSS import

Import the stylesheet in your app's entry point:

\`\`\`tsx
import "@heigin/ui/styles.css";
\`\`\`

## Usage example

\`\`\`tsx
import { Button, Badge } from "@heigin/ui";

function App() {
  return (
    <div>
      <Button variant="solid" size="md" onClick={() => {}}>
        Save
      </Button>
      <Badge tone="success">Active</Badge>
    </div>
  );
}
\`\`\`

${copySource}`;
}
