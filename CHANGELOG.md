# Changelog

All notable changes to `@heigin/ui` are recorded here. This project follows [Semantic Versioning](https://semver.org).

## Unreleased

### Changed — 2026-11-12

- `/` is now the marketing landing page (`Landing.tsx`) with `MarketingNav` and `Footer`.
- Documentation moved under `/docs/*` (`/docs`, `/docs/getting-started`, `/docs/tokens/*`, `/docs/accessibility`, `/docs/nextjs`, `/docs/copy-source`, `/docs/mcp`, `/docs/changelog`); legacy paths redirect permanently (301) to the new `/docs/*` namespace.
- Gallery (`/showcase`) deleted; all 31 primitives and 18 CRM patterns are organised into a single taxonomy (`source/categories.json`) with category pages at `/components/<category>` and a collapsible `DocsSidebar`.
- Patterns (`/patterns`), Blocks (`/blocks`), and Templates (`/templates`) split into their own navigation destinations, alongside the expanded `/pricing` page.
- New Account section shells (`/account/*`) added behind the `ACCOUNTS_ENABLED` feature flag (off by default).

### Fixed — 2026-11-12

- MCP page prose hardcoded "30 primitives and 17 CRM patterns"; it now reads from `counts` so it never drifts again.
- CI typecheck failed because `apps/docs/src/generated/catalog.ts` is gitignored and nothing built it before `tsc`. The docs package now runs the catalog builder in a `pretypecheck` hook.
- Browser tests still used `/#/` hash routes and the old "Foundations" sidebar group; they now use path routes and "Docs". The Playground tests are skipped while the builder is hidden.
- Next.js example build stopped with a `SecurityFatalError` on 16.4.0 (three critical advisories: two unauthenticated RCEs, one DoS). Bumped to 16.4.6, inside the existing `^16.4.0` range; only the lockfile changed.

### Added — 2026-11-10

- `ThinkingOrb` component (wraps the MIT-licensed `thinking-orbs` package) and the `NativeSelect` root export.
- Public shadcn-compatible registry at `/r/<slug>.json`, generated from `source/manifests` and `source/licenses.json` by `scripts/build-registry.mjs`.
- Template catalog: `templates/landing` (the heigin.com landing page as buyer-ready code), `source/templates/landing.json` (one full page, 11 sections, 3 bundles, a shared core) and `apps/template-preview`, which builds the live previews.
- Gating: paid items are never written to the static folder. `/r/<slug>.json` for a paid item reaches `api/r/[slug].ts`, which returns 402 and a stub. No license verifier exists yet, so every template item is locked.
- `scripts/release-verify.mjs`: cross-checks the package version, manifests, tokens, registry output and docs claims.

### Docs — 2026-11-10

- Path-based routing with per-page metadata, `sitemap.xml` and `robots.txt`.
- Sidebar in six groups with icons; Templates and Pricing pages; counts generated from the manifests.
- The Playground (builder) is hidden behind `PLAYGROUND_ENABLED` in `apps/docs/src/lib/features.ts`; its code is unchanged.
- Removed the Star on GitHub button.

### Fixed — 2026-11-10

- MCP `get_tokens` now walks nested tokens and returns all 128 (was 97).
- Component and pattern counts on the site no longer drift from the manifests.
- `source/manifests/avatar.json` was out of date and is regenerated.

### Docs

- Builder: context menu (wrap/unwrap, move in/out, copy block, save to My blocks), Alt+arrow keyboard moves, code ↔ canvas linking, row editor for lists, named designs, share links, code import (exact and best-effort), Next.js route and copied-source exports, data binding to props, validated Form block, Dialog/Drawer/Dropdown/Toast/Conversation list/App layout/Loading/Error blocks, table loading and empty states.

- Builder: drag and drop — drag blocks from the palette onto the canvas or outline, reorder in the outline, and move selected blocks by their canvas handle, with live insertion indicators.

## 0.1.1 — 2026-10-11

### Fixed

- Menus and selects opened inside a Dialog or Drawer rendered behind it. The `--hg-z-popover` token is now 110 (above `--hg-z-modal` 100).
- `Pagination`: removed an unused React import.

### Docs

- New **Builder**: compose pages, sections or components from library blocks and copy type-checked TSX.

## 0.1.0

### Added

- Design tokens taken from the live HeiGin CRM's production stylesheet (114 tokens, each tagged with its evidence: observed, derived or proposed), shipped as JSON, CSS custom properties (`--hg-*`), TypeScript, and an optional Tailwind v4 theme.
- 28 primitive modules built on Base UI: Button, IconButton, Field, Input, Textarea, SearchInput, Select, Checkbox, RadioGroup, Switch, Tabs, DropdownMenu, Pagination, Table, Badge, Avatar, Card, EmptyState, Skeleton, Spinner, Kbd, VisuallyHidden, Dialog, AlertDialog, Drawer, Popover, Tooltip and Toast.
- 16 CRM pattern modules: PageHeader, MetricCard, MoneyValue (INR formatters), StatusBadge (registry), SLAClock, ChannelMark, TrustRungBadge, ApprovalCard, TaskRow, ConversationListItem, ActivityTimeline, FilterChip, FilterToolbar, RecordHeader, DealStage and SidebarNav. These are **proposed** until the signed-in CRM screens are inspected.
- Copy-source manifests and the `copy-component` script.

### Accessibility (deviations from production, proposed)

- `success-ink`, `danger-ink` and `input-focus-border` tokens fix text and focus contrast. See `docs/design-audit.md`.

### Source-copy

- First release: no migration needed.
