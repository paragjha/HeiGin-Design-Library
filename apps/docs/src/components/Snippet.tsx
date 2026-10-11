import { CodeBlock } from "./CodeBlock";
import { CopyButton } from "./CopyButton";

/** A labelled code snippet with a working copy button. */
export function Snippet({ code, label, lang = "tsx" }: { code: string; label: string; lang?: "tsx" | "css" | "bash" | "json" }) {
  return (
    <div className="snippet">
      <div className="snippet__head">
        <span className="small muted">{label}</span>
        <CopyButton text={code} label="Copy" testId="copy-snippet" variant="ghost" />
      </div>
      <CodeBlock code={code} lang={lang} label={label} />
    </div>
  );
}
