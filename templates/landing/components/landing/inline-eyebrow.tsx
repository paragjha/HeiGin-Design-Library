import type { ReactNode } from "react";
import { cn } from "@/lib/landing-utils";

/** The small uppercase label above a headline. */
export function InlineEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.1em] text-faint", className)}>{children}</p>;
}
