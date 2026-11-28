/**
 * Marks components, patterns and templates as "New" in the sidebar and index cards
 * for one week after they ship. Add a line here (route -> the date it shipped) whenever
 * something new goes out; it drops off the list on its own after NEW_WINDOW_DAYS.
 */
export const NEW_WINDOW_DAYS = 7;

export const NEW_SINCE: Record<string, string> = {
  // 2026-11-21: six more motion sections
  "/templates/motion-drawer-menu": "2026-11-21",
  "/templates/motion-hover-index": "2026-11-21",
  "/templates/motion-diagonal-gallery": "2026-11-21",
  "/templates/motion-feature-dialog": "2026-11-21",
  "/templates/motion-scale-slider": "2026-11-21",
  "/templates/motion-text-reveal": "2026-11-21",
  // 2026-11-24: launch pages, SectionIndex
  "/templates/launch-core": "2026-11-24",
  "/templates/launch-waitlist": "2026-11-24",
  "/templates/launch-changelog": "2026-11-24",
  "/templates/launch-cta": "2026-11-24",
  "/templates/launch-hero": "2026-11-24",
  "/templates/launch-pricing": "2026-11-24",
  "/templates/launch-careers": "2026-11-24",
  "/components/section-index": "2026-11-24",
  // 2026-11-26: StorageScanner
  "/components/storage-scanner": "2026-11-26",
  // 2026-11-28: five more motion sections, two launch pages, dashboard template
  "/templates/motion-horizon-gradient": "2026-11-28",
  "/templates/motion-pixel-wipe": "2026-11-28",
  "/templates/motion-orbit-gallery": "2026-11-28",
  "/templates/motion-gradient-footer": "2026-11-28",
  "/templates/motion-morphing-island": "2026-11-28",
  "/templates/launch-agents-page": "2026-11-28",
  "/templates/launch-platform-page": "2026-11-28",
  "/templates/dashboard-core": "2026-11-28",
  "/templates/dashboard-shell": "2026-11-28",
  "/templates/dashboard-home": "2026-11-28",
};

export function isNewPath(path: string, now: Date = new Date()): boolean {
  const added = NEW_SINCE[path];
  if (!added) return false;
  const ageMs = now.getTime() - new Date(`${added}T00:00:00Z`).getTime();
  return ageMs >= 0 && ageMs < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
