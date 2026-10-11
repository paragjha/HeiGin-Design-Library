import * as React from "react";

const hiddenStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/** Hides content visually while keeping it available to screen readers. */
export function VisuallyHidden({ style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span style={{ ...hiddenStyle, ...style }} {...props} />;
}
