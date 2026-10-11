# Changelog

All notable changes to `@heigin/ui` are recorded here. This project follows [Semantic Versioning](https://semver.org).

## Unreleased

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
