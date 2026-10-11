# HeiGin UI

The design system for the **HeiGin CRM**: design tokens, React + TypeScript components, CRM patterns, an interactive docs site and a Next.js example, all taken from the live CRM.

- **Tokens** come from production CSS. Each one is tagged *observed*, *derived* or *proposed*.
- **Two ways to use it:** install the npm package (`@heigin/ui`), or copy individual components shadcn-style with a dependency-aware script.
- **Accessible:** Base UI primitives, keyboard and axe tests on every component, and documented contrast fixes.

> **Status:** v0.1.0, not yet published. Published publicly on npm as `@heigin/ui` under a proprietary licence (internal HeiGin use only). See [npm setup](docs/npm-setup.md) and the [release process](docs/release-process.md).

## Quick start

```bash
npm install            # Node 20.11+; npm workspaces
npm run dev            # docs site → http://localhost:5180
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Docs site with HMR. It renders the library from source. |
| `npm run build` | Builds the library, the docs (static, `apps/docs/dist`) and the Next.js example |
| `npm run build:ui` | Builds `@heigin/ui` (`packages/ui/dist`) |
| `npm run dev:example` | Next.js example at http://localhost:3200 (run `build:ui` first) |
| `npm test` | Unit and interaction tests (Vitest, Testing Library, axe-core) |
| `npm run test:e2e` | Playwright browser tests: docs at desktop and mobile widths, plus the Next.js app. Locally it uses installed Microsoft Edge; set `PW_CHANNEL=chrome` or install Chromium elsewhere. Needs `npm run build` first. |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc` across all workspaces |
| `npm run validate:package` | Packs the library and checks the tarball: file list, publint, are-the-types-wrong, install into a throwaway app, SSR render, strict `nodenext` type check |
| `npm run source:check` | Copies every component into an empty directory and type-checks it in isolation |
| `npm run tokens` / `npm run manifests` | Regenerates token outputs and copy manifests (`-- --check` in CI) |
| `npm run check:secrets` | Scans for credentials and session files |
| `npm run ci` | Everything above except e2e |

## Using the package

```bash
npm install @heigin/ui
```

```tsx
// app/layout.tsx
import "@heigin/ui/styles.css"; // tokens + component styles (required, once)
import "@heigin/ui/base.css";   // optional global defaults

// anywhere
import { Button } from "@heigin/ui";

export function Example() {
  return <Button variant="primary">Create lead</Button>;
}
```

| Export | Contents |
| --- | --- |
| `@heigin/ui` | Components, `useToast`, formatters (`formatINR`, `formatINRCompact`) |
| `@heigin/ui/tokens` | `tokens`, `vars` and `tokenMeta` as TypeScript |
| `@heigin/ui/styles.css` · `tokens.css` · `base.css` · `tailwind.css` | Styles |

React 18.2+ or 19. Interactive components carry `"use client"`; display components render in Server Components. See [Next.js integration](apps/docs/src/pages/Guides.tsx) in the docs.

## Builder

The docs site includes a **Builder** (`/#/builder`) for putting together a page, a section or a single component from library blocks:

- Start from a template (leads list, dashboard, deal detail, settings form) or a blank page, section or component.
- Add blocks, edit their props, and reorder or duplicate them. It has undo/redo and saves your work in the browser.
- Copy or download the generated `.tsx`. It imports only from `@heigin/ui`, `lucide-react` and `react`, and adds `"use client"` only when the result needs state or handlers.

A unit test compiles the generated code for every template and every block against the library, so copied code type-checks.

## Copying source instead

```bash
node scripts/copy-component.mjs approval-card --dest ../my-app/components/heigin
```

This copies the component and everything it imports, keeps relative paths, never overwrites without `--force`, and prints the npm packages to install. Details: [source/README.md](source/README.md).

## Adding a component

See [docs/contribution-guide.md](docs/contribution-guide.md). In short: source, then export, then a test with axe, then a docs example and registry entry, then `npm run manifests`.

## Repository map

| Path | |
| --- | --- |
| `tokens/` | `tokens.json` (source of truth), plus generated `tokens.css` and `tokens.ts` |
| `packages/ui/` | The library |
| `source/manifests/` | Generated copy-source manifests |
| `apps/docs/` | Interactive docs (Vite + React) |
| `apps/nextjs-example/` | App Router example with mock CRM data. Uses the package, plus a `/copied` route that uses copied source |
| `scripts/` | Token, manifest, copy, validation and secret-scan scripts |
| `tests/` | Test setup and Playwright specs |
| `docs/` | [Design audit](docs/design-audit.md) · [Component inventory](docs/component-inventory.md) · [Architecture](docs/architecture.md) · [Accessibility](docs/accessibility.md) · [Contribution guide](docs/contribution-guide.md) · [Release process](docs/release-process.md) |

## Security and data

The live CRM was used read-only as a visual reference. The repo contains no production records, credentials, cookies or `.env` files; `npm run check:secrets` and the CI gitleaks job enforce this. Example data is fictional.

## License

Proprietary: internal HeiGin use only. See [LICENSE](LICENSE).
