/**
 * The Playground (the visual builder at /builder) is switched off while it is
 * being finished. All of its code stays in src/builder; set this to true to
 * bring back the route, the top-bar and sidebar links, the search entry and
 * the Overview card, then add "/builder" back to scripts/build-sitemap.mjs.
 */
export const PLAYGROUND_ENABLED: boolean = false;

/**
 * Account section shells (/account/*) are built and ready, but hidden in the
 * sidebar until authentication and license verification are wired up.
 */
export const ACCOUNTS_ENABLED: boolean = false;
