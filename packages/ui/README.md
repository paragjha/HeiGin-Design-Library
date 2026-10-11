# @heigin/ui

React + TypeScript components and design tokens for the HeiGin CRM.

```bash
npm install @heigin/ui
```

```tsx
import "@heigin/ui/styles.css";
import { Button } from "@heigin/ui";

export function Example() {
  return <Button variant="primary">Create lead</Button>;
}
```

| Entry | What it is |
| --- | --- |
| `@heigin/ui` | Components, hooks and formatters (ESM + `.d.ts`) |
| `@heigin/ui/styles.css` | Tokens + all component styles (import once) |
| `@heigin/ui/base.css` | Optional global defaults (body font/colour, focus ring, reduced motion) |
| `@heigin/ui/tokens.css` | Tokens only (`--hg-*` custom properties) |
| `@heigin/ui/tokens` | Tokens as TypeScript (`tokens`, `vars`, `tokenMeta`) |
| `@heigin/ui/tailwind.css` | Optional Tailwind v4 `@theme` mapping |

Peer dependencies: `react` and `react-dom` >= 18.2. Interactive components are marked `"use client"` for the Next.js App Router.

Full documentation, the copy-source workflow and the release process live in the repository README.
