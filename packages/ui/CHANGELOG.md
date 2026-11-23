# Changelog

All notable changes to `@heigin/ui` are recorded here. This project follows [Semantic Versioning](https://semver.org).

## Unreleased

### Added

- `SectionIndex`: a section index for long pages. A short tick per section, the current one longer and darker, opens into a card of section names on hover or focus; picking one scrolls there and moves focus into it. `placement="fixed"` (default) pins it to the left edge while its sections are on screen and hides it below 1024px; `placement="static"` leaves it in the flow. Follows the window or a `scrollRoot`.

## 0.2.0 — 2026-11-18

### Added

- `AgentTaskTrail`: a live timeline of an agent working through a task, with service icons, ticking timers, sub-steps on a branching rail and an approval gate (`onApprove` / `onDecline`).
- `AgentDecisionTree`: a queue of decisions an agent needs from a person, drawn as a tree with follow-up options, consequences, the agent's pick, an agent's note, "Other…" free text and the agent's reply. Number keys work only while focus is inside it. Stacks below a 760px container.
- `AgentThinking`: a thinking timer, the steps as they happen and a dithered dot visual (raymarched, Bayer-dithered canvas) that reshapes per step, then the answer. The visual pauses offscreen and shows a still frame under reduced motion.
- `TypeMotion`: a headline whose letters turn into artwork under the pointer, with eight effects (lens, pop, shuffle, word, bubble, swell, sticker, burst). Ships HeiGin orbs, symbols and the mark as default artwork; pass `artwork` for your own images or elements.
- `Loader`: one loading indicator with `variant="orb"` (the thinking orb, default) or `"spinner"`. The three agent components take the same choice through their `loader` prop.
- `HeiGinMark`: the HeiGin mark, on its tile or bare in `currentColor`. The agent components use it as the default agent icon.
- `ThinkingOrb`: a dotted orb for agent activity with nine states at 64, 32 and 20px. Wraps the MIT-licensed [`thinking-orbs`](https://github.com/Jakubantalik/thinking-orbs) package by Jakub Antalik, which is now a dependency.
- `NativeSelect` is exported from the package root. It was documented but missing from the entry point.

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
