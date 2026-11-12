# Gemini — restructure task split

Read `GEMINI_CONTEXT.md` first. Current HEAD: `8a213d8` on `main`.

Work on branch: `restructure/gemini-phase-1`. Open a PR when each task below is done. One PR per task group — don't batch all six into one PR.

---

## G1. Component taxonomy — single source of truth

**Deliverable:** `source/categories.json`

Place every one of the 31 primitives + 18 patterns from `apps/docs/src/generated/catalog.ts` into exactly one leaf. Shape:

```json
{
  "$comment": "Component taxonomy. Every slug in catalog.ts must appear in exactly one leaf. build-catalog.mjs will fail the build if a slug is missing or duplicated.",
  "groups": [
    {
      "id": "foundations",
      "label": "Foundations",
      "categories": [
        { "id": "buttons-actions", "label": "Buttons & Actions", "slugs": ["button", "icon-button", ...] },
        { "id": "inputs-forms", "label": "Inputs & Forms", "slugs": [...] },
        { "id": "layout", "label": "Layout", "slugs": [...] }
      ]
    },
    {
      "id": "interface",
      "label": "Interface",
      "categories": [
        { "id": "navigation", "label": "Navigation", "slugs": [...] },
        { "id": "data-display", "label": "Data Display", "slugs": [...] },
        { "id": "feedback-status", "label": "Feedback & Status", "slugs": [...] },
        { "id": "overlays-dialogs", "label": "Overlays & Dialogs", "slugs": [...] },
        { "id": "interactive", "label": "Interactive Elements", "slugs": [...] }
      ]
    }
  ]
}
```

Then extend `apps/docs/scripts/build-catalog.mjs` to:
1. Read `source/categories.json`.
2. Fail if a catalog slug is missing or duplicated across categories.
3. Emit `categories` array into `apps/docs/src/generated/catalog.ts` with the full shape above.

Patterns (CRM) can go into the same tree — pick appropriate leaves (`ApprovalCard` → feedback-status, `MetricCard` → data-display, etc.).

**Done when:** build-catalog runs clean, typecheck passes, every slug accounted for.

---

## G2. Sidebar rebuild — collapsible category groups

**Files:** New `apps/docs/src/components/DocsSidebar.tsx`. Leave `App.tsx`'s current sidebar in place; Claude will swap when ready.

Requirements:
- Reads `categories` from `generated/catalog.ts` (don't hardcode).
- Two top-level groups collapsible (Foundations, Interface), each category collapsible within.
- Active route indicator.
- Keyboard: ↑/↓ to move, → to expand, ← to collapse, Enter to navigate.
- Smooth height animation; respect `prefers-reduced-motion`.
- Uses `@heigin/ui` Button/IconButton + tokens only. No new deps.

Also build `apps/docs/src/components/MarketingNav.tsx`:
- Logo on the left; Components / Patterns / Blocks / Templates / Pricing / Docs as links.
- Right side: GitHub, theme toggle, "Sign in" button (disabled with tooltip "Coming soon").
- Sticky top, border-bottom, ~56px tall.

**Done when:** both components render in isolation, typecheck clean, no runtime errors in Storybook/vitest if present.

---

## G3. Category pages — one template, data-driven

**Files:**
- New `apps/docs/src/pages/ComponentsIndex.tsx` — the `/components` landing.
- New `apps/docs/src/pages/CategoryPage.tsx` — the `/components/<category>` template.

ComponentsIndex: hero (search bar, keyboard hint Ctrl+K), then one section per group with its categories as cards (category name + count + first 3 component names).

CategoryPage: breadcrumbs → title → component grid. Each card: name, one-line description from catalog, "New" badge if in last 14 days (use `date` from manifest), link to `/components/<slug>`.

Search: client-side `fuzzysort` or a simple substring match — don't add a dep unless needed. Index = catalog primitives + patterns + templates + MCP tools. Group results by type.

**Done when:** routes `/components` and `/components/<category-id>` render for every category in the taxonomy. Typecheck + build clean. **Don't** add them to `App.tsx` yet — leave that for Claude to wire alongside the root-route pivot.

---

## G4. Blocks index (empty state)

**Files:** New `apps/docs/src/pages/BlocksIndex.tsx` + `source/blocks.json` (empty array).

The brief defines Blocks as larger reusable interface sections (dashboard sidebar, pricing section, auth layout). We have none yet. Build the index page with a proper empty state: "Blocks are coming soon" headline, bullet list describing what blocks will cover, "Notify me" button (disabled, tooltip "Coming soon").

**Done when:** page renders, no fake data, lint/typecheck clean.

---

## G5. Account section shells (no auth wiring)

**Files:** New `apps/docs/src/pages/account/` folder with:
- `AccountOverview.tsx`
- `MyLibrary.tsx`
- `SavedComponents.tsx`
- `Purchases.tsx`
- `Billing.tsx`
- `McpConfig.tsx`
- `AccountSettings.tsx`

Each is a placeholder with a header, a "Sign in required" empty state, and a mocked layout showing what the page will eventually contain. No API calls. No fake data that looks real.

Add to the sidebar as a "Account" group but **behind a feature flag** in `apps/docs/src/lib/features.ts` (`ACCOUNTS_ENABLED = false`). So the pages exist, the routes exist, but the sidebar doesn't show them until the flag flips.

**Done when:** flipping `ACCOUNTS_ENABLED = true` locally shows the Account group with 7 pages; default is off.

---

## G6. Pricing page + Footer

**Files:** Expand `apps/docs/src/pages/Pricing.tsx`. New `apps/docs/src/components/Footer.tsx`.

Pricing: three cards — Free, Pro (annual + monthly tabs), Team (contact sales). Pull copy from the brief section 11. **Prices TBD** — use `—` placeholders with a `data-pending-decision` attribute so Claude's team can grep for them later. Include the "What's free / What's paid / Commercial rights / Updates" explainer below the cards.

Footer: Components / Patterns / Blocks / Templates columns on the left, Documentation / GitHub / Changelog / Pricing in the middle, Contact / Legal / License on the right. Logo + tagline + copyright at the bottom.

**Done when:** Pricing page shows three cards with placeholder prices, Footer renders in isolation. Typecheck + build clean.

---

## Not for Gemini (Claude is handling these)

- Root route pivot (`/` → marketing landing, moving Overview under `/docs`).
- The landing page design itself (hero, showcases, developer-workflow section).
- ComponentPage spec rewrite (tabs, API ref table, Accessibility block, Related).
- `/showcase` (Gallery) deletion + redirects.
- Final `App.tsx` route rewiring + sitemap.xml regen + release-verify updates.
- CI verification + merge.

---

## Commit messages

Format:
```
<type>(<scope>): <what>

<why in one short paragraph>

Co-Authored-By: Gemini Argon <noreply@google.com>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`. Scopes you'll touch: `taxonomy`, `sidebar`, `components-index`, `blocks`, `account`, `pricing`, `footer`.

## Before opening each PR

1. `npm run typecheck -w apps/docs`
2. `npm run build -w apps/docs`
3. Open PR against `main` with a short description: what changed, what's intentionally out of scope (don't claim Claude's work), what Claude needs to wire up next.
4. Tag `@claude-opus-4-7` in the PR body (Claude won't see the tag, but it's the signal for Parag).
