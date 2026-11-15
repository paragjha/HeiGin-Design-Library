// Entry for kokonut-preview.html: renders one vendored Kokonut UI component, chosen by ?c=<slug>,
// on the same surface kokonutui.com previews it on. The docs page embeds this in an iframe.
import * as React from "react";
import { createRoot } from "react-dom/client";
import "./preview.css";

type Module = { default?: React.ComponentType };

// Not followed by tsc (the vendored sources are excluded from the docs typecheck) and split per component by Vite.
const modules = import.meta.glob("../components/kokonutui/*.tsx") as Record<string, () => Promise<Module>>;

const params = new URLSearchParams(window.location.search);
const slug = params.get("c") ?? "";
const load = modules[`../components/kokonutui/${slug}.tsx`];

class Boundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    return this.state.error ? <p role="alert">Preview failed: {this.state.error.message}</p> : this.props.children;
  }
}

const Demo = load
  ? React.lazy(async () => {
      const mod = await load();
      if (!mod.default) throw new Error(`${slug} has no default export`);
      return { default: mod.default };
    })
  : null;

function Preview() {
  const surface = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; theme?: string } | null;
      if (data?.type === "hg-kokonut-theme") document.documentElement.classList.toggle("dark", data.theme === "dark");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  React.useEffect(() => {
    const el = surface.current;
    if (!el || window.parent === window) return;
    // Menus and popovers overlay the surface without resizing it, so no observer fires for them: poll the
    // scroll extent instead. The frame only grows, so opening and closing a menu does not make the page jump.
    let tallest = 0;
    const report = () => {
      const height = Math.ceil(Math.max(el.getBoundingClientRect().height, el.scrollHeight));
      if (height <= tallest) return;
      tallest = height;
      window.parent.postMessage({ type: "hg-kokonut-height", slug, height }, window.location.origin);
    };
    report();
    const timer = window.setInterval(report, 200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div ref={surface} className="relative flex min-h-[400px] items-center justify-center p-2 md:p-8">
      {Demo ? (
        <Boundary>
          <React.Suspense fallback={null}>
            <Demo />
          </React.Suspense>
        </Boundary>
      ) : (
        <p role="alert">Unknown component: {slug || "(none)"}</p>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
