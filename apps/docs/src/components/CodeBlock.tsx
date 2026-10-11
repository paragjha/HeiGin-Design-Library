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
}

/** Syntax-highlighted code (Shiki, loaded lazily). Renders plain text first so content is never blank. */
export function CodeBlock({ code, lang = "tsx", label = "Code", maxHeight }: CodeBlockProps) {
  const [html, setHtml] = React.useState<string | null>(null);
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

  return (
    <div className="code-block" role="region" aria-label={label} tabIndex={0} style={maxHeight ? { maxHeight } : undefined} data-lang={lang}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code.trimEnd()}</code>
        </pre>
      )}
    </div>
  );
}
