import { landingConfig } from "@/lib/landing-config";
import { cn } from "@/lib/landing-utils";

/**
 * The artwork behind the hero demo, workflow cards, deep dives, newsroom cards
 * and the closing banner. Fills its nearest positioned ancestor.
 *
 * Renders `theme.backdropImage` when one is set and a built-in gradient
 * otherwise, so the template ships with no image you would need a licence for.
 */
export function Backdrop({ priority = false, className }: { priority?: boolean; className?: string }) {
  const src = landingConfig.theme.backdropImage;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }
  return <div aria-hidden="true" className={cn("landing-backdrop absolute inset-0", className)} />;
}
