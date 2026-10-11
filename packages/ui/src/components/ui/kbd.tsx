import * as React from "react";
import { cn } from "../../lib/cn";

const kbdStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minWidth: 18,
  height: 18,
  padding: "0 4px",
  border: "var(--hg-border-width) solid var(--hg-color-border)",
  borderBottomWidth: 2,
  borderRadius: "var(--hg-radius-sm)",
  background: "var(--hg-color-surface)",
  color: "var(--hg-color-muted)",
  fontFamily: "var(--hg-font-family-sans)",
  fontSize: "var(--hg-font-size-xs)",
  fontWeight: "var(--hg-font-weight-medium)" as React.CSSProperties["fontWeight"],
  lineHeight: 1,
  justifyContent: "center",
};

/** Keyboard key hint, e.g. <Kbd>⌘K</Kbd>. */
export function Kbd({ className, style, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <kbd className={cn(className)} style={{ ...kbdStyle, ...style }} {...props} />;
}
