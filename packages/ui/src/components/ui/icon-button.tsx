import * as React from "react";
import { cn } from "../../lib/cn";
import { Button, buttonStyles, type ButtonProps } from "./button";

export interface IconButtonProps extends Omit<ButtonProps, "leadingIcon" | "trailingIcon" | "children" | "fullWidth"> {
  /** Required accessible name: icon-only controls have no visible text. Also shown as a native tooltip. */
  label: string;
  icon: React.ReactNode;
}

/** Square, icon-only button. `label` becomes the accessible name. Defaults to the `ghost` variant. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = "ghost", className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      aria-label={label}
      title={label}
      className={cn(buttonStyles.iconOnly, className)}
      {...props}
    >
      {icon}
    </Button>
  );
});
