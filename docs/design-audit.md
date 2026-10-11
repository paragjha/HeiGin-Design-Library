# HeiGin CRM design audit

**Audited:** 2026-10-11 · **Target:** the live CRM at `northwind.heigin.com` · **Method:** read-only inspection.

This audit records what the production interface actually does, how strong the evidence for each finding is, and where HeiGin UI departs from production on purpose.

## 1. Evidence and its limits

| Source | Access | Used for |
| --- | --- | --- |
| Live `/login` page, DOM and computed styles | ✅ Public, read-only | Control sizing, button and input states, font, focus behaviour |
| Production CSS bundle (`/_next/static/chunks/*.css`, about 50 KB) | ✅ Public static asset | The **whole app's** Tailwind v4 output: `:root` tokens, every utility class used anywhere, keyframes, breakpoints, global focus rules |
| Production JS chunks for the login route | ✅ Public static assets | Library fingerprinting (icons, primitives) |
| Signed-in screens (Today, Inbox, Pipeline, Leads, Deals, Accounts, Quotes, Agent, Settings, …) | ⏳ **Not yet inspected** | — |
| Local repos `heigin-crm` (Vite, Sept) and `heigin-ui` (Next.js, Oct), plus the Downloads prototype | ✅ Local | Product semantics only (routes, status names, trust-ladder wording, CRM pattern list). **Not** used for visual values. |

**Limitation.** The signed-in CRM needs a login. Credentials were not available to the agent, and the agent must not type passwords, so it asked the account owner to sign in through the browser pane. Until that happens:

- Tokens are grounded in production CSS. Tailwind compiles every class the app uses into one shared stylesheet, so the CSS covers all screens, not just login.
- Component *anatomy* for in-app screens (tables, tabs, menus, cards) is **inferred** from those classes and tokens, not seen directly.
- CRM patterns are **proposed** from the product spec and marked that way in the docs and the component inventory.

No production records, customer data, cookies or credentials were collected. Screenshots were kept in the agent's scratchpad, outside the repository.

## 2. Stack fingerprint (observed)

- **Next.js** App Router (Turbopack chunks) with **Tailwind CSS v4**: `@layer theme`, utilities such as `bg-surface`, `text-ink`, `rounded-[var(--radius-md)]`.
- **Font:** Inter through `next/font` (`--font-inter`), with weights 400, 500, 600 and 700. A `--font-mono` variable is declared, but its family can't be identified from public assets, so the mono stack is *proposed*.
- **Icons:** **Lucide**, confirmed by the `lucide-${name}` class factory in the JS bundle. `strokeWidth: 1.6` is the dominant setting (12 occurrences against 2 at the default of 2).
- **Primitives:** no Radix, Base UI, Headless UI or cmdk fingerprint in the public chunks, so production overlays appear to be custom. HeiGin UI uses **Base UI** for accessible behaviour (focus traps, roving tabindex, ARIA) while matching production visuals. That is the same primitive library `heigin-crm` and `heigin-ui` already chose.

## 3. Design language: what production does

### 3.1 Colour (all observed, from `:root`)

| Role | Token | Value |
| --- | --- | --- |
| Page canvas | `--color-bg` | `#fcfcfc` |
| Sidebar | `--color-sidebar` | `#f7f7f7` |
| Surface (cards, inputs, popovers) | `--color-surface` | `#ffffff` |
| Hover / pressed fill | `--color-surface-hover` / `-active` | `#f2f2f2` / `#ebebeb` |
| Border / strong border | `--color-border` / `-strong` | `#ebebeb` / `#dcdcdc` |
| Text: ink / muted / faint | `--color-ink` / `-muted` / `-faint` | `#1f1f1f` / `#737373` / `#a3a3a3` |
| **Accent (primary action)** | `--color-accent` / `-hover` | **`#1f1f1f`** / `#3a3a3a` |
| Soft accent | `--color-accent-soft-bg` / `-ink` | `#f2f2f2` / `#404040` |
| Info | `--color-info` / `-soft-bg` / `-ink` | `#3b82f6` / `#eef4ff` / `#2563eb` |
| Danger | `--color-danger` / `-soft-bg` | `#dc2626` / `#fef2f2` |
| Success | `--color-success` / `-soft-bg` | `#16a34a` / `#f0fdf4` |
| Warning | `--color-warning` / `-soft-bg` | `#b45309` / `#fffbeb` |
| Scrim | utility colour | `rgb(0 0 0 / .3)` |

**The key finding:** production is **monochrome**. The primary action colour is near-black, not a brand hue. Colour appears only for status and attention. The repo specs (`heigin-crm`'s Poppins with blue `#3965FA`, and the August prototype's orange `#C2410C`) **do not match production**. As agreed with the product owner, production wins. Those values are recorded here as divergences, not as tokens.

### 3.2 Typography (observed)

- Inter throughout. The UI default is **13px**: buttons, inputs and rows (`text-[13px]`).
- Arbitrary sizes in use: 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 28 and 32px. The 21 and 22px sizes appear to be one-offs and were left out of the scale.
- Tracking: `-0.01em`, `-0.015em` and `-0.02em` on large text. Leading: tight (1.25), snug (1.375), relaxed (1.625) and 1.6.
- Mobile inputs use 16px, which prevents iOS zoom-on-focus.

### 3.3 Spacing, sizing and layout (observed)

- 4px base unit (`--spacing: .25rem`).
- **Controls:** `h-8` (32px) from 768px up and `h-11` (44px) below 768px, on both buttons and inputs. This responsive touch target is a deliberate production rule, and HeiGin UI keeps it with a `touch` prop.
- Buttons: `px-3`, `gap-1.5`, 13px/500. Inputs: `px-2.5`.
- Breakpoints: Tailwind defaults (640, 768, 1024, 1280, 1536). `not all and (min-width:64rem)` shows navigation changes below 1024px.
- Widths seen: 220/240/260/280px rails, content max widths of 1100, 1180 and 760px, a right drawer of `min(360px, 100vw − 48px)` and a nav drawer of `min(300px, 85vw)`.

### 3.4 Shape, depth and motion (observed)

- Radius: `sm 4px`, `md 6px` (controls), `lg 8px` (cards), `xl 10px` (dialogs, sheet tops), plus `full`.
- Shadows: `--shadow-card 0 1px 2px #00000008`, `--shadow-card-hover 0 1px 3px #0000000f`, `--shadow-popover 0 0 0 1px #0000000a, 0 8px 24px -6px #0000001f`.
- z-index: 20, 40, 50, 90, 100, 200. HeiGin UI maps these to sticky, overlay, modal, popover, toast and tooltip. The *mapping* is inferred.
- Motion keyframes:

  | Keyframe | Duration and easing | Movement |
  | --- | --- | --- |
  | `popIn` | 120ms | 6px rise |
  | `fadeIn` | 150ms | — |
  | `slideIn` | 200ms | 30px |
  | `drawerIn` | 220ms, `cubic-bezier(.2,.8,.2,1)` | — |
  | `navDrawerIn` | 200ms | — |
  | `sheetIn` | 200ms | — |
  | `pulse` | 1.4s | — |
  | `spin` | 1s | — |

  The colour transition is 150ms `cubic-bezier(.4,0,.2,1)`. A `prefers-reduced-motion` media query exists.

### 3.5 Focus and interaction (observed)

- Global `:focus-visible { outline: 2px solid var(--color-info); outline-offset: 1px }`.
- Text fields: `input:focus { outline: none; box-shadow: 0 0 0 3px #0000000d; border-color: var(--color-border-strong) }`.
- Disabled: `opacity .5; cursor: not-allowed`.

## 4. Classification of findings

| # | Finding | Class |
| --- | --- | --- |
| 1 | Monochrome palette, near-black accent, status-only colour | **Consistent, intentional** → tokens |
| 2 | 32px desktop / 44px mobile controls, 13px UI text | **Consistent, intentional** → tokens and `touch` prop |
| 3 | Lucide icons at stroke 1.6 | **Consistent** (a few icons use stroke 2) → token `control.icon-stroke` |
| 4 | `rounded-[6px]` alongside `rounded-[var(--radius-md)]` | **Inconsistent implementation**, same value → folded into `radius.md` |
| 5 | The Tailwind theme sets `--radius-xl: .75rem` (12px) but `:root` sets 10px; `:root` wins | **Inconsistent** → `radius.xl = 10px` (the computed value) |
| 6 | 21px and 22px text sizes | **One-off** → not tokenised |
| 7 | Success text `#16a34a` on `#f0fdf4` = **3.15:1** | **Accessibility issue** → proposed `success-ink #15803d` (4.79:1) |
| 8 | Danger text `#dc2626` on `#fef2f2` = **4.41:1** | **Accessibility issue** → proposed `danger-ink #b91c1c` (5.91:1) |
| 9 | Input focus border `#dcdcdc` on white = **1.37:1** and no outline | **Accessibility issue** → proposed `input-focus-border #737373` (4.62:1), keeping the soft ring |
| 10 | Resting input border `#ebebeb` = 1.19:1 (below the 3:1 non-text target) | **Accessibility issue, kept for fidelity**; inputs still have labels and a card shadow. Needs a product decision |
| 11 | Muted `#737373` on sidebar `#f7f7f7` = 4.43:1 | **Borderline**; kept, flagged |
| 12 | Faint `#a3a3a3` = 2.52:1 | Fine for placeholders and decoration only; documented as such |
| 13 | No visible primitive library; custom overlays | Behaviour gap risk → **improved** with Base UI, visuals unchanged |

Every proposed value is marked `"evidence": "proposed"` in `tokens/tokens.json` and in the docs token tables, so reviewers can accept or reject each one.

## 5. Divergence from the repository specs

| Spec (heigin-crm / zip, Sept 27) | Production (observed) | HeiGin UI |
| --- | --- | --- |
| Poppins and JetBrains Mono | Inter | Inter |
| Brand blue `#3965FA` for fills | No brand hue; info blue `#3b82f6` for focus and info only | Production |
| Radius 10px (cards), 6px (controls) | Cards 8px (`lg`), controls 6px | Production |
| Canvas `#F7F7F5` (warm) | `#fcfcfc` (neutral) | Production |
| 36px controls | 32px desktop, 44px mobile | Production |

The `heigin-ui` Next.js shell (Inter + Noto Sans, 8px radius, `#3965fa`) also diverges from both. This repository supersedes it as the system of record.

## 6. Next steps once signed-in access is available

1. Walk every sidebar route at 1440, 1280, 1024, 768 and 390px widths, read-only.
2. Confirm or correct the anatomy of: table rows (height, header style), tabs (underline vs pill), sidebar items (height, active fill), badges, metric cards, menus, dialogs, drawers and toasts.
3. Move confirmed CRM patterns from **proposed** to **observed**, and adjust values where production differs.
4. Re-run `npm run ci` and update this audit and `component-inventory.md`.
