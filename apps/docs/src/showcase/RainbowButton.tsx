import * as React from "react";

export type RainbowButtonVariant = "gradient" | "beam";

export interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Gradient cycle time in seconds. Default: 6. */
  speed?: number;
  /** `"gradient"` paints a soft moving rainbow border; `"beam"` runs a single orbiting beam. Default: `"gradient"`. */
  variant?: RainbowButtonVariant;
}

/**
 * A rainbow-accented CTA that matches HeiGin's own button geometry: same
 * radius-md corners, same font and padding scale. Two variants:
 *
 * - `gradient` — a thin moving rainbow border, no outer glow.
 * - `beam` — a single beam that orbits the border (shares technique with Border beam).
 */
export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton(
    { speed = 6, variant = "gradient", style, className, type = "button", children, ...rest },
    ref,
  ) {
    const merged = {
      ...(style ?? {}),
      ["--rbb-duration" as string]: `${speed}s`,
    } as React.CSSProperties;
    return (
      <button
        ref={ref}
        type={type}
        className={["hg-rainbow-button", `hg-rainbow-button--${variant}`, className].filter(Boolean).join(" ")}
        style={merged}
        {...rest}
      >
        <span className="hg-rainbow-button__label">{children}</span>
      </button>
    );
  },
);
