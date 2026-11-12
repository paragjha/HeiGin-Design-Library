# Route redirects — restructure plan

This is the authoritative map for route changes during the restructure. The final wiring commit (see `FINAL_WIRING.md`) will apply the SPA router redirects AND update `vercel.json` with HTTP 301s for direct hits.

## Permanent redirects (301)

| Old                      | New                               | Why                                            |
|--------------------------|-----------------------------------|------------------------------------------------|
| `/`                      | *stays on `/`*, but content pivots to `Landing.tsx` | Marketing becomes the public homepage. |
| `/showcase`              | `/components`                     | Gallery deleted per brief §3.                  |
| `/showcase/*`            | `/components`                     | Any legacy gallery deep-link lands on the components index. |
| `/getting-started`       | `/docs/getting-started`           | Docs move under `/docs/*`.                     |
| `/tokens`                | `/docs/tokens`                    | Same.                                          |
| `/tokens/colors`         | `/docs/tokens/colors`             |                                                |
| `/tokens/typography`     | `/docs/tokens/typography`         |                                                |
| `/tokens/spacing`        | `/docs/tokens/spacing`            |                                                |
| `/accessibility`         | `/docs/accessibility`             |                                                |
| `/nextjs`                | `/docs/nextjs`                    |                                                |
| `/copy-source`           | `/docs/copy-source`               |                                                |
| `/mcp`                   | `/docs/mcp`                       |                                                |
| `/changelog`             | `/docs/changelog`                 |                                                |

## Kept at the current path (public marketing routes)

- `/components` + `/components/<slug>` + `/components/<category>` (category pages added by Gemini G3)
- `/patterns` + `/patterns/<slug>`
- `/blocks` (empty-state page from Gemini G4)
- `/templates` + `/templates/<name>`
- `/pricing`

## New routes added by this restructure

| Path                           | Owner  | Purpose                                 |
|--------------------------------|--------|-----------------------------------------|
| `/docs`                        | Claude | Docs landing (orientation + nav)        |
| `/components/<category-id>`    | Gemini | Category pages (G3)                     |
| `/blocks`                      | Gemini | Blocks empty-state (G4)                 |
| `/account`                     | Gemini | Account overview (G5, behind feature flag) |
| `/account/library`             | Gemini | (G5, feature-flagged)                   |
| `/account/saved`               | Gemini | (G5, feature-flagged)                   |
| `/account/purchases`           | Gemini | (G5, feature-flagged)                   |
| `/account/billing`             | Gemini | (G5, feature-flagged)                   |
| `/account/mcp`                 | Gemini | (G5, feature-flagged)                   |
| `/account/settings`            | Gemini | (G5, feature-flagged)                   |

## Implementation

1. **In the router (`App.tsx`)**: on route match that's in the Old column, call `history.replaceState(null, "", newPath)` and route to the new page component. One pass; no flicker.
2. **In `vercel.json`**: add a `redirects` block with the same map so direct hits (shared links, bookmarks, old sitemap hits) get a proper 301 before SPA load.
3. **Sitemap regeneration**: `apps/docs/scripts/generate-sitemap.mjs` reads from the catalog + routes list. Update it to emit the new paths only (no legacy entries). Confirm `robots.txt` still points at `/sitemap.xml`.
4. **release-verify.mjs**: add an assertion that the redirects map in `vercel.json` matches the one in this file (parse both; fail if either side drifts).

## Showcase deletion specifics

`apps/docs/src/pages/Showcase.tsx` + the entire `apps/docs/src/showcase/` folder (18 decorative visual effects + `registry.ts` + `demos.tsx` + CSS) are deleted in the final wiring commit. Nothing in that folder is a library component; they were Gallery eye-candy. The individual files:

- `AgentOrb`, `AnimatedTerminal`, `AvatarCircles`, `BarVisualizer`, `BorderBeam`, `ConversationBar`, `CursorParticles`, `DotMatrixOrb`, `DottedGlobe`, `FileTree`, `FlickerGrid`, `GlyphMatrix`, `IconCloud`, `ImageStreamHero`, `IntegrationBeam`, `LiveWaveform`, `RainbowButton`, `SaasLanding`, `ShimmeringText`

If any are needed for the new Landing's hero/background, they'll be moved to `apps/docs/src/components/landing-fx/` and imported explicitly. Current Landing doesn't use them.
