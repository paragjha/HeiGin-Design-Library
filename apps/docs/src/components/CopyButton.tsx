import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@heigin/ui";
import { copyText } from "../lib/clipboard";

export interface CopyButtonProps {
  text: string;
  /** Visible label, e.g. "Copy source". */
  label: string;
  /** Data attribute used by browser tests. */
  testId?: string;
  variant?: "secondary" | "ghost";
}

/** Copies `text` and shows "Copied" (announced politely) for 2 seconds. */
export function CopyButton({ text, label, testId, variant = "secondary" }: CopyButtonProps) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  React.useEffect(() => {
    if (state === "idle") return;
    const t = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        touch={false}
        data-testid={testId}
        data-copy-state={state}
        leadingIcon={state === "copied" ? <Check strokeWidth={1.6} /> : <Copy strokeWidth={1.6} />}
        onClick={async () => setState((await copyText(text)) ? "copied" : "failed")}
      >
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? `${label}: copied to clipboard` : state === "failed" ? "Copy failed" : ""}
      </span>
    </>
  );
}
