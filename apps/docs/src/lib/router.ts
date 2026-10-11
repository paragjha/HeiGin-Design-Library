import * as React from "react";

/** Minimal hash router so the static build works on any host (no server rewrites needed). */
export function useHashRoute(): string {
  const read = () => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash.startsWith("/") ? hash.split("?")[0]! : "/";
  };
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => {
      // Demo links such as #lead-L-1001 are not routes: keep the current page.
      if (!window.location.hash.startsWith("#/")) return;
      setRoute(read());
      document.getElementById("main")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const href = (path: string) => `#${path}`;
