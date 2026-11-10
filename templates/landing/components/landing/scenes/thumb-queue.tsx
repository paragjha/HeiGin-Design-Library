"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mail, Clock, PhoneCall } from "lucide-react";
import { cn } from "@/lib/landing-utils";

/**
 * Newsroom thumbnail: a small Today
 * list where three open loops tick themselves closed one after another.
 * Loops every ~6s. Works at card and hero scales.
 */
interface Row { id: string; icon: typeof Mail; title: string; context: string; due: string }

const rows: Row[] = [
  { id: "a", icon: Mail, title: "Reply to Asha Rao · pricing", context: "Kaveri Textiles", due: "22h open" },
  { id: "b", icon: PhoneCall, title: "Call Divya R · follow-up", context: "Sundaram Mills", due: "today" },
  { id: "c", icon: Clock, title: "Send revised quote · Arjun K", context: "Northwind Traders", due: "overdue" },
];

export function ThumbQueue({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(new Set(rows.map((r) => r.id)));
      return;
    }
    let active = true;
    let timers: number[] = [];
    const schedule = () => {
      if (!active) return;
      timers.forEach(clearTimeout);
      setDone(new Set());
      timers = rows.map((r, i) => window.setTimeout(() => active && setDone((d) => new Set([...d, r.id])), 900 + i * 1100));
      timers.push(window.setTimeout(schedule, 6500));
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { schedule(); io.disconnect(); }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => { active = false; timers.forEach(clearTimeout); io.disconnect(); };
  }, []);

  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center overflow-hidden p-4" data-tone={tone}>
      <div className="w-full max-w-[300px] rounded-xl border border-border bg-surface p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-faint">Needs reply · today</p>
          <span className="rounded-full bg-sidebar px-1.5 py-0.5 text-[9.5px] font-medium text-muted-foreground">{rows.length - done.size}</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {rows.map((r) => {
            const isDone = done.has(r.id);
            const Icon = r.icon;
            return (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 transition-colors duration-500",
                  isDone ? "border-border bg-success-soft-bg/40" : "border-border bg-background"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4 flex-none items-center justify-center rounded border transition-colors",
                    isDone ? "border-success-ink bg-success-ink text-background" : "border-border text-muted-foreground"
                  )}
                >
                  {isDone ? <Check size={9} strokeWidth={3} aria-hidden="true" /> : <Icon size={9} strokeWidth={1.8} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[11.5px] font-medium", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                    {r.title}
                  </p>
                  <p className="truncate text-[10px] text-faint">{r.context}</p>
                </div>
                <span className={cn("shrink-0 text-[10px]", r.due === "overdue" ? "text-danger-ink" : "text-muted-foreground")}>
                  {isDone ? "closed" : r.due}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
