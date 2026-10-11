# Changelog

All notable changes to `@heigin/ui` are recorded here. This project follows [Semantic Versioning](https://semver.org).

## Unreleased — 0.1.0

### Added

- Design tokens taken from the live HeiGin CRM's production stylesheet (114 tokens, each tagged with its evidence: observed, derived or proposed), shipped as JSON, CSS custom properties (`--hg-*`), TypeScript, and an optional Tailwind v4 theme.
- 28 primitive modules built on Base UI: Button, IconButton, Field, Input, Textarea, SearchInput, Select, Checkbox, RadioGroup, Switch, Tabs, DropdownMenu, Pagination, Table, Badge, Avatar, Card, EmptyState, Skeleton, Spinner, Kbd, VisuallyHidden, Dialog, AlertDialog, Drawer, Popover, Tooltip and Toast.
- 16 CRM pattern modules: PageHeader, MetricCard, MoneyValue (INR formatters), StatusBadge (registry), SLAClock, ChannelMark, TrustRungBadge, ApprovalCard, TaskRow, ConversationListItem, ActivityTimeline, FilterChip, FilterToolbar, RecordHeader, DealStage and SidebarNav. These are **proposed** until the signed-in CRM screens are inspected.
- Copy-source manifests and the `copy-component` script.

### Accessibility (deviations from production, proposed)

- `success-ink`, `danger-ink` and `input-focus-border` tokens fix text and focus contrast. See `docs/design-audit.md`.

### Source-copy

- First release: no migration needed.
