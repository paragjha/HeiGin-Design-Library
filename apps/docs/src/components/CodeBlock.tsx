import * as React from "react";
import type { HighlighterCore } from "shiki/core";

type Lang = "tsx" | "css" | "bash" | "json";

let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    return createHighlighterCore({
      themes: [import("shiki/themes/github-light.mjs")],
      langs: [import("shiki/langs/tsx.mjs"), import("shiki/langs/css.mjs"), import("shiki/langs/bash.mjs"), import("shiki/langs/json.mjs")],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

export interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Accessible label for the scrollable region. */
  label?: string;
  maxHeight?: number;
  /** 1-based inclusive line range to highlight (scrolled into view). */
  highlight?: [number, number] | null;
  /** Makes lines clickable; receives the 1-based line number. */
  onLineClick?: (line: number) => void;
}

/** Syntax-highlighted code (Shiki, loaded lazily). Renders plain text first so content is never blank. */
export function CodeBlock({ code, lang = "tsx", label = "Code", maxHeight, highlight, onLineClick }: CodeBlockProps) {
  const [html, setHtml] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => h.codeToHtml(code.trimEnd(), { lang, theme: "github-light" }))
      .then((result) => !cancelled && setHtml(result))
      .catch(() => !cancelled && setHtml(null));
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  // Apply highlight classes to the rendered lines and scroll the range into view (inside the block only).
  React.useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const lines = [...box.querySelectorAll<HTMLElement>(".line")];
    lines.forEach((l, i) => l.classList.toggle("is-highlighted", !!highlight && i + 1 >= highlight[0] && i + 1 <= highlight[1]));
    const first = highlight ? lines[highlight[0] - 1] : undefined;
    if (first) {
      const top = first.offsetTop - box.clientHeight / 3;
      box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [highlight, html, code]);

  const clickable = Boolean(onLineClick);
  return (
    <div
      ref={ref}
      className={`code-block${clickable ? " code-block--clickable" : ""}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      style={maxHeight ? { maxHeight } : undefined}
      data-lang={lang}
      onClick={
        clickable
          ? (e) => {
              const line = (e.target as HTMLElement).closest(".line");
              if (!line || !ref.current) return;
              const index = [...ref.current.querySelectorAll(".line")].indexOf(line);
              if (index >= 0) onLineClick!(index + 1);
            }
          : undefined
      }
    >
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>
            {code
              .trimEnd()
              .split("\n")
              .map((l, i) => (
                <React.Fragment key={i}>
                  <span className="line">{l}</span>
                  {"\n"}
                </React.Fragment>
              ))}
          </code>
        </pre>
      )}
    </div>
  );
}
