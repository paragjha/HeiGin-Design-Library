# Changelog

All notable changes to `@heigin/ui` are recorded here. This project follows [Semantic Versioning](https://semver.org).

## Unreleased

### Added — 2026-11-18

- Agent patterns in `@heigin/ui`: `AgentTaskTrail`, `AgentDecisionTree` and `AgentThinking`, plus `TypeMotion`, `Loader` (thinking orb or spinner) and `HeiGinMark`. All six are on HeiGin tokens (Inter, the radius scale, the near-black accent), have docs pages with playgrounds and live examples, copy-source manifests and free registry items, and appear in `@heigin/mcp` 0.1.4.
- Where a recreated design had a spinner, the agent components show the thinking orb by default; `loader="spinner"` switches back.
- Hero section templates (`source/templates/heroes.json`, `templates/heroes`): a tilted wall of work, a light hero with a live `AgentTaskTrail`, and a dark hero with a dashboard that settles into place. They use the HeiGin mark as the brand and real service logos (Iconify logos set, CC0) only as integrations. Tier `pro`, like the landing template, until pricing is decided. The template preview app now also builds `/preview/heroes/`.
- Docs: service logos for examples (`apps/docs/src/components/ServiceLogos.tsx`), and the Templates pages now group by family and read each family's config file name.

### Added — 2026-11-15

- 22 community components from [Kokonut UI](https://kokonutui.com) (MIT) in the docs, each with its own page under Components: 14 AI (input selector, input search, state loading, tool approval, tool calls, connect, send, handoff, code run, diff review, model selector, conversation branches, agent lanes, memory), 4 cards (widget grid, activity terrain, metric card, uptime card), 3 navigation (tool dock, account menu, command palette) and synced transcript. They are not part of the `@heigin/ui` package and do not change the library counts.
- The sources are vendored byte-for-byte from Kokonut's shadcn registry by `apps/docs/scripts/sync-kokonut.mjs` into `apps/docs/src/components/kokonutui/`, license headers intact. Three files differ from upstream, each noted in its header: `ai-loading`, `ai-tool-approval` and `ai-tool-calls` show `ThinkingOrb` from `@heigin/ui` where the original shows a spinner.
- Previews run in an isolated frame (`apps/docs/kokonut-preview.html`) with its own Tailwind CSS v4 build, Geist and a class-based dark mode, matching the environment the components were written for, so the docs stylesheet cannot restyle them. The frame follows the docs theme and grows to fit open menus.
- Docs app dependencies: `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, `motion`, `clsx`, `tailwind-merge`, `@radix-ui/react-dropdown-menu`. Tailwind compiles only the preview frame's stylesheet.

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
