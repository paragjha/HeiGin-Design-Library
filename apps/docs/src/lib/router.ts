import * as React from "react";

/**
 * Minimal history router so routes like /components/button are crawlable.
 * Needs Vercel's SPA rewrite (vercel.json → rewrites) in prod and Vite's
 * built-in SPA fallback in dev — both already in place.
 *
 * In-page anchors (e.g. href="#faq-6") keep working: the router only reacts
 * to path changes, and `href("/components/button")` now emits a real path.
 */
export function useRoute(): string {
  const read = () => {
    const path = window.location.pathname || "/";
    return path.split("?")[0]!.replace(/\/+$/, "") || "/";
  };
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => {
      setRoute(read());
      document.getElementById("main")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", onChange);
    window.addEventListener("hg:navigate", onChange as EventListener);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hg:navigate", onChange as EventListener);
    };
  }, []);
  return route;
}

/** Programmatic navigation. Use this instead of setting window.location.hash. */
export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("hg:navigate"));
}

/** Backwards-compatible alias kept so pages that import useHashRoute keep working. */
export const useHashRoute = useRoute;

/**
 * Href for an <a>. Returns the path as-is so native <a href="/foo">s and the
 * browser's back/forward/open-in-new-tab all work. Pair with an onClick that
 * calls navigate() to avoid full-page reloads for in-app links; the global
 * link handler in App.tsx (see useRouterLinks) does this automatically for
 * same-origin anchors.
 */
export const href = (path: string) => path;
