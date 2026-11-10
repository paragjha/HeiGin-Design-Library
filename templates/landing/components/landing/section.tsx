import type { ReactNode } from "react";
import { cn } from "@/lib/landing-utils";
import { Reveal } from "./reveal";

/**
 * Section shell with consistent vertical rhythm. Bands alternate white and
 * tint; tint bands carry a hairline so the page reads as one surface.
 *
 * Content fades and rises in once as it scrolls into view. Pass
 * `reveal={false}` for content that should always be visible.
 */
export function Section({
  children,
  className,
  id,
  tone = "white",
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "white" | "tint";
  reveal?: boolean;
}) {
  return (
    <section id={id} className={cn(tone === "tint" ? "border-y border-border bg-tint" : "bg-background", className)}>
      {reveal ? (
        <Reveal className="container-site py-20 md:py-28">{children}</Reveal>
      ) : (
        <div className="container-site py-20 md:py-28">{children}</div>
      )}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">{eyebrow}</p>}
      <h2 className="mt-3 text-balance text-headline text-foreground">{title}</h2>
      {description && <p className="mt-4 text-balance text-subhead text-muted-foreground">{description}</p>}
    </div>
  );
}
