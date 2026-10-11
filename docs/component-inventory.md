# Component inventory

Status key:

- **Evidence** says how sure we are the component matches the live CRM:
  - **observed**: seen in production CSS or DOM.
  - **inferred**: built from observed tokens and classes, but the anatomy is not yet seen on an in-app screen.
  - **proposed**: not seen; comes from the product spec or fills a gap.
- **Build status:**
  - **implemented**: in `@heigin/ui`, with docs, an example, tests and a copy manifest.
  - **deferred**: intentionally not built yet.

Rendering is **client** when the component ships `"use client"`, and **server** when it's safe to render from a Server Component.

## Primitives (`packages/ui/src/components/ui`)

| Component | Evidence | Build status | Rendering | Built on | Notes |
| --- | --- | --- | --- | --- | --- |
| Button | observed | implemented | client | native `<button>` | Variants primary/secondary/ghost/danger/link; sizes sm/md/lg; loading; touch sizing |
| IconButton | inferred | implemented | client | Button | Label required |
| Spinner | observed (`spin 1s`) | implemented | server | — | |
| Field | inferred | implemented | client | React context | Label, description, error, required, disabled wiring |
| Input | observed | implemented | client | native `<input>` | Focus border is a proposed a11y fix |
| Textarea | inferred | implemented | client | native | |
| SearchInput | inferred | implemented | client | native | Clear button, Escape to clear, Enter to search |
| Select | inferred | implemented | client | Base UI Select | |
| Checkbox | inferred | implemented | client | Base UI Checkbox | Indeterminate |
| RadioGroup | proposed | implemented | client | Base UI RadioGroup | |
| Switch | inferred | implemented | client | Base UI Switch | |
| Tabs | inferred | implemented | client | Base UI Tabs | Underline and pill variants, counts |
| DropdownMenu | inferred | implemented | client | Base UI Menu | Groups, separators, danger items, shortcut hints |
| Pagination | proposed | implemented | client | IconButton | Indian-grouped range label |
| Table | inferred | implemented | client | native `<table>`, Checkbox, Skeleton | Columns, loading, empty, selection, controlled sort |
| Badge | observed (tokens) | implemented | server | — | Tones, dot, icon |
| Avatar | inferred | implemented | client | — | Initials fallback on image error |
| Card / CardHeader | observed (tokens) | implemented | server | — | |
| EmptyState | inferred | implemented | server | — | |
| Skeleton | observed (`pulse 1.4s`) | implemented | server | — | |
| Kbd | proposed | implemented | server | — | |
| VisuallyHidden | — (utility) | implemented | server | — | |
| Dialog | observed (keyframes, scrim, radius) | implemented | client | Base UI Dialog | |
| AlertDialog | inferred | implemented | client | Base UI AlertDialog | Async confirm, focus on Cancel |
| Drawer | observed (drawerIn/navDrawerIn/sheetIn) | implemented | client | Base UI Dialog | Right, left and bottom sides |
| Popover | inferred | implemented | client | Base UI Popover | |
| Tooltip | proposed | implemented | client | Base UI Tooltip | Production may use native `title` |
| Toast | inferred (slideIn, z layer) | implemented | client | Base UI Toast | Tones, action, persistent |

## CRM patterns (`packages/ui/src/components/crm`)

| Pattern | Evidence | Build status | Rendering | Composes |
| --- | --- | --- | --- | --- |
| PageHeader | proposed | implemented | server | — |
| MetricCard | proposed | implemented | server | Card |
| MoneyValue (+ `formatINR`, `formatINRCompact`) | proposed (spec rule) | implemented | server | VisuallyHidden |
| StatusBadge (+ `STATUS_REGISTRY`) | proposed (spec rule) | implemented | server | Badge |
| SLAClock | proposed | implemented | server | VisuallyHidden |
| ChannelMark | proposed | implemented | server | — |
| TrustRungBadge | proposed (canonical labels from the spec) | implemented | server | Badge |
| ApprovalCard | proposed (Flows 3 and 4) | implemented | client | Card, Button, TrustRungBadge |
| TaskRow | proposed | implemented | client | Checkbox, Badge |
| ConversationListItem | proposed | implemented | server | Avatar, ChannelMark |
| ActivityTimeline / ActivityItem | proposed | implemented | server | — |
| FilterChip | proposed | implemented | client | — |
| FilterToolbar | proposed (spec: scope disclosure) | implemented | client | SearchInput |
| RecordHeader (+ breadcrumbs) | proposed | implemented | server | Avatar |
| DealStage | proposed | implemented | server | — |
| SidebarNav | inferred (sidebar token, 240px rail) | implemented | server* | — |

\* SidebarNav is server-safe; it becomes client only if you pass a client-only `renderLink`.

## Deferred or not built

| Candidate | Why it is deferred |
| --- | --- |
| Combobox / autocomplete | Not observed; Base UI Combobox is available when a screen needs it |
| Date picker | Not observed; needs a product decision on the date library and IST handling |
| Command menu | Not observed |
| Button group / Toggle | Not observed; Tabs `pill` covers segmented choices |
| Breadcrumbs (standalone) | Included inside RecordHeader; split out when a second use appears |
| Progress bar | Not observed (DealStage covers pipeline progress) |
| BulkActionBar, SavedViewPicker, Sparkline, FileDrop | Listed in the product spec; build once the screens using them are inspected |
| TaxBreakup, PlaceOfSupplyField, AgeingBadge, IntentScoreDisplay, DuplicateDiff, PresenceAvatars, SessionWindowIndicator, ConnectorHealthRow, HandoffNotePrompt, VoiceNoteCapture, OfflineIndicator, PermissionGate | HeiGin-specific spec items; they need real screens and data contracts first |
| Dark theme | Not observed in production (light only); intentionally not invented |

**Totals:** 28 primitive modules and 16 CRM pattern modules, giving **44 manifests**. 41 are distinct components (Dialog and Drawer share their header; Field covers labels).
