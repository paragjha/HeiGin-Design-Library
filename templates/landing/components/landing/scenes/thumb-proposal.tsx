"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/landing-utils";

/**
 * Newsroom thumbnail: a small animated Copilot
 * proposal card. On scroll-in, a draft materialises, then the Approve
 * button pulses and the card flips to "Confirmed". Loops every ~6s.
 *
 * Designed to work at two scales:
 *  - 4:3 card thumbnail (on /blog grid): roughly 300×225 rendered
 *  - 16:9 article hero: full width with the same content, scaled up
 * `tone="dark"` places the scene on the section backdrop
 * used by the newsroom cards.
 */
export function ThumbProposal({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const [stage, setStage] = useState<"idle" | "drafting" | "ready" | "confirmed">("idle");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStage("confirmed");
      return;
    }
    let active = true;
    let timers: number[] = [];
    const schedule = () => {
      if (!active) return;
      timers.forEach(clearTimeout);
      setStage("idle");
      timers = [
        window.setTimeout(() => active && setStage("drafting"), 600),
        window.setTimeout(() => active && setStage("ready"), 1900),
        window.setTimeout(() => active && setStage("confirmed"), 3400),
        window.setTimeout(schedule, 5800),
      ];
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        schedule();
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => { active = false; timers.forEach(clearTimeout); io.disconnect(); };
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center overflow-hidden p-4" data-tone={tone}>
      <div className="relative w-full max-w-[280px] rounded-xl border border-border bg-surface p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 text-[10.5px]">
          <span className="flex size-5 items-center justify-center rounded-md bg-info-soft-bg text-info-ink">
            <Sparkles size={11} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight text-foreground">Copilot</span>
          <span className="ml-auto text-faint">just now</span>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-foreground">
          {stage === "idle" || stage === "drafting"
            ? "Which leads went cold this week?"
            : "Move 3 cold leads to Sundaram Mills for re-engagement?"}
        </p>
        <div className="mt-2 min-h-[18px] text-[11px] text-muted-foreground">
          {stage === "drafting" && (
            <span className="inline-flex items-center gap-1">
              reviewing <span className="inline-flex gap-0.5"><Dot /><Dot delay={120} /><Dot delay={240} /></span>
            </span>
          )}
          {stage === "ready" && "3 leads · Sundaram Mills · ready for your review"}
          {stage === "confirmed" && "Approved by Meera S · logged on timeline"}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              stage === "confirmed" ? "bg-success-soft-bg text-success-ink" : "bg-foreground text-background",
              stage === "ready" && "motion-safe:animate-[pulse_1.4s_ease-in-out_infinite]"
            )}
          >
            <Check size={11} strokeWidth={2.4} aria-hidden="true" />
            {stage === "confirmed" ? "Confirmed" : "Confirm 3 changes"}
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <X size={11} strokeWidth={2} aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-1 rounded-full bg-muted-foreground motion-safe:animate-[pulse_1.2s_ease-in-out_infinite]"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
