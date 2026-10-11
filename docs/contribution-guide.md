# Contribution guide

## Ground rules

1. **Production is the source of truth.** New visual values must come from the live HeiGin CRM. If they don't, add them as `"evidence": "proposed"` tokens with a reason.
2. **Compose, don't duplicate.** CRM patterns use primitives (Button, Badge, Card, Checkbox…) and never copy their CSS.
3. **Accessibility is part of done.** Every component needs keyboard support, an accessible name and an axe-checked test.
4. **No production data.** Mock data must be fictional. Never commit credentials, cookies, `.env` files or screenshots of real records.

## Adding a component

1. **Create the source**: `packages/ui/src/components/ui/<name>.tsx`, plus `<name>.module.css` if it needs styles.
   - Use relative imports only (`../../lib/cn`, `./button`), so the file stays copyable.
   - Use tokens only (`var(--hg-…)`); no raw colours.
   - Add `"use client"` **only** if it uses hooks, context or event handlers.
   - Use `forwardRef` for DOM components, accept `className`, and give props a JSDoc comment (it becomes the props table).
2. **Export it** from `packages/ui/src/index.ts`.
3. **Test it** in a `*.test.tsx` next to the source: behaviour, keyboard, states, and `expectNoAxeViolations`.
4. **Document it:**
   - Add an example file: `apps/docs/src/examples/<slug>/<example>.tsx` (a default-exported component that imports from `@heigin/ui`, the same way users will).
   - Add a registry entry in `apps/docs/src/content/components.tsx` (or `patterns.tsx`) with evidence, states, accessibility notes and an optional playground.
5. **Regenerate** with `npm run manifests` (and `npm run tokens` if you touched `tokens.json`). CI fails if these are stale.
6. **Verify:**
   ```bash
   npm run lint && npm run typecheck && npm test
   npm run build:ui && npm run validate:package && npm run source:check
   npm run build:docs && npm run test:e2e
   ```
7. **Update** `docs/component-inventory.md` and `CHANGELOG.md` (Unreleased).

## Changing tokens

Edit `tokens/tokens.json` only; the CSS, TS and Tailwind files are generated. Keep `evidence` and `live` accurate. If you change a value, include before/after contrast ratios when text or controls are affected.

## Local development

```bash
npm install
npm run dev            # docs at http://localhost:5180 (renders the library from source, with HMR)
npm run build:ui       # needed before running the Next.js example
npm run dev:example    # Next.js example at http://localhost:3200
npm run test:watch
```

## Commit and PR conventions

Use [Conventional Commits](https://www.conventionalcommits.org) (`feat(ui): …`, `fix(docs): …`). Keep PRs small, and fill in the PR template checklist.
