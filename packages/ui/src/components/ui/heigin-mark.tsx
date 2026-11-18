import * as React from "react";

export interface HeiGinMarkProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  /** Width and height in px. Default 20. */
  size?: number;
  /** Draw the mark on its accent tile (default) or as bare strokes in `currentColor`. */
  tile?: boolean;
  /** Accessible name. Leave unset when the mark sits next to the visible word "HeiGin". */
  title?: string;
}

/** The HeiGin mark: two offset bars, on the accent tile by default. Server-component safe. */
export function HeiGinMark({ size = 20, tile = true, title, ...props }: HeiGinMarkProps) {
  const titleId = React.useId();
  const a11y = title ? { role: "img", "aria-labelledby": titleId } : { "aria-hidden": true, focusable: "false" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...a11y} {...props}>
      {title && <title id={titleId}>{title}</title>}
      {tile && <rect width="64" height="64" rx="14" fill="var(--hg-color-accent, #1f1f1f)" />}
      <g
        transform={tile ? "translate(12 12) scale(0.75)" : "translate(5 5) scale(0.9)"}
        stroke={tile ? "var(--hg-color-on-accent, #fff)" : "currentColor"}
        strokeWidth="5.39329"
      >
        <path d="M35.5928 0V35.594" />
        <path d="M17.797 17.797V53.3909" />
      </g>
    </svg>
  );
}
