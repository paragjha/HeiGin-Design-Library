# Accessibility

The target is **WCAG 2.2 AA**. These are the rules every component follows; the docs site's Accessibility page shows the same content with live examples.

## Rules

1. **Semantic HTML first.** Use native `button`, `label`, `table` with `caption` and `scope`, `nav`, `ol`/`ul`, `time`, `del`/`ins`. Reach for ARIA only where HTML has no equivalent.
2. **Visible focus.** Show a 2px `#3b82f6` outline at 1px offset (the production value) on every interactive element. Text fields show a stronger border plus a soft ring (see the deviations below).
3. **Keyboard.** Every interaction works without a mouse:
   - Menus, selects, tabs and radio groups use roving focus with arrow keys and Home/End.
   - Dialogs, drawers and alert dialogs trap focus, close on Escape and return focus to the trigger.
   - Alert dialogs land on Cancel.
4. **Names.** Icon-only controls require `label`. Tables require `caption`. Dialogs and drawers require `title`. Unread counts, SLA state and compact money values are part of the accessible text.
5. **Never colour alone.** Status always has a word; trends have an icon and a value; DealStage says "Stage 3 of 5: Proposal"; overdue tasks say "Overdue".
6. **Touch.** Controls are 44px tall below 768px, matching production.
7. **Motion.** Every transition and animation stops under `prefers-reduced-motion: reduce`.
8. **Live regions.** Use them only where content changes in response to the user: filter scope, pagination range, copy feedback, approval outcomes and toasts.

## Testing

- **Unit:** every component test file runs `axe-core` on rendered output (`tests/setup/axe.ts`). Colour contrast is skipped there because jsdom cannot compute it; it is calculated from token values instead (see the audit).
- **Keyboard:** Testing Library and user-event cover tabbing, Enter/Space, arrows, Escape and focus return.
- **Browser:** Playwright checks real focus return, keyboard menus, 44px targets at 390px width, and the absence of horizontal page scroll.

## Deliberate deviations from production

| Production | Issue | HeiGin UI |
| --- | --- | --- |
| Success text `#16a34a` on `#f0fdf4` | 3.15:1 | `success-ink #15803d` (4.79:1), proposed |
| Danger text `#dc2626` on `#fef2f2` | 4.41:1 | `danger-ink #b91c1c` (5.91:1), proposed |
| Focused input border `#dcdcdc`, no outline | 1.37:1, a weak focus indicator | `input-focus-border #737373` (4.62:1) plus the production soft ring, proposed |

These are kept as production values, flagged for a product decision:

- Resting input border at 1.19:1.
- Muted text on the sidebar at 4.43:1.

## Known primitive behaviour

- **Toast (Base UI):** the close button is `aria-hidden` until the toast region gets focus (F6) or hover. Toasts are announced through live regions; danger toasts are assertive.
- **Table:** `onRowClick` is a mouse convenience. Rows must still contain a real link or button.
