import * as React from "react";

export interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Gradient cycle time in seconds. Default: 6. */
  speed?: number;
}

/** A dark CTA button with a moving rainbow accent and glow. */
export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton({ speed = 6, style, className, type = "button", ...rest }, ref) {
    const merged: React.CSSProperties = {
      ...(style ?? {}),
      animationDuration: `${speed}s`,
    };
    return (
      <button
        ref={ref}
        type={type}
        className={["hg-rainbow-button", className].filter(Boolean).join(" ")}
        style={merged}
        {...rest}
      />
    );
  },
);
