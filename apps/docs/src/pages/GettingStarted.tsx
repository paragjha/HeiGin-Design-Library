import { PageMeta } from "../components/PageMeta";
import { Snippet } from "../components/Snippet";

export function GettingStartedPage() {
  return (
    <article className="page">
      <PageMeta
        title="Getting started"
        description="Install @heigin/ui from npm, copy components into your project via the registry, or use the shadcn CLI. Works with React 18.2+ / 19 and Next.js, Vite, and React Router."
      />
      <header className="page__header">
        <h1>Getting started</h1>
        <p className="lede">Two ways to use HeiGin UI. Both use the same source, tokens and styles.</p>
      </header>

      <section aria-labelledby="pkg-h">
        <h2 id="pkg-h">Option A — install the package</h2>
        <Snippet label="Install" lang="bash" code="npm install @heigin/ui" />
        <p>Import the stylesheet once, in your app root:</p>
        <Snippet
          label="app/layout.tsx"
          code={`import "@heigin/ui/styles.css"; // tokens + component styles
import "@heigin/ui/base.css";   // optional: body font, colours, focus ring, reduced motion`}
        />
        <p>Then use the components:</p>
        <Snippet
          label="Usage"
          code={`import { Button } from "@heigin/ui";

export function Example() {
  return <Button variant="primary">Create lead</Button>;
}`}
        />
        <h3 className="h4">Requirements</h3>
        <ul className="prose-list">
          <li>React 18.2 or 19 (peer dependency). The package ships ES modules and TypeScript types.</li>
          <li>
            Dependencies install automatically: <code className="inline-code">@base-ui/react</code> (accessible primitives) and{" "}
            <code className="inline-code">lucide-react</code> (icons).
          </li>
          <li>
            Load the Inter font yourself (for example with <code className="inline-code">next/font/google</code>). The token stack falls back to system-ui.
          </li>
        </ul>
      </section>

      <section aria-labelledby="copy-h">
        <h2 id="copy-h">Option B — copy the source</h2>
        <p>Copy a component and every file it depends on into your project, the way shadcn/ui works:</p>
        <Snippet label="From the heigin-design-system repo" lang="bash" code="node scripts/copy-component.mjs button dialog --dest ../my-app/components/heigin" />
        <p>
          The files keep their layout (<code className="inline-code">components/ui/button.tsx</code>, <code className="inline-code">lib/cn.ts</code>,{" "}
          <code className="inline-code">styles/tokens.css</code>), so their relative imports keep working. Next, import{" "}
          <code className="inline-code">styles/tokens.css</code> once and install the npm packages the script lists. See{" "}
          <a href="/copy-source">Copyable source</a>.
        </p>
      </section>

      <section aria-labelledby="tw-h">
        <h2 id="tw-h">Using Tailwind CSS?</h2>
        <p>
          You don't need Tailwind. If your app already uses Tailwind v4, the optional theme maps HeiGin tokens to the utility names production uses (
          <code className="inline-code">bg-surface</code>, <code className="inline-code">text-ink</code>,{" "}
          <code className="inline-code">shadow-popover</code>):
        </p>
        <Snippet
          label="globals.css"
          lang="css"
          code={`@import "tailwindcss";
@import "@heigin/ui/tokens.css";
@import "@heigin/ui/tailwind.css";`}
        />
      </section>
    </article>
  );
}
