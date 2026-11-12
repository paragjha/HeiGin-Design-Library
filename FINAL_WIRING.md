# Final wiring — restructure merge checklist

To be executed by Claude after Gemini's G1–G6 PRs land on `main`. This is the one commit that touches `App.tsx` to glue everything together.

## Precondition check

- [ ] `source/categories.json` exists; `generated/catalog.ts` has a `categories` export (G1).
- [ ] `apps/docs/src/components/DocsSidebar.tsx` and `MarketingNav.tsx` exist (G2).
- [ ] `apps/docs/src/pages/ComponentsIndex.tsx` and `CategoryPage.tsx` exist (G3).
- [ ] `apps/docs/src/pages/BlocksIndex.tsx` + `source/blocks.json` exist (G4).
- [ ] `apps/docs/src/pages/account/*.tsx` exists; `ACCOUNTS_ENABLED` flag in `lib/features.ts` (G5).
- [ ] `apps/docs/src/pages/Pricing.tsx` expanded; `apps/docs/src/components/Footer.tsx` exists (G6).
- [ ] CI green on `main` after each Gemini PR merges.

## The wiring commit

### 1. Rewire `apps/docs/src/App.tsx`

- Split routes into two shells:
  - **MarketingShell**: `/`, `/components*`, `/patterns*`, `/blocks*`, `/templates*`, `/pricing`. Uses `MarketingNav` + `Footer`.
  - **DocsShell**: `/docs/*`, `/account/*` (when flag on). Uses `DocsSidebar`.
- Add redirect pass at the top of the route resolver using the map in `REDIRECTS.md`.
- Swap `Overview` for `Landing` at `/`.
- Create new `DocsOverview.tsx` at `/docs` (orientation page: what's here, three quick links to Getting Started / Components / MCP). Reuse Overview's category-card data, trimmed.
- Delete `/showcase` route handler. Delete `ShowcasePage` import.
- Register category routes: for each entry in `catalog.categories`, register `/components/<category-id>` → `CategoryPage`.

### 2. Update `apps/docs/src/pages/Landing.tsx`

- Swap `MarketingNavPlaceholder` → import from `../components/MarketingNav`.
- Swap `FooterPlaceholder` → import from `../components/Footer`.
- Remove the `// GEMINI: replace` comments.

### 3. Delete

- `apps/docs/src/pages/Showcase.tsx`
- `apps/docs/src/showcase/` folder (entire; see REDIRECTS.md § Showcase deletion specifics)
- `apps/docs/src/showcase.css` if standalone
- Any `Showcase`/`showcase` import in `App.tsx`

### 4. Update `vercel.json`

Add `redirects` block matching `REDIRECTS.md` § Permanent redirects. Each entry: `{ "source": "/old", "destination": "/new", "permanent": true }`.

### 5. Regenerate

```bash
npm run build-catalog -w apps/docs   # if separate; otherwise pretypecheck covers it
node apps/docs/scripts/generate-sitemap.mjs
```

Verify `apps/docs/public/sitemap.xml` has the new routes and no `/showcase` or `/tokens/*` (pre-pivot) entries.

### 6. Update `scripts/release-verify.mjs`

- Add cross-check: parse `REDIRECTS.md` map, parse `vercel.json` redirects, fail if they drift.
- Add cross-check: every path in the `App.tsx` route table should resolve either to a page component or a redirect entry (no 404 holes).

### 7. Update `CHANGELOG.md`

New `### Changed — YYYY-MM-DD` section documenting the restructure. Don't list every file; list the user-visible changes:

- `/` is now the marketing landing page.
- Docs moved under `/docs/*`; old paths 301 to new ones.
- Gallery deleted; components organised by category under `/components/<category>`.
- Patterns, Blocks, Templates split into their own navigation destinations.
- New Account section behind `ACCOUNTS_ENABLED` flag (off by default).

### 8. QA pass before pushing

- [ ] `npm run typecheck -w apps/docs`
- [ ] `npm run build -w apps/docs`
- [ ] `npm run release:verify`
- [ ] Manually visit: `/`, `/components`, `/components/<any-category>`, `/components/button`, `/docs`, `/docs/getting-started`, `/docs/tokens/colors`, `/pricing`, `/blocks`, `/showcase` (should redirect), `/tokens` (should redirect).
- [ ] Open the sitemap at `/sitemap.xml`; confirm no broken paths.
- [ ] Keyboard nav through `DocsSidebar`: ↑↓, →←, Enter.
- [ ] Ctrl+K search opens; results group by type.

### 9. Merge

Open a single PR `restructure: final wiring — marketing shell, /docs namespace, redirects, Gallery deletion`. Squash-merge after CI passes.

## Rollback

If anything blocks shipping:
- `git revert` the final wiring commit — the individual Gemini PRs stay in place, and the site keeps working on the old routes.
- Landing.tsx stays unreachable (file exists, not routed) — zero user-visible impact.
