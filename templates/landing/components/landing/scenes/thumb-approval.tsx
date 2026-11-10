"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Check, Eye, KeyRound } from "lucide-react";
import { cn } from "@/lib/landing-utils";

/**
 * Newsroom thumbnail: a stylised proposal
 * card with a role badge above it and a one-line audit log beneath. On
 * scroll-in, the Approve button pulses and the audit log line adds a
 * timestamp. Loops every ~6s.
 */
export function ThumbApproval({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const [stage, setStage] = useState<"idle" | "pending" | "approved">("idle");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStage("approved");
      return;
    }
    let active = true;
    let timers: number[] = [];
    const schedule = () => {
      if (!active) return;
      timers.forEach(clearTimeout);
      setStage("idle");
      timers = [
        window.setTimeout(() => active && setStage("pending"), 700),
        window.setTimeout(() => active && setStage("approved"), 2600),
        window.setTimeout(schedule, 5600),
      ];
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { schedule(); io.disconnect(); }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => { active = false; timers.forEach(clearTimeout); io.disconnect(); };
  }, []);

  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center overflow-hidden p-4" data-tone={tone}>
      <div className="w-full max-w-[290px] space-y-2">
        {/* Role badge */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <KeyRound size={9} strokeWidth={1.8} aria-hidden="true" />
            Sales Manager · Meera S
          </span>
        </div>

        {/* Proposal card */}
        <div className="rounded-xl border border-border bg-surface p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 text-[10.5px]">
            <span className="flex size-5 items-center justify-center rounded-md bg-info-soft-bg text-info-ink">
              <ShieldCheck size={11} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">Change quotation · Kaveri Textiles</span>
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">
            Sales Agent prepared v4 · payment schedule updated to Net 30.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                stage === "approved" ? "bg-success-soft-bg text-success-ink" : "bg-foreground text-background",
                stage === "pending" && "motion-safe:animate-[pulse_1.4s_ease-in-out_infinite]"
              )}
            >
              <Check size={11} strokeWidth={2.4} aria-hidden="true" />
              {stage === "approved" ? "Approved" : "Approve"}
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
            >
              Reject
            </button>
          </div>
        </div>

        {/* Audit log */}
        <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2 py-1 text-[10px] text-muted-foreground">
          <Eye size={10} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-faint" />
          <span className="truncate">
            Audit log · {stage === "approved" ? "9:12 am · Meera S approved v4" : "admin-only"}
          </span>
        </div>
      </div>
    </div>
  );
}
