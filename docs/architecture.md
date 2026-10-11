# Architecture

## Repository layout (npm workspaces)

```
heigin-design-system/
├── tokens/tokens.json         Source of truth for design tokens (with evidence per token)
├── packages/ui/               @heigin/ui — the library
│   ├── src/components/ui/     Primitives (one .tsx + optional .module.css each)
│   ├── src/components/crm/    CRM patterns composed from primitives (+ crm.module.css)
│   ├── src/lib/               cn(), INR formatters
│   ├── src/styles/            tokens.css, tailwind.css (generated), base.css, index.css
│   └── src/tokens.ts          Generated TS tokens
├── source/manifests/          Generated copy-source manifests (one JSON per component)
├── apps/docs/                 Vite + React documentation site (static build)
├── apps/nextjs-example/       Next.js App Router example
├── scripts/                   build-tokens, build-manifests, copy-component, validate-package, check-source-copy, check-secrets
├── tests/                     Vitest setup, axe helper, Playwright specs
└── docs/                      Audit, inventory, architecture, accessibility, contribution and release guides
```

**npm workspaces** were chosen over pnpm because npm ships with Node, the existing HeiGin repos use npm, and nothing here needs pnpm's stricter linking. The source-copy check gives the hidden-dependency protection that pnpm would otherwise provide.

## Single source, two distributions

The copyable source **is** `packages/ui/src`. There is no second copy that could drift.

```
tokens.json ──build-tokens──▶ tokens.css · tailwind.css · tokens.ts
packages/ui/src ──vite (lib, preserveModules)──▶ dist/*.js  +  dist/styles.css
               ──tsc ──▶ dist/*.d.ts ──postbuild──▶ .js extensions, CSS refs stripped
               ──build-manifests (import graph)──▶ source/manifests/*.json
               ──copy-component──▶ <your app>/components/heigin/…
               ──docs (Vite alias to src + ?raw)──▶ live previews + source panels
```

## Styling decisions

- **CSS custom properties** for all tokens, prefixed `--hg-` so they never collide with a consumer's own `--color-*` (Tailwind v4 uses that namespace).
- **CSS Modules** for component styles. They are scoped, they need no runtime, they copy cleanly into Next.js and Vite, and they don't force Tailwind on consumers. Production *uses* Tailwind, so `tailwind.css` maps the tokens back to production's utility names for Tailwind apps.
- In the package build, all CSS is extracted to a single `dist/styles.css`. JS output never imports CSS, which keeps Next.js from rejecting global CSS imported from `node_modules` inside components. Consumers import `@heigin/ui/styles.css` once.
- `sideEffects: ["**/*.css"]` makes JS tree-shakeable. Because of this, `import "@heigin/ui"` on its own does **not** pull in styles; import `styles.css` explicitly. The docs follow the same rule, and an e2e test caught this.

## Primitives

[Base UI](https://base-ui.com) (`@base-ui/react`) supplies focus management, ARIA patterns, positioning and keyboard handling. HeiGin's earlier repos already chose it through shadcn's `base-nova` style. HeiGin UI wraps each primitive with a narrow, typed API and HeiGin styling, and exposes Base UI's `render` prop only where composition matters (for example, triggers that render a HeiGin `Button`).

## Server and client components

Modules that use hooks, context or event handlers start with `"use client"`. The Vite build re-adds the directive to each preserved output module (`preserveUseClient` plugin in `packages/ui/vite.config.ts`). Display components (Badge, Card, MetricCard, MoneyValue, StatusBadge, PageHeader, RecordHeader, Timeline, ConversationListItem and others) have no directive and render on the server. The manifests record `client: true|false`, and the docs show it on every page.

## Types and package exports

- ESM only, with `exports` for `.`, `./tokens`, `./styles.css`, `./tokens.css`, `./tailwind.css`, `./base.css`, and `./package.json`.
- Declarations are emitted by `tsc` and post-processed to Node16-valid specifiers. The checks are publint, are-the-types-wrong (node16-esm and bundler), and a strict `nodenext` consumer compile in `validate-package`.
- Peer dependencies: `react` and `react-dom` >= 18.2. Dependencies: `@base-ui/react`, `lucide-react`.
